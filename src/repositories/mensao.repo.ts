import { DatabaseMap } from "../types/DatabaseMap"
import { FilterQuery } from "../types/FilterQuery"
import queryBuilder from "../core/database/queryBuilder"
import { multiTransaction, query, execute } from "../core/database/mquery"
import { Mensao } from "../types/Mensao"
import updateBuild from "../core/database/updateBuild"

const fields:{[key:string]:string} = {
    id:'mensao.id',
    expressao:'mensao.expressao',
    hashtag:'hashtags.valor',
    monitoramento_id:'mensao.monitoramento_id'
}

const defaultMensao:Mensao = {
    id:0,
    expressao:'',
    hashtags:[]
}

const mapDatabase:DatabaseMap = {
    table:'mensao',
    fields:fields,
    join:['>client', 'hashtags'],
    fieldsSerch:{
        expressao:'mensao.expressao'
    }
}


export default {


    get: async (filter:FilterQuery):Promise<Mensao[]|undefined> => {

        const dataQuery = queryBuilder(mapDatabase, filter)

        if(!dataQuery) return undefined

        const res = await query(dataQuery.query, dataQuery.values)

        if(res.error) return undefined

        const mensoes:{[key:number]:Mensao} = {}

        const rows = res.rows as { id:number, expressao:string, hashtag:string }[]

        for(let row of rows){
            if(!mensoes[row.id]){
                mensoes[row.id] = {
                    id:row.id,
                    expressao: row.expressao,
                    hashtags:[row.hashtag]
                }
                continue
            }
            mensoes[row.id].hashtags.push(row.hashtag)
        }

        return Object.values(mensoes)

    },

    set: async (mensao:Mensao, client_id:number, monitoramento_id:number):Promise<Mensao|false> =>{

        const multi = await multiTransaction()

        const resp = await multi.insertOnce('insert into mensao (client_id, monitoramento_id, expressao) values (?,?,?)', [
            client_id,
            monitoramento_id,
            mensao.expressao
        ])

        if(resp.error){
            await multi.rollBack()
            return false
        }

        mensao.id = resp.lastInsertId

        for(let hashtag of mensao.hashtags){

            const resp2 = await multi.execute('insert into hashtags (mensao_id, client_id, valor) values (?,?,?)', [mensao.id, client_id, hashtag])

            if(resp2.error) {
                await multi.rollBack()
                return false 
            }

        }

        await multi.finish()
        return mensao

    },

    update: async (mensao:Mensao, client_id:number):Promise<boolean> => {

        let execstr = updateBuild(mensao, "mensao", ["id", "client_id"], ['hashtags']);

        const men = mensao as {[key:string]:any}

        const values = Object.keys(mensao)
            .filter(key => key !== "id" && key !== "hashtags" && men[key] !== undefined)
            .map(key => men[key]);

        values.push(mensao.id, client_id)

        let res = await execute(execstr, values)

        return !res.error

    }, 

    del: async (client_id:number, id:number):Promise<boolean> => {

        const multi = await multiTransaction()

        const res1 = await multi.execute('delete from hashtags where mensao_id = ?', [id])
        if(res1.error){
            await multi.rollBack()
            return false
        }

        const res2 = await multi.execute('delete from mensao where id = ? and client_id = ?', [id, client_id])
        if(res2.error){
            await multi.rollBack()
            return false 
        }

        await multi.finish()
        return true

    }


}