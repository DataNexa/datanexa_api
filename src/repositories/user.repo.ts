import { execute, query, multiTransaction, MultiTransaction } from "../util/query"
import { type_user } from "../libs/User"
import { result_exec } from "./repositories"
import { account_repo } from "./account.repo"

interface user_basic_response { tipo_usuario: type_user, slug:string, accepted:number, client_slug:string|null, client_nome:string|null }
interface user_basic_response_literal { tipo_usuario: string, slug:string, accepted:number, client_slug:string|null, client_nome:string|null }

interface user_complete {
    id:number,
    nome:string,
    tipo_usuario: type_user,
    slug:string,
    accepted:number,
    email:string,
    ativo:number,
    client_slug:string,
    client_nome:string,
    permissions?:number[]
}

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
    client_nome?:string|null,
    client_slug?:string|null,
    permissions:string[]
}

interface permission_i {
    nome:string, 
    actions:Array<{nome:string, descricao:string, checked:boolean, id:number}>
}

interface response_unique_i {
    permissions?:permission_i[],
    user?:user_complete,
    status:boolean,
    code:number,
    message:string
}

const listPermissions = async (conn?:MultiTransaction) => {

    const queryPermissions = conn ? await conn.query(`
        select 
            service_actions.id as id,
            services.nome as nome_service,
            service_actions.nome as nome_action,
            service_actions.descricao as descricao
        from 
            service_actions 
        join
            services on service_actions.service_id = services.id
        order by service_actions.slug
    `) : await query(`
        select 
            service_actions.id as id,
            services.nome as nome_service,
            service_actions.nome as nome_action,
            service_actions.descricao as descricao
        from 
            service_actions 
        join
            services on service_actions.service_id = services.id
        order by service_actions.slug
    `)

    if(queryPermissions.error){
        return []
    }

    const permissions = [] as permission_i[]
    let atualName = ''
    let atualKey  = -1
    const rows = queryPermissions.rows as any[]

    for(const row of rows) {
        if(row.nome_service != atualName){
            atualKey++
            atualName = row.nome_service 
            permissions.push({
                nome:row.nome_service,
                actions:[]
            })
        }
        permissions[atualKey].actions.push({
            nome:row.nome_action,
            id:row.id,
            descricao:row.descricao,
            checked:false
        })
    }

    return permissions
}

const user_repo = {
    
    listPermissionsSystem: async ():Promise<permission_i[]> => {
        return await listPermissions()
    },

    uniqueByClient: async (client_id:number, user_id:number):Promise<response_unique_i> => {

        const conn = await multiTransaction()

        const permissions = await listPermissions(conn)

        const resList = await conn.query(`
            select 
                user_permission.service_action_id as action_id,
                user.id, account.nome,
                user.tipo_usuario, user.slug, user.accepted,
                account.email, user.ativo,
                client.slug as client_slug, client.nome as client_nome
            from 
                user_permission
            join user on user_permission.user_id = user.id
            join account on user.account_id = account.id
            join user_client on user.id = user_client.user_id 
            join client on client.id    = user_client.client_id
                where user_client.client_id = ?
                and user_permission.user_id = ?; 
        `,{
            binds:[client_id, user_id]
        })

        if(resList.error){
            await conn.rollBack()
            return {
                status:false,
                code:500,
                message:'Erro no servidor'
            }
        }

        let user_resp = (resList.rows as any[])

        if(user_resp.length == 0) {

            const oneMore = await conn.query(`
                select 
                    user.id, account.nome,
                    user.tipo_usuario, user.slug, user.accepted,
                    account.email, user.ativo,
                    client.slug as client_slug, client.nome as client_nome
                from user 
                join account on user.account_id = account.id
                join user_client on user.id = user_client.user_id 
                join client on client.id    = user_client.client_id
                    where user_client.client_id = ?
                    and user.id = ?; 
            `, {
                binds:[client_id, user_id]
            })

            if(oneMore.error || (oneMore.rows as any[]).length == 0){
                await conn.rollBack()
                return {
                    status:false,
                    code:404,
                    message:'Usuário não encontrado'
                }
            }

            const data_ini = (oneMore.rows as any)[0]

            const user:user_complete = {
                id:data_ini.id,
                nome:data_ini.nome,
                tipo_usuario:data_ini.tipo_usuario,
                slug:data_ini.slug,
                accepted:data_ini.accepted,
                client_nome:data_ini.client_nome,
                client_slug:data_ini.client_slug,
                email:data_ini.email,
                ativo:data_ini.ativo,
                permissions:[]
            }

            await conn.finish()

            return {
                status:true,
                code:200,
                user:user,
                permissions:permissions,
                message:''
            }

        } else {

            const data_ini = user_resp[0]

            const user:user_complete = {
                id:data_ini.id,
                nome:data_ini.nome,
                tipo_usuario:data_ini.tipo_usuario,
                slug:data_ini.slug,
                accepted:data_ini.accepted,
                client_nome:data_ini.client_nome,
                client_slug:data_ini.client_slug,
                email:data_ini.email,
                ativo:data_ini.ativo,
                permissions:[]
            }

            await conn.finish()

            for(const u of user_resp){
                user.permissions?.push(u.action_id)
            }

            return {
                status:true,
                code:200,
                user:user,
                permissions:permissions,
                message:''
            }

        }

        

    },

    listByClient: async (client_id:number):Promise<user_complete[]|false> => {

        const conn = await multiTransaction()

        const resList = await conn.query(`
            select 
                user.id, account.nome,
                user.tipo_usuario, user.slug, user.accepted,
                account.email, user.ativo,
                client.slug as client_slug, client.nome as client_nome
            from user 
            join account on user.account_id = account.id
            join user_client on user.id = user_client.user_id 
            join client on client.id    = user_client.client_id
                where user_client.client_id = ?
        `,{
            binds:[client_id]
        })

        const list  = (resList.rows as user_complete[])
    
        await conn.finish()

        return resList.error ? false : list   

    },

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
                client.nome as client_nome,
                client.slug as client_slug,
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