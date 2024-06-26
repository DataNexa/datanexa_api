import { execute, query, multiTransaction } from "../util/query"
import { type_user } from "../libs/User"
import { result_exec } from "./repositories"
import { account_repo } from "./account.repo"

interface user_basic_response { tipo_usuario: type_user, slug:string, accepted:number, client_slug:string|null, client_nome:string|null }
interface user_basic_response_literal { tipo_usuario: string, slug:string, accepted:number, client_slug:string|null, client_nome:string|null }

interface user_token_account {
    email:string,
    user_id: number,
    slug: string,
    tipo_usuario: type_user,
    nome: string,
    vtoken: number,
    hash_salt: string,
    ativo:number,
    accepted:number,
    client_id?:number|null,
    permissions:string[]
}

const user_repo = {
    
    list:async (account_id:number):Promise<user_basic_response_literal[]|false> => {

        const conn = await multiTransaction()

        const resList = await conn.query(`
            select 
                user.tipo_usuario, user.slug, user.accepted,
                client.slug as client_slug, client.nome as client_nome
            from user 
            left join user_client on user.id = user_client.user_id 
            left join client on client.id    = user_client.client_id
                where user.account_id = ? and user.ativo = 1 and user.accepted < 2
        `,{
            binds:[account_id]
        })

        const list  = (resList.rows as user_basic_response[])
        const lires:user_basic_response_literal[] = [] 

        await conn.finish()

        for(let item of list){
            lires.push({
                tipo_usuario:type_user[item.tipo_usuario],
                slug:item.slug,
                accepted:item.accepted,
                client_nome:item.client_nome,
                client_slug:item.client_slug
            })
        }

        return resList.error ? false : lires      

    },

    getUserByTokenDevice: async (token_device_id:number, user_account:number, slug:string):Promise<user_token_account|undefined> => {

        const conn = await multiTransaction()

        const resUser = await conn.query(`
            select 
                user.id as user_id, user.slug, user.ativo, user.accepted, user.tipo_usuario, 
                client.id as client_id,
                account.nome, account.email,
                token_account.vtoken, token_device_account.hash_salt
            from 
                user
            join account on account.id = user.account_id
            join token_account on token_account.account_id = account.id
            join token_device_account on token_device_account.token_account_id = token_account.id
            left join user_client on user.id = user_client.user_id 
            left join client on user_client.client_id = client.id
            where 
                token_device_account.id = ? and account.id = ? and user.slug = ?

        `, { binds: [token_device_id, user_account, slug]})

        if(resUser.error) {
            await conn.finish()
            return undefined
        }
            

        const result = (resUser.rows as user_token_account[])

        if(result.length == 0){
            await conn.finish()
            return undefined
        }

        const user_full = result[0]

        const permissionsSel = await conn.query(`
            select service_actions.slug
              from user_permission
                join 
                    service_actions on user_permission.service_action_id = service_actions.id
                join
                    services on service_actions.service_id = services.id
            where 
                user_permission.user_id = ? and services.is_public = 1 and service_actions.ativo = 1    
        `, {
            binds:[user_full.user_id]
        })

        await conn.finish()

        let permissions = permissionsSel.rows as {slug:string}[]
        user_full.permissions = permissions.length == 0 ? [] : permissions.map(val => val.slug)

        return user_full

    },

    getDataFromSession: async (user_id:number):Promise<user_token_account|undefined> => {
        
        const conn = await multiTransaction()

        const respReqUser = await conn.query(`
        select 
                user.id as user_id, user.slug, user.ativo, user.accepted, user.tipo_usuario, 
                account.nome, account.email,
                token_account.vtoken, token_device_account.hash_salt
            from 
                user
            join account on account.id = user.account_id
            join token_account on token_account.account_id = account.id
            join token_device_account on token_device_account.token_account_id = token_account.id
            where 
                user.id = ?
        `, { binds: [ user_id ]})
        
        const dataResp = respReqUser.rows as user_token_account[]

        if(respReqUser.error || dataResp.length == 0) {
            await conn.finish()
            return undefined
        }

        return dataResp[0]

    },


    blockUser: async (blocked:boolean, user_id:number, client_id?:number) => {

        const conn = await multiTransaction()

        if(client_id){
            const respquser = await conn.query(`select id from user_client where user_id = ${user_id} and client_id = ${client_id}`)
            if(respquser.error || (respquser.rows as any[]).length == 0){
                await conn.rollBack()
                return false
            }
        }

        let status = !(await execute(`update user set ativo = ${blocked ? 0 : 1} where id = ${user_id}`)).error
        if(!status){
            conn.rollBack()
        } else {
            conn.finish()
        }
        return conn
    },

    update:async (permissions:number[], user_id:number) => {

        const conn = await multiTransaction()

        const respexec = await conn.execute('delete from user_permission where user_id = '+user_id)

        if(respexec.error){
            await conn.rollBack()
            return false
        }

        let insert = "insert into user_permission(user_id, service_action_id) values "
        let values = ""
        for(const permission of permissions){
            values += `(${user_id},${permission}),`
        }

        let status = !(await conn.execute(insert+values.substring(0, values.length - 1))).error
        if(status) await conn.finish()

        return status

    },

    register: async (slug:string, permissions:number[], email:string, tipo_usuario:type_user, client_id?:number) => {

        const conn = await multiTransaction()

        const resp = await conn.query('select id from account where email = ?', {
            binds:[email]
        })
        
        let account_id = 0

        if(resp.error){
            await conn.rollBack()
            return false
        } 
            

        if((resp.rows as any[]).length == 0){
            
            let idResp = (await account_repo.registerTemp(email, conn)).insertId

            if(!idResp){
                await conn.rollBack()
                return false
            }
            
            account_id = idResp

        } else {
            account_id = (resp.rows as {id:number}[])[0].id
        }

        if(client_id){
            const respCheckAcc = await conn.query(`
                select 
                        account.id 
                    from account 
                    join user on user.account_id            = account.id 
                    join user_client on user_client.user_id = user.id 
                where 
                         user.tipo_usuario     = ${tipo_usuario} 
                     and user_client.client_id = ${client_id} 
                     and account.id            = ${account_id}           
            `)
            if((respCheckAcc.rows as any[]).length > 0){
                await conn.rollBack()
                return false
            }
        }

        // salva usuario

        const saveUser = await conn.execute(`
            insert into user(slug, account_id, ativo, tipo_usuario, accepted) 
            values (?,?,?,?,?)
        `, {
            binds:[slug, account_id, 1, tipo_usuario, 0]
        })


        if(saveUser.error){
            await conn.rollBack()
            return false
        }

        const user_id = (saveUser.rows as result_exec).insertId

        // vincula o usuário ao cliente se houver

        if(client_id){

            const clientuserExec = await conn.execute(`
                insert into user_client (user_id, client_id) values (${user_id}, ${client_id})
            `)

            if(clientuserExec.error){
                await conn.rollBack()
                return false
            }

        }

        // salva as permissoes publicas
        
        if(permissions.length > 0){

            let insert = "insert into user_permission (user_id, service_action_id) values "
            let values = ""

            for (const permission_id of permissions){
                values += `(${user_id}, ${permission_id}),`
            }

            insert += values.substring(0, values.length - 1)
            
            const savePermissions = await conn.execute(insert)
            if(savePermissions.error) {
                await conn.rollBack()
                return false
            }
                
            
        }
        
        await conn.finish()

        return true
        
    },

    acceptOrDecline: async (slug_user:string, accepted:number) => {
        return await execute(`
            update user set accepted = ? where slug = ?
        `, {
            binds:[accepted, slug_user]
        })
    }

}

export { user_repo, user_token_account }