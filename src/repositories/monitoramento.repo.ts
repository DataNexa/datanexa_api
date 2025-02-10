import { query, insertOnce, execute, multiTransaction } from "../core/database/mquery"
import queryBuilder from "../core/database/queryBuilder"
import { DatabaseMap } from "../types/DatabaseMap"
import { FilterQuery } from "../types/FilterQuery"
import { Monitoramento } from "../types/Monitoramento"


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
        escricao:'monitoramento.descricao'
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

        const campos = Object.keys(monitoramento)
        let execstr = `update monitoramento set `

        for(const campo of campos){
            if(campo != "id")
            execstr += `${campo} = ?, ` 
        }
        execstr = execstr.substring(0, execstr.length -2)+' '
        execstr += `where id = ${monitoramento.id} and client_id = ${client_id}`

        const mon = monitoramento as {[key:string]:any}

        const values = await (Object.keys(monitoramento) as Array<keyof typeof monitoramento>)
        .filter(key => key !== 'id')
        .map(key => mon[key])
        .filter(value => value !== undefined);

        let res = await execute(execstr, values)
        return !res.error

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