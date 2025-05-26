import { execute, insertOnce, multiTransaction } from "../core/database/mquery"
import { Client, ClientConfig } from "../types/Client"

export default {

    set: async (client:Client) => {

        const res = await insertOnce(`insert into client (nome) values (?)`, [client.nome])
        if(res.error){
            return false 
        }

        client.id = res.lastInsertId
        return client

    },

    addClientConfig: async (clientId:number, config:ClientConfig) => {

        const conn = await multiTransaction()

        const instagramAppIdQuery = await conn.query(`select id from instagram_app where used = 0 limit 1`)

        if(instagramAppIdQuery.error){
            await conn.rollBack()
            return false
        }

        const rows = instagramAppIdQuery.rows as { id:number }[]

        if(rows.length === 0){
            await conn.rollBack()
            return false
        }

        const res1 = await conn.execute(`update instagram_app set used = 1 where id = ?`, [rows[0].id])

        if(res1.error){
            await conn.rollBack()
            return false
        }

        const res = await conn.insertOnce(
            `insert into client_config (client_id, max_monitoramentos_ativos, instagram_app_id) values (?, ?, ?)`,
            [clientId, config.max_monitoramentos_ativos, rows[0].id]
        )

        if(res.error){
            await conn.rollBack()
            return false
        }

        config.instagram_app_id = rows[0].id
        config.id = res.lastInsertId

        await conn.finish()
        return config

    },

    getClientConfig: async (clientId:number) => {
        
        const res = await execute(
            `select * from client_config where client_id = ?`,
            [clientId]
        )

        if(res.error) return false
        return res.rows as ClientConfig[]

    },

    updateClientConfig: async (clientId:number, config:ClientConfig) => {
        
        const res = await execute(
            `update client_config set max_monitoramentos_ativos = ?, instagram_app_id = ? where client_id = ?`,
            [config.max_monitoramentos_ativos, config.instagram_app_id, clientId]
        )

        return !res.error
    },

    updateClient: async (client:Client) => { 
        const res = await execute(`update client set nome = ? where id = ?`, [client.nome, client.id])
        return !res.error
    },

    del: async (id:number) => {

        const conn = await multiTransaction()

        const res1 = await conn.execute(`delete from client_config where client_id = ?`, [id])
        if(res1.error) {
            await conn.rollBack()
            return false
        }

        const res2 = await conn.execute(`delete from client where id = ?`, [id])
        if(res2.error) {
            await conn.rollBack()
            return false
        }

        await conn.finish()
        return true

    }

}