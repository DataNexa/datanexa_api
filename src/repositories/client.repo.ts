import { execute, insertOnce } from "../core/database/mquery"



export default {

    set: async (client:Client) => {

        const res = await insertOnce(`insert into client (nome) values (?)`, [client.nome])
        if(res.error){
            return false 
        }

        client.id = res.lastInsertId
        return client

    },

    del: async (id:number) => {

        const res = await execute(`delete from client where id = ?`, [id])
        return !res.error

    }

}