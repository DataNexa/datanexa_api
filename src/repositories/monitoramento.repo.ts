import { query, insertOnce, execute } from "../core/database/mquery"
import { FilterQuery } from "../types/FilterQuery"
import { Monitoramento } from "../types/Monitoramento"

const fields:{[key:string]:string} = {
    id:'monitoramento.id',
    titulo:'monitoramento.titulo',
    descricao:'monitoramento.descricao'
}

const defaultMonitoramento:Monitoramento = {
    id:0,
    titulo:'',
    descricao:''
}


export default {

    get: async (filter:FilterQuery):Promise<Monitoramento[]|undefined> => {

        let qstring = `SELECT `

        qstring += (filter.fields.length === 0) 
        ? `${Object.values(fields).join(', ')} ` 
        : `${fields.id} as id, ${filter.fields.filter(fld => fld !== 'id' && fields[fld]).map(fld => fields[fld]).join(', ')} `;

        qstring += `FROM monitoramento JOIN client ON client.id = monitoramento.client_id WHERE client.id = ${filter.client_id} `;

        if(filter.filters['id']){
            const id = parseInt(filter.filters['id'])
            if (!isNaN(id)) {
                qstring += `AND monitoramento.id = ${id} `;
            }
        }

        if (filter.sort.length > 0) {
            const validSortFields = filter.sort.filter(sort => fields[sort]);
            if (validSortFields.length > 0) {
                qstring += `ORDER BY ${validSortFields.map(sort => fields[sort]).join(', ')} `;
            }
        } else {
            qstring += `ORDER BY ${fields.id} `;
        }

        qstring += filter.desc ? `DESC ` : `ASC `
        
        qstring += `LIMIT ${filter.offset}, ${filter.limit}`

        const res = await query(qstring)

        if(res.error){
            return undefined
        }

        const monitoramentos = (res.rows as any[]).map(data => ({
            ...defaultMonitoramento,
            ...data
          })) as Monitoramento[]
        
        return monitoramentos

    },

    update: async (monitoramento:Monitoramento) => {

        const campos = Object.keys(monitoramento)
        let execstr = `update monitoramento set `

        for(const campo of campos){
            if(campo != "id")
            execstr += `${campo} = ?, ` 
        }
        execstr = execstr.substring(0, execstr.length -2)+' '
        execstr += `where id = ${monitoramento.id}`

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


    del: async (id:number) => {
        
        const res = await execute(`delete from monitoramento where id = ? `, [id])
        return !res.error

    }


}