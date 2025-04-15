
import JWT from "../core/auth/JWT"
import { execute, multiTransaction, query } from "../core/database/mquery"
import { User, UserDetail } from "../types/User"
import password from "../util/password"


const getUserByEmailAndPass = async (email:string, senha:string, device:string, ip:string):Promise<{user: UserDetail|undefined, hash:string}|undefined> => {

    const multi = await multiTransaction()

    const q = await multi.query(`
            select 
                user.id as id,
                user.vtoken as vtoken,
                user.type as type,
                user_detail.nome as nome,
                user_detail.email as email,
                user_detail.user_image as picture,
                user_detail.senha as senha,
                user_client.client_id as client_id
            from 
                user
            join
                user_detail on user_detail.user_id = user.id 
            left join 
                user_client on user.id = user_client.user_id
            where
                user_detail.email = '${email}'

    `)

    if(q.error || (q.rows as any[]).length == 0) {
        await multi.rollBack()
        return undefined
    }

    const userDB = (q.rows as any[])[0]

    if(!await password.comparePass(senha, userDB.senha)){
        await multi.rollBack()
        return undefined
    }

    const hash = JWT.generateHash(userDB.id.toString()+email+device+ip)

    const q2 = await multi.insertOnce(`
            insert into user_device (user_id, device, ip, hash_device)
            values (?,?,?,?)
        `, [userDB.id, device, ip, ''])
    
    if(q2.error){
        await multi.rollBack()
        return undefined
    }

    const q3 = await multi.insertOnce(`
            insert into user_refresh_token (user_device_id, refresh_token) 
            values (?,?)
        `, [q2.lastInsertId, hash])

    if(q3.error){
        await multi.rollBack()
        return undefined
    }

    await multi.finish()    

    userDB.senha = ""

    if(!userDB.client_id){
        userDB.client_id = 0
    }

    return { user: userDB as UserDetail, hash: hash} 

}

const saveDeviceAndGenerateTokenRefresh = async (user_id:number, email:string, device:string, ip:string):Promise<string|undefined> => {

    const multi = await multiTransaction()

    const hash = JWT.generateHash(user_id.toString()+email+device+ip)

    const q2 = await multi.insertOnce(`
            insert into user_device (user_id, device, ip, hash_device)
            values (?,?,?,?)
        `, [user_id, device, ip, ''])
    
    if(q2.error){
        await multi.rollBack()
        return undefined
    }

    const q3 = await multi.insertOnce(`
            insert into user_refresh_token (user_device_id, refresh_token) 
            values (?,?)
        `, [q2.lastInsertId, hash])

    if(q3.error){
        await multi.rollBack()
        return undefined
    }

    await multi.finish()  
    return hash
}


const getUserByEmail = async (email:string):Promise<UserDetail|undefined> => {
    
    const q = await query(`
            select 
                user.id as id,
                user.vtoken as vtoken,
                user.type as type,
                user_detail.nome as nome,
                user_detail.email as email,
                user_detail.user_image as picture,
                user_client.client_id as client_id
            from 
                user
            join
                user_detail on user_detail.user_id = user.id 
            left join 
                user_client on user.id = user_client.user_id
            where
                user_detail.email = '${email}'

    `)

    if(q.error || (q.rows as any[]).length == 0) {
        return undefined
    }

    const userDB = (q.rows as any[])[0]

    return userDB as UserDetail

}


const getUserByRefreshToken = async (refresh_token:string):Promise<UserDetail|undefined> => {

    const q = await query(`
            select 
                user.id as id,
                user.vtoken as vtoken,
                user.type as type,
                user_detail.nome as nome,
                user_detail.email as email,
                user_detail.senha as senha,
                user_detail.user_image as picture,
                user_client.client_id as client_id
            from 
                user
            join
                user_detail on user_detail.user_id = user.id 
            join 
                user_device on user_device.user_id = user.id
            join 
                user_refresh_token on user_refresh_token.user_device_id = user_device.id
            left join 
                user_client on user.id = user_client.user_id

            where user_refresh_token.refresh_token = ?
        `, [refresh_token])

    if(q.error || (q.rows as any[]).length == 0) {
        return undefined
    }

    const userDB = (q.rows as any[])[0]

    return userDB as UserDetail

}

const saveUserAdmin = async (nome:string, email:string, image:string, senha:string):Promise<UserDetail|false> => {

    const multi = await multiTransaction()

    const res = await multi.insertOnce(`
            insert into user (type) values (?)
        `, [2])

    if(res.error){
        await multi.rollBack()
        return false
    }

    const user_id = res.lastInsertId
    const senhaEncriptada = await password.encriptPass(senha)

    const res2 = await multi.insertOnce(`
            insert into user_detail (user_id, user_image, nome, email, senha) 
            values (?,?,?,?,?)       
        `, [user_id, image, nome, email, senhaEncriptada])

    if(res2.error){
        await multi.rollBack()
        return false
    }

    await multi.finish()

    return {
        client_id:0,
        nome:nome,
        email:email,
        picture:image,
        type:2,
        vtoken:0,
        id:user_id
    }

}


