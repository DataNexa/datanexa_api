
import { multiTransaction, query } from "../core/database/mquery"
import { User, UserDetail } from "../types/User"
import password from "../util/password"


const getUserByEmailAndPass = async (email:string, senha:string):Promise<UserDetail|undefined> => {

    const q = await query(`
            select 
                user.id as id,
                user.vtoken as vtoken,
                user.type as type,
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
                user_detail.email = '${email}'

    `)

    if(q.error || (q.rows as any[]).length == 0) return undefined

    const userDB = (q.rows as any[])[0]

    if(!await password.comparePass(senha, userDB.senha)){
        return undefined
    }

    userDB.senha = ""

    if(!userDB.client_id){
        userDB.client_id = 0
    }

    return userDB as UserDetail

}

const saveUserAdmin = async (nome:string, email:string, senha:string):Promise<UserDetail|false> => {

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
            insert into user_detail (user_id, nome, email, senha) 
            values (?,?,?,?)       
        `, [user_id, nome, email, senhaEncriptada])

    if(res2.error){
        await multi.rollBack()
        return false
    }

    await multi.finish()

    return {
        client_id:0,
        nome:nome,
        email:email,
        type:2,
        vtoken:0,
        id:user_id
    }

}


const saveUserClient = async (client_id:number, nome:string, email:string, senha:string ):Promise<UserDetail|false> => {

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
            insert into user_detail (user_id, nome, email, senha) 
            values (?,?,?,?)       
        `, [user_id, nome, email, senhaEncriptada])

    if(res2.error){
        await multi.rollBack()
        return false
    }

    const res3 = await multi.insertOnce(`
            insert into user_client (user_id, client_id)
            values (?,?)
        `, [user_id, client_id])

    if(res3.error){
        await multi.rollBack()
        return false 
    }

    await multi.finish()

    return {
        id:user_id,
        vtoken:0,
        client_id:client_id,
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



export default { getUserByEmailAndPass, saveUserClient, deleteUser, saveUserAdmin, getUserById }