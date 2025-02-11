import { query, insertOnce, execute, multiTransaction } from "../core/database/mquery"
import queryBuilder from "../core/database/queryBuilder"
import { DatabaseMap } from "../types/DatabaseMap"
import { FilterQuery } from "../types/FilterQuery"
import { Monitoramento } from "../types/Monitoramento"
import updateBuild from "../core/database/updateBuild"

const fields:{[key:string]:string} = {
    id:'monitoramento.id',
    titulo:'monitoramento.titulo',
    descricao:'monitoramento.descricao'
}

const mapDatabase:DatabaseMap = {
    table:'monitoramento',
    fields:fields,
    join:['>client'],
    fieldsSerch:{
        titulo:'monitoramento.titulo',
        descricao:'monitoramento.descricao'
    }
}

const defaultMonitoramento:Monitoramento = {
    id:0,
    titulo:'',
    descricao:''
}


export default {

    get: async (filter:FilterQuery):Promise<Monitoramento[]|undefined> => {

        const dataQuery = queryBuilder(mapDatabase, filter)

        const res = await query(dataQuery.query, dataQuery.values)

        if(res.error){
            return undefined
        }

        const monitoramentos = (res.rows as any[]).map(data => ({
            ...defaultMonitoramento,
            ...data
          })) as Monitoramento[]
        
        return monitoramentos

    },

    update: async (client_id:number, monitoramento:Monitoramento) => {

        let execstr = updateBuild(monitoramento, "monitoramento", ["id", "client_id"]);

        const mon = monitoramento as { [key: string]: any };

        const values = Object.keys(monitoramento)
            .filter(key => key !== "id" && mon[key] !== undefined)
            .map(key => mon[key]);

            
        values.push(monitoramento.id, client_id);

        let res = await execute(execstr, values);
        return !res.error;

    },

    set: async (client_id:number, monitoramento:Monitoramento) => {

        const res = await insertOnce(`insert into monitoramento (client_id, titulo, descricao) values (?,?,?)`, [client_id, monitoramento.titulo, monitoramento.descricao])
        
        if(res.error){
            return false
        }

        monitoramento.id = res.lastInsertId
        return monitoramento

    },


    del: async (client_id:number, id:number) => {
        
        const multi = await multiTransaction()

        const res1 = await multi.execute(`delete from publish where monitoramento_id = ? and client_id = ?`, [id, client_id])

        if(res1.error){
            console.log("erro1:", res1);
            await multi.rollBack()
            return false
        }

        const res2 = await multi.execute(`delete from mensao where monitoramento_id = ? and client_id = ?`, [id, client_id])

        if(res2.error){
            console.log("erro2:", res2);
            await multi.rollBack()
            return false
        }

        const res3 = await multi.execute(`delete from monitoramento where id = ? and client_id = ?`, [id, client_id])

        if(res3.error){
            console.log("erro3:", res3);
            await multi.rollBack()
            return false
        }

        await multi.finish()
        return true
         
    }


}