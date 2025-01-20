import { query, multiTransaction, execute } from "../util/query"


export default {


    getTokens: async (client_id:number, permission:string):Promise<{ error:boolean, body?: any[], message?:string }>  => {

        const resp = await query(`
            SELECT 
                DISTINCT tpd.token
                
            FROM user_client uc
                JOIN user u ON uc.user_id = u.id
                JOIN token_push_notifications_device tpd ON u.id = tpd.token_device_account_id
                LEFT JOIN user_permission up ON u.id = up.user_id
                LEFT JOIN service_actions sa ON up.service_action_id = sa.id

            WHERE 
                uc.client_id = ?
                AND tpd.ativo = 1
                AND u.ativo = 1
                AND (
                        u.tipo_usuario = 3 
                        OR (sa.slug = ?)
                    )

            LIMIT 500;
        `, {
            binds:[client_id, permission]
        })

        if(resp.error){
            return resp
        }

        return {
            error: false,
            body: resp.rows as any[]
        }


    },


    saveToken: async (device_id:number, token:string):Promise<boolean> => {

        const resp = await execute(`
            insert into token_push_notifications_device 
                ( token_device_account_id, token, ativo )
            values
                ( ${device_id}, '${token}', 1 )
        `)

        return resp.error

    },
    

    list: async (user_id:number, device_id:number):Promise<{ error:boolean, body?: any[], message?:string }> => {

        const resp = await query(`
            select 
                notification_messages.enviado_em,
                notification_messages.titulo,
                notification_messages.msg,
                notification_messages.lido
            from notification_messages
                join token_push_notifications_device on token_push_notifications_device.id = notification_messages.token_push_notifications_device_id
                join token_device_account on token_push_notifications_device.token_device_account_id = token_device_account.id
            where notification_messages.user_id = ? 
              and token_device_account.id       = ?
            order 
               by notification_messages.enviado_em desc limit 50
        `, {
            binds:[user_id, device_id]
        })

        if(resp.error){
            return resp
        }

        return {
            error: false,
            body: resp.rows as any[]
        }

    }

}