const saveUserClient = async (nome:string, email:string, image:string, senha:string, client_id:number = 0 ):Promise<UserDetail|false> => {

    const multi = await multiTransaction()

    const res = await multi.insertOnce(`
            insert into user (type) values (?)
        `, [1])

    if(res.error){
        await multi.rollBack()
        return false
    }

    const user_id = res.lastInsertId
    const senhaEncriptada = await password.encriptPass(senha)

    const res2 = await multi.insertOnce(`
            insert into user_detail (user_id, user_image, nome, email, senha) 
            values (?,?,?,?,?)       
        `, [user_id, nome, email, senhaEncriptada])

    if(res2.error){
        await multi.rollBack()
        return false
    }

    if(client_id > 0){

        const res3 = await multi.insertOnce(`
            insert into user_client (user_id, client_id)
            values (?,?)
        `, [user_id, client_id])

        if(res3.error){
            await multi.rollBack()
            return false 
        }

    }
    
    await multi.finish()

    return {
        id:user_id,
        vtoken:0,
        client_id:client_id,
        picture:image,
        nome:nome,
        email:email,
        type:1
    }

}


const deleteUser = async (user_id:number) => {

    const multi = await multiTransaction()

    if((await multi.execute(`
        delete from user_client where user_id = ${user_id}
    `)).error){
        multi.rollBack()
        return false
    }

    if((await multi.execute(`
        delete from user_detail where user_id = ${user_id}
    `)).error){
        multi.rollBack()
        return false
    }

    if((await multi.execute(`
        delete from user_device where user_id = ${user_id}
    `)).error){
        multi.rollBack()
        return false
    }

    if((await multi.execute(`
        delete from user_code where user_id = ${user_id}
    `)).error){
        multi.rollBack()
        return false
    }

    if((await multi.execute(`
        delete from user where id = ${user_id}
    `)).error){
        multi.rollBack()
        return false
    }

    await multi.finish()
    return true

}

const getUserById = async (user_id:number):Promise<User|UserDetail|undefined> => {

    const q = await query(`
            select 
                user.id as id,
                user.vtoken as vtoken,
                user.type as type,
                user_detail.nome as nome,
                user_detail.email as email,
                user_client.client_id as client_id
            from 
                user
            left join
                user_detail on user_detail.user_id = user.id 
            left join 
                user_client on user.id = user_client.user_id
            where
                user.id = ${user_id}

    `)

    if(q.error || (q.rows as any[]).length == 0) return undefined

    const data = (q.rows as any[])[0]
    
    if(data['type'] == 2){
        data['client_id'] = 0
        return data as UserDetail
    }

    if(data['type'] == 1){
        return data as UserDetail
    }

    return data as User

}

const saveCodeUser = async (code:string, user_id:number) => {

    const createin = new Date()
    const expirein = createin.getTime() + (3600000 * 1)
    const created  = createin.toISOString().slice(0, 19).replace('T', ' ')
    const expired  = new Date(expirein).toISOString().slice(0, 19).replace('T', ' ')

    return !(await execute(`
        insert into user_code (user_id, create_at, expire_in, code)
        values (?,?,?,?)
        `, [user_id, created, expired, code])).error

}


const consumeCode =  async (code:string, user_id:number) => {

    const mult  = await multiTransaction()
    const agora = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if((await mult.query(`
            select id from user_code 
            where 
                user_id = ? and code = ? 
                and expire_in > ?
                and used = 0
        `, [user_id, code, agora])).error){
            await mult.rollBack()
            return false
        }

    if((await mult.execute(`
            update user_code set used = 1
            where user_id = ?
        `, [user_id])).error){
            await mult.rollBack()
            return false
        }

    if((await mult.execute(`
            update user set vtoken = vtoken + 1 
            where id = ?
        `, [user_id])).error){
            await mult.rollBack()
            return false
        }

    if((await mult.execute(`
            delete from user_device where user_id = ?
        `, [user_id])).error){
            await mult.rollBack()
            return false
        }
    
    await mult.finish()
    return true

}


const updatePass = async (user_id:number, newpass:string):Promise<boolean> => {

    const multi = await multiTransaction()

    const q = await multi.query(`
            select 
                user.id as id,
                user.vtoken as vtoken,
                user.type as type,
                user_detail.id as user_detail_id,
                user_detail.nome as nome,
                user_detail.email as email,
                user_detail.senha as senha,
                user_client.client_id as client_id
            from 
                user
            join
                user_detail on user_detail.user_id = user.id 
            left join 
                user_client on user.id = user_client.user_id
            where
                user.id = '${user_id}'

    `)

    if(q.error || (q.rows as any[]).length == 0) {
        await multi.rollBack()
        return false
    }

    const userDB = (q.rows as any[])[0]

    const npass = await password.encriptPass(newpass)    

    const q2 = await multi.execute(`
            update user_detail set senha = ?
            where id = ?
        `, [npass, userDB.user_detail_id])

    if(q2.error){
        await multi.rollBack()
        return false
    }

    await multi.finish()
    return true

}


export default { 
    getUserByEmailAndPass, 
    saveUserClient, 
    deleteUser, 
    saveUserAdmin, 
    getUserById, 
    getUserByRefreshToken, 
    saveCodeUser, 
    consumeCode, 
    getUserByEmail,
    updatePass,
    saveDeviceAndGenerateTokenRefresh
}