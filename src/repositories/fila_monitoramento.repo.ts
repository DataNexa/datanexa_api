import { execute, query, multiTransaction } from "../util/query"

interface fila_monitoramento_i {
    prioridade:number,
    monitoramento_id:number,
    task_status:number,
    titulo:string,
    pesquisa:string
}

interface fila_monitoramento_plus_i extends fila_monitoramento_i {
    client_id:number,
    task_id:number
}

type client_t = {
    nome:string,
    slug:string,
    id:number,
    total_monitoramentos:number
}

const fila_monitoramento_repo = {
    

    info: async ():Promise<client_t[]|false> => {

        const resp = await query(`
            select 
                client.id,
                client.nome, 
                client.slug,
                COUNT(monitoramento.client_id) as total_monitoramentos
            from 
                client
            join
                monitoramento on client.id = monitoramento.client_id
            where 
                client.ativo = 1
            group by 
                client.id;
        `)

        return !resp.error ? resp.rows as client_t[] : false

    },


    listUniqueMonitoramentoPerClient: async ():Promise<fila_monitoramento_plus_i[]> => {

        const resp = await query(`
            SELECT 
                monitoramento_filas.client_id,
                monitoramento.id AS monitoramento_id,
                monitoramento.prioridade,
                monitoramento_tasks.task_status,
                monitoramento_tasks.id AS task_id,
                monitoramento.titulo,
                monitoramento.pesquisa
            FROM 
                monitoramento_filas
                JOIN monitoramento_tasks ON monitoramento_tasks.monitoramento_fila_id = monitoramento_filas.id
                JOIN monitoramento ON monitoramento.id = monitoramento_tasks.monitoramento_id
            WHERE 
                monitoramento_tasks.task_status = 1
                AND monitoramento_tasks.id = (
                    SELECT MIN(mt2.id)
                    FROM monitoramento_tasks mt2
                    JOIN monitoramento_filas mf2 ON mt2.monitoramento_fila_id = mf2.id
                    WHERE 
                        mf2.client_id = monitoramento_filas.client_id
                        AND mt2.task_status = 1
                )
            ORDER BY 
                monitoramento_filas.id DESC, 
                monitoramento.prioridade ASC;
        `)

        if(resp.error) {
            return [] 
        }

        return resp.rows as fila_monitoramento_plus_i[]

    },

    
    list: async (client_id:number, injectString:string=''):Promise<fila_monitoramento_plus_i[]|false> => {
        
        const conn = await multiTransaction()

        const resp = await conn.query(` 
            SELECT  
                monitoramento.id AS monitoramento_id,
                monitoramento.prioridade,
                monitoramento_tasks.id AS task_id,
                monitoramento_tasks.task_status,
                monitoramento.titulo,
                monitoramento.alvo,
                monitoramento.pesquisa,
                GROUP_CONCAT(hashtags.tag SEPARATOR ' ') AS hashtags
            FROM 
                monitoramento_filas
                JOIN monitoramento_tasks ON monitoramento_tasks.monitoramento_fila_id = monitoramento_filas.id
                JOIN monitoramento ON monitoramento.id = monitoramento_tasks.monitoramento_id
                LEFT JOIN hashtags ON hashtags.monitoramento_id = monitoramento.id
            WHERE  
                monitoramento_filas.client_id = 1
                AND monitoramento_filas.id = (
                    SELECT MAX(mf.id) 
                    FROM monitoramento_filas mf
                    WHERE mf.client_id = monitoramento_filas.client_id
                )
            GROUP BY 
                monitoramento.id, monitoramento_tasks.id
            ORDER BY 
                monitoramento.prioridade ASC;
        ${injectString}`, {
            binds:[ client_id ]
        })

        if(resp.error) {
            console.log(resp.error_code, resp.error_message);
            await conn.rollBack()
            return false 
        }

        const lista_monitoramento = resp.rows as fila_monitoramento_plus_i[]

        if(lista_monitoramento.length > 0){
            for(const mon of lista_monitoramento){
                if(mon.task_status < 3){
                    await conn.finish()
                    return lista_monitoramento
                }
            }
        }

        const getAllMonitoramentosAtivos = await conn.query(`
            select 
                    monitoramento.id as monitoramento_id,
                    monitoramento.titulo,
                    monitoramento.alvo,
                    monitoramento.prioridade,
                    monitoramento.pesquisa,
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
            group by
                monitoramento.id 
            order by monitoramento.prioridade ASC;
        `)

        if(getAllMonitoramentosAtivos.error){
            console.log("aqui 1");
            await conn.rollBack()
            return false
        }

        const monitoramentosAtivos = (getAllMonitoramentosAtivos.rows as any[])
        if(monitoramentosAtivos.length == 0){
            console.log("aqui 2");
            await conn.finish()
            return []
        }

        const addFila = await conn.execute(`insert into monitoramento_filas (client_id) values (${client_id})`)
        if(addFila.error){
            console.log("aqui 3");
            
            await conn.rollBack()
            return false
        }

        const fila_id = (addFila.rows as any).insertId

        let q  = 'insert into monitoramento_tasks (monitoramento_id, monitoramento_fila_id, task_status ) values '
        let t  = monitoramentosAtivos.length

        for(const monitoramento_ativo of monitoramentosAtivos){
            q += `( ${monitoramento_ativo.monitoramento_id}, ${fila_id}, 1 ),`
        }

        q = q.substring(0, q.length - 1)

        const insertRes = await conn.execute(q)
        if(insertRes.error){
            console.log("aqui 4");
            await conn.rollBack()
            return false
        }

        await conn.finish()

        let insertId = parseInt((insertRes.rows as any).insertId)
       
        let res = monitoramentosAtivos as fila_monitoramento_plus_i[]

        for (let i = 0; i < t; i++) {
            res[i].task_id = insertId
            insertId++
        }
        
        return res
    
    },


    alterarFila: async (client_id:number, order_ids:number[]) => {

        const conn = await multiTransaction()

        const getAllMonitoramentos = await conn.query(`
            SELECT id FROM monitoramento WHERE client_id = ? 
        `, { binds: [client_id]})

        if (getAllMonitoramentos.error) {
            await conn.rollBack
            return false
        }

        const rows = getAllMonitoramentos.rows as any[]
        const monitoramentoIds = rows.map(row => row.id)
        
        const allValid = order_ids.every(id => monitoramentoIds.includes(id))
        if (!allValid) {
            await conn.rollBack
            return false
        }

        const changePrioridades = await conn.execute(`
            UPDATE monitoramento SET prioridade = 0 WHERE client_id = ?
        `, { binds: [client_id]})
        
        if (changePrioridades.error) {
            await conn.rollBack
            return false
        }

        const updates = order_ids.map((id, index) => ({
            id,
            prioridade: index + 1
        }))
        
        const updateQuery = `
            UPDATE monitoramento 
            SET prioridade = CASE id 
                ${updates.map(({ id, prioridade }) => `WHEN ${id} THEN ${prioridade}`).join(' ')}
                ELSE prioridade
            END
            WHERE id IN (${updates.map(({ id }) => id).join(', ')})
        `

        const updateResult = await conn.execute(updateQuery)
        if (updateResult.error) {
            await conn.rollBack
            return false
        }

        await conn.finish() 
        return true
        
    },

    alterarFilaUnicoItem:async (monitoramento_id:number, client_id:number, prioridade:number) => {
      
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

        return true

    },

    alterarStatusMonitoramentoTask: async (task_id:number, status:number) => {

        const conn = await multiTransaction();

        const respExec = await conn.execute(`
            update 
                monitoramento_tasks
            set
                monitoramento_tasks.task_status = ${status}
            where 
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