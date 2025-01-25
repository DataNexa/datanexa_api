import { User, UserDetail, user_type } from "../../types/User";
import { query, insertOnce, multiTransaction, MultiTransaction } from './mquery'
import UserFactory from "../auth/UserFactory";

async function getUser(user_id:number, client_id?:number):Promise<User> {

    let q = ''
    
    if(client_id){
        q = `
            select 
                user_detail.nome as nome,
                user_detail.email as email,
                user.id as id,
                user.vtoken as vtoken,
                user.type as type,
                user_client.client_id as client_id
            from user 
            join
                user_detail on user_detail.user_id = user.id
            join 
                user_client on user_client.user_id = user.id 
            where 
                user.id = ${user_id} and user_client.client_id = ${client_id}
        `            
    } else {
        q = `
            select 
                user_detail.nome as nome,
                user_detail.email as email,
                user.id as id,
                user.vtoken as vtoken,
                user.type as type
             from user
             join
                user_detail on user_detail.user_id = user.id
             where 
                user.id = ${user_id}
        `   
    }

    const res = await query(q)

    if(!res.error){
        let rows = res.rows as any[]
        if(rows.length == 0) return UserFactory.AnonUser
        let u = rows[0] 
        return client_id || u['type'] == 2 ? u as UserDetail : u as User
    }

    return UserFactory.AnonUser

}


async function saveUserBOT(user:User){

    const res = await insertOnce(`
        insert into user(type, vtoken) values (?,?,?)
    `, [user.type, user.vtoken])

    if(res.error) return false
    
    user.id = res.lastInsertId
    
    return user

}


async function saveUserClient(multi:MultiTransaction, user:UserDetail){

    const res3 = await multi.insertOnce(`
        insert into user_client(user_id, client_id) values (?,?)    
    `, [user.id, user.client_id])
    
    return !res3.error

}


async function saveUserDetail(user:UserDetail){
    
    const multi = await multiTransaction()

    const res = await multi.insertOnce(`
        insert into user(type, vtoken) values (?,?,?)
    `, [ user.type, user.vtoken])
    
    if(res.error) {
        await multi.rollBack()
        return false
    }

    user.id = res.lastInsertId

    const res2 = await multi.insertOnce(`
        insert into user_detail(user_id, nome, email) values (?,?,?)    
    `, [user.id, user.nome, user.email])
    
    if(res2.error) {
        await multi.rollBack()
        return false
    }

    if(user.type == 1 && !await saveUserClient(multi, user)){
        await multi.rollBack()
        return false
    }

    await multi.finish()
    return user

}

export default { saveUserBOT, saveUserDetail, getUser }