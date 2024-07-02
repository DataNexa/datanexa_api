import { execute, query, multiTransaction } from "../util/query"

interface fila_monitoramento_i {
    prioridade:number,
    monitoramento_id:number,
    task_status:number,
    titulo:string
}

const fila_monitoramento_repo = {
        
    
    list: async (client_id:number, injectString:string=''):Promise<fila_monitoramento_i[]|false> => {
        
        const conn = await multiTransaction()

        const resp = await conn.query(` 
            SELECT  
                    monitoramento.id as monitoramento_id,
                    monitoramento.prioridade,
                    monitoramento_tasks.task_status,
                    monitoramento.titulo
            from 
                monitoramento_filas
                join monitoramento_tasks on monitoramento_tasks.monitoramento_fila_id = monitoramento_filas.id
                join monitoramento on monitoramento.id = monitoramento_tasks.monitoramento_id
            WHERE  
                monitoramento_tasks.monitoramento_id = ? and  monitoramento_filas.client_id = ?
            order by monitoramento_filas.id DESC, monitoramento.prioridade ASC
        ${injectString}`, {
            binds:[ client_id ]
        })
        
        if(resp.error) {
            await conn.rollBack()
            return false 
        }

        if((resp.rows as any[]).length > 0){
            const lista_monitoramento = resp.rows as fila_monitoramento_i[]
            return lista_monitoramento
        }

        const getAllMonitoramentosAtivos = await conn.query(`
            select 
                    monitoramento.id as monitoramento_id,
                    monitoramento.titulo,
                    monitoramento.prioridade,
                    1 as task_status
            from 
                monitoramento
            where 
                (
                    monitoramento.ativo = 1 AND monitoramento.repetir = 1 AND client_id = ${client_id}
                ) OR
                (
                    monitoramento.ativo = 1 AND monitoramento.repetir = 0 AND client_id = ${client_id}
                    AND NOT
                        EXISTS (
                            select 1
                                from monitoramento_tasks
                            where monitoramento_tasks.monitoramento_id = monitoramento.id
                        )
                )
        `)

        if(getAllMonitoramentosAtivos.error){
            await conn.rollBack()
            return false
        }

        const monitoramentosAtivos = (getAllMonitoramentosAtivos.rows as any[])

        if(monitoramentosAtivos.length == 0){
            await conn.finish()
            return []
        }

        const addFila = await conn.execute(`insert into monitoramento_filas (client_id) values (${client_id})`)
        if(addFila.error){
            await conn.rollBack()
            return false
        }

        const fila_id = (addFila.rows as any).insertId

        let q  = 'insert into monitoramento_tasks (monitoramento_id, monitoramento_fila_id, task_status ) values '

        for(const monitoramento_ativo of monitoramentosAtivos){
            q += `( ${monitoramento_ativo.monitoramento_id}, ${fila_id}, 1 ),`
        }

        q = q.substring(0, q.length - 1)

        const insertRes = await conn.execute(q)
        if(insertRes.error){
            await conn.rollBack()
            return false
        }

        return monitoramentosAtivos
    
    },


    alterarFila:async (monitoramento_id:number, client_id:number, prioridade:number) => {
      
        const conn = await multiTransaction()

        const resp = await conn.query(`
            select 1 from monitoramento 
            where id = ${monitoramento_id}
            and client_id = ${client_id}
        `)

        if(resp.error ||  (resp.rows as any[]).length == 0){
            await conn.rollBack()
            return false
        }

        const changeAll = await conn.execute(
            `update monitoramento 
                set prioridade = prioridade + 1 
            where
                prioridade >= ${prioridade}
                and not prioridade < ${prioridade} 
                and not id = ${monitoramento_id}
                and client_id = ${client_id}
            `)

        if(changeAll.error){
            await conn.rollBack()
            return false
        }

        const changePriority = await conn.execute(`
            update monitoramento
            set prioridade = ${prioridade}
            where id = ${monitoramento_id}
        `)

        if(changePriority.error){
            await conn.rollBack()
            return false
        }

        await conn.finish()

    },

    alterarStatusMonitoramentoTask: async (task_id:number, client_id:number, status:number) => {
        
        const conn = await multiTransaction();

        const respExec = await conn.execute(`
            update 
                monitoramento_tasks
            join 
                monitoramento_filas on monitoramento_tasks.monitoramento_fila_id = monitoramento_filas.id
            set
                monitoramento_tasks.task_status = ${status}
            where 
                monitoramento_filas.client_id = ${client_id} 
            and 
                monitoramento_tasks.id = ${task_id}
        `)

        if(respExec.error){
            await conn.rollBack()
            return false
        }

        await conn.finish()
        return true 

    }

}

export { fila_monitoramento_repo, fila_monitoramento_i }