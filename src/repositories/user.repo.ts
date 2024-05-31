import { execute, query } from "../util/query"
import { type_user } from "../model/User"

interface user_basic_response { slug:string, accepted:number }

interface user_token_account {
    email:string,
    id: number,
    slug: string,
    tipo_usuario: type_user,
    nome: string,
    vtoken: number,
    hash_salt: string,
    ativo:number,
    accepted:number
}

const user_repo = {
    
    list:async (account_id:number):Promise<user_basic_response[]|false> => {

        const resList = await query('select slug, accepted from user where account_id = ? and ativo = 1',{
            binds:[account_id]
        })

        return resList.error ? false : (resList.rows as user_basic_response[])        

    },

    getUserByTokenDevice: async (token_device_id:number, user_account:number, slug:string):Promise<user_token_account|undefined> => {

        const resUser = await query(`
            select 
                user.id, user.slug, user.ativo, user.accepted, user.tipo_usuario, 
                account.nome, account.email,
                token_account.vtoken, token_device_account.hash_salt
            from 
                user
            join account on account.id = user.account_id
            join token_account on token_account.account_id = account.id
            join token_device_account on token_device_account.token_account_id = token_account.id
            where 
                token_device_account.id = ? and account.id = ? and user.slug = ?

        `, { binds: [token_device_id, user_account, slug]})

        if(resUser.error) return undefined

        const result = (resUser.rows as user_token_account[])

        return result.length == 0 ? undefined : result[0]
        
    },

    getDataFromSession: async (user_id:number):Promise<user_token_account|undefined> => {

        const respReqUser = await query(`
        select 
                user.id, user.slug, user.ativo, user.accepted, user.tipo_usuario, 
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

        if(respReqUser.error || dataResp.length == 0) return undefined

        return dataResp[0]

    }

}

export { user_repo }