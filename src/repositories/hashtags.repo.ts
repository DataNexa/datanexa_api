import { DatabaseMap } from "../types/DatabaseMap"
import { FilterQuery } from "../types/FilterQuery"
import { Hashtag } from "../types/Hashtag"
import queryBuilder from "../core/database/queryBuilder"
import { execute, insertOnce, query } from "../core/database/mquery"

const fields:{[key:string]:string} = {
    id:'hashtags.id',
    valor:'hashtags.valor',
    client_id:'client.id',
    mensao_id:'hashtags.mensao_id'
}

const mapDatabase:DatabaseMap = {
    table:'hashtags',
    fields:fields,
    join:['>client'],
    fieldsSerch:{
        valor:'hashtags.valor'
    }
}

const defaultHashtag:Hashtag = {
    id:0,
    valor:''
}

export default {

    get: async (filter:FilterQuery):Promise<Hashtag[] | undefined> => {
        
        const dataQuery = queryBuilder(mapDatabase, filter)
        if(!dataQuery) return undefined
        
        const res = await query(dataQuery.query, dataQuery.values)
        
        if(res.error){
            return undefined
        }
    
        const hashtags = (res.rows as any[]).map(data => ({
            ...defaultHashtag,
            ...data
          })) as Hashtag[]
        
        return hashtags

    },

    set: async (valor:string, mensao_id:number, client_id:number):Promise<false|Hashtag> => {

        const hashtag:Hashtag = {
            id:0,
            valor:valor
        }

        const res = await insertOnce(`insert into hashtags (valor, mensao_id, client_id) values (?,?,?)`, [valor,mensao_id,client_id])
        if(res.error) return false 

        hashtag.id = res.lastInsertId

        return hashtag

    },

    del: async (hashtag_id:number, mensao_id:number, client_id:number) => {

        return !(await execute(`delete from hashtags where id = ? and mensao_id = ? and client_id = ?`, [hashtag_id, mensao_id, client_id])).error

    }

}