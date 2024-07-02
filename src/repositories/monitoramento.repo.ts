import { execute, query, multiTransaction } from "../util/query"

interface monitoramento_i {
    id:number,
    client_id:number,
    titulo:string,
    descricao:string,
    ativo:number,
    creatat:string,
    pesquisa:string,
    alvo:string,
    stats?:publicacao_stats[]
}

interface create_response {
    error:boolean,
    message:string,
    insertId:number,
    code:number
}

interface unique_response {
    error:boolean,
    message:string,
    code:number,
    row?:monitoramento_i
}

interface publicacao_stats {
    local:string,
    positivos:number,
    neutros:number,
    negativos:number
}


const monitoramento_repo = {
        
    
    list: async (client_id:number, injectString:string=''):Promise<monitoramento_i[]|false> => {
            
        const resp = await query(` 
        SELECT  
            monitoramento.id,  
            monitoramento.client_id,  
            monitoramento.titulo,  
            monitoramento.descricao,  
            monitoramento.ativo,  
            monitoramento.creatat,  
            monitoramento.pesquisa,  
            monitoramento.repetir,
            monitoramento.alvo
        from monitoramento 
             join client on monitoramento.client_id = client.id 
         WHERE  client.id = ? 
        ${injectString}`, {
            binds:[client_id]
        })

        if(resp.error) return false 

        return (resp.rows as monitoramento_i[])
    },    
    
    unique: async (client_id:number,id:number):Promise<unique_response> =>  {
        
        const conn = await multiTransaction()

        const resp = await query(` 
            SELECT  
                monitoramento.id,  
                monitoramento.client_id,  
                monitoramento.titulo,  
                monitoramento.descricao,  
                monitoramento.ativo,  
                monitoramento.creatat,  
                monitoramento.pesquisa,  
                monitoramento.alvo
            from monitoramento 
                join client on monitoramento.client_id = client.id 
    
            WHERE  client.id = ? 
            and monitoramento.id = ? `, {
            binds:[client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as monitoramento_i[])

        if(rows.length == 0) return {
            error:true,
            code:404,
            message:'Registro não encontrado'
        }  

        const monitoramento = rows[0]

        const publicacoesQ = await conn.query(`
              SELECT 
                    local_pub as local,
                    COUNT(CASE WHEN avaliacao = 0 THEN 1 END) AS negativos,
                    COUNT(CASE WHEN avaliacao = 1 THEN 1 END) AS neutros,
                    COUNT(CASE WHEN avaliacao = 2 THEN 1 END) AS positivos
                FROM 
                    publicacoes 
               WHERE 
                    monitoramento_id = ? 
            GROUP BY 
                    local_pub;
        `)
        
        if(publicacoesQ.error){
            return {
                error:true,
                code:500,
                message:publicacoesQ.error_message ? publicacoesQ.error_message : 'Erro ao selecionar estatísticas das publicações'
            }
        }

        const publicacao_stats = publicacoesQ.rows as publicacao_stats[]
        monitoramento.stats = publicacao_stats

        return {
            error:false,
            code:200,
            message:'',
            row: monitoramento
        }  

    },    
    
    create: async (client_id:number,titulo:string,descricao:string,ativo:number,creatat:string,pesquisa:string,alvo:string):Promise<create_response> => {
            
        const resp = await execute(`
        insert into monitoramento(client_id, titulo, descricao, ativo, creatat, pesquisa, alvo) 
        VALUES (?,?,?,?,?,?,?)
         `, {
            binds:[client_id,titulo,descricao,ativo,creatat,pesquisa,alvo]
        })

        if(resp.error && resp.error_code == 1062) return {
            code:500,
            error:true,
            message:'Registro Duplicado',
            insertId:0
        } 

        if(resp.error && resp.error_code == 1366) return {
            code:400,
            error:true,
            message:'Campo enviado mal formatado',
            insertId:0
        } 

        if(resp.error) return {
            code:500,
            error:true,
            message:'Erro no servidor',
            insertId:0
        }

        return {
            code:200,
            error:false,
            message:'',
            insertId: (resp.rows as any).insertId
        }

    },    

    alterarStatus: async (client_id:number, id:number, status:number):Promise<boolean> => {

        const conn = await multiTransaction()
        let resp:any

        if(status == 0){
            resp = conn.execute(`
                update
                    monitoramento
                set ativo = 0, prioridade = 0
                where 
                    client_id = ${client_id}
                    and id = ${id}
            `)
        } else {
            resp = conn.execute(`
                update
                    monitoramento
                set ativo = 1
                where 
                    client_id = ${client_id}
                    and id = ${id}
            `)
        }

        await conn.finish()
        return !resp.error
    },

    alterarRepeticao: async (client_id:number, id:number, status:number) => {

        const conn = await multiTransaction()
        let resp:any

        const respQ = await conn.query(`
            SELECT 
                mf.id as monitoramento_fila_id,
                COUNT(mt.id) as total
            FROM 
                (SELECT id
                FROM monitoramento_filas
                WHERE client_id = ${client_id}
                ORDER BY id DESC
                LIMIT 1) mf
            LEFT JOIN monitoramento_tasks mt
            ON mt.monitoramento_fila_id = mf.id
            AND mt.monitoramento_id = ${id}
            GROUP BY mf.id;
        `)

        if(respQ.error){
            await conn.rollBack()
            return false
        }

        const result = (respQ.rows as any[])[0]

        if(result.total == 0 && status == 1 && result.monitoramento_fila_id){
            // inserir na ultima fila
            const res = await conn.execute(`
                insert into
                monitoramento_tasks (monitoramento_id, monitoramento_fila_id, task_status )
                values (?,?,?)
            `, {
                binds:[ id, result.monitoramento_fila_id, 1 ]
            })

            if(res.error){
                await conn.rollBack()
                return false
            }
        }

        if(status == 0){
            resp = conn.execute(`
                update
                    monitoramento
                set prioridade = 0
                where 
                    client_id = ${client_id}
                    and id = ${id}
            `)
        } else {
            resp = conn.execute(`
                update
                    monitoramento
                set prioridade = 1
                where 
                    client_id = ${client_id}
                    and id = ${id}
            `)
        }

        await conn.finish()
        return !resp.error

    },
    
    update: async (client_id:number,titulo:string,descicao:string,pesquisa:string,alvo:string,id:number):Promise<boolean> => {
        
        const resp = await execute(`
        update monitoramento      
            join client on monitoramento.client_id = client.id 
        set  monitoramento.titulo = ?,  
             monitoramento.descricao = ?,  
             monitoramento.pesquisa = ?,  
             monitoramento.alvo = ?
         WHERE client.id = ?  and monitoramento.id = ? `, {
            binds:[titulo,descicao,pesquisa,alvo,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete monitoramento 
           from monitoramento 
               join client on monitoramento.client_id = client.id 
 
        WHERE  client.id = ?   and monitoramento.id = ? `, {
            binds:[client_id,id]
        })

        return !resp.error
    }
    
}

export { monitoramento_repo, monitoramento_i }