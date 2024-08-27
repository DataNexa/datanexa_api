import { execute, query, multiTransaction } from "../util/query"

interface monitoramento_i {
    id:number,
    client_id:number,
    titulo:string,
    descricao:string,
    ativo:number,
    repetir:number,
    creatat:string,
    pesquisa:string,
    alvo:string,
    stats?:publicacao_stats[],
    negativos?:number,
    positivos?:number,
    neutros?:number,
    hashtags?:string[]
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
        
    
    listPriority: async (client_id:number) => {

        const conn = await multiTransaction()

        const resp = await conn.query(` 
            SELECT  
                monitoramento.id,  
                monitoramento.titulo,  
                monitoramento.alvo,
                monitoramento.descricao,  
                monitoramento.prioridade
            from monitoramento 
                join client on monitoramento.client_id = client.id
            WHERE  client.id = ? and monitoramento.ativo = 1 
            ORDER BY monitoramento.prioridade ASC
            `, {
            binds:[client_id]
        })

        if(resp.error) {
            await conn.rollBack()
            return {
                error:true,
                code:500,
                message:'Erro no servidor'
            } 
        }

        await conn.finish()
        return resp.rows

    },

    list: async (client_id:number, injectString:string=''):Promise<monitoramento_i[]|false> => {
            
        const resp = await query(` 
            SELECT  
                m.id,  
                m.client_id,  
                m.titulo,  
                m.descricao,  
                m.ativo,  
                m.creatat,  
                m.pesquisa,  
                m.repetir,
                m.alvo,
                COALESCE(negativos.count, 0) as negativos,
                COALESCE(neutros.count, 0) as neutros,
                COALESCE(positivos.count, 0) as positivos
            FROM 
                monitoramento m
            JOIN 
                client c ON m.client_id = c.id
            LEFT JOIN 
                (SELECT monitoramento_id, COUNT(*) as count FROM publicacoes WHERE avaliacao = 0 GROUP BY monitoramento_id) negativos 
                ON m.id = negativos.monitoramento_id
            LEFT JOIN 
                (SELECT monitoramento_id, COUNT(*) as count FROM publicacoes WHERE avaliacao = 1 GROUP BY monitoramento_id) neutros 
                ON m.id = neutros.monitoramento_id
            LEFT JOIN 
                (SELECT monitoramento_id, COUNT(*) as count FROM publicacoes WHERE avaliacao = 2 GROUP BY monitoramento_id) positivos 
                ON m.id = positivos.monitoramento_id
            WHERE  
                c.id = ?;
        ${injectString}`, {
            binds:[client_id]
        })

        if(resp.error) return false 

        return (resp.rows as monitoramento_i[])
    },    
    
    unique: async (client_id:number,id:number, dataini:string, datafim:string):Promise<unique_response> =>  {
        
        const conn = await multiTransaction()

        const resp = await conn.query(` 
            SELECT  
                monitoramento.id,  
                monitoramento.client_id,  
                monitoramento.titulo,  
                monitoramento.descricao,  
                monitoramento.ativo,  
                monitoramento.repetir, 
                monitoramento.creatat,  
                monitoramento.pesquisa,  
                monitoramento.alvo
            from monitoramento 
                join client on monitoramento.client_id = client.id 
    
            WHERE  client.id = ? 
            and monitoramento.id = ? `, {
            binds:[client_id,id]
        })

        if(resp.error) {
            await conn.rollBack()
            return {
                error:true,
                code:500,
                message:'Erro no servidor'
            } 
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
                    AND publicacoes.data_pub BETWEEN ? AND ?
            GROUP BY 
                    local_pub;
        `, {
            binds:[id, dataini, datafim]
        })
        
        if(publicacoesQ.error){
            await conn.rollBack()
            return {
                error:true,
                code:500,
                message:publicacoesQ.error_message ? publicacoesQ.error_message : 'Erro ao selecionar estatísticas das publicações'
            }
        }

        const hashtagsQ = await conn.query(`
            SELECT
                tag
            from hashtags
            where monitoramento_id = ${id}
        `)

        if(hashtagsQ.error){
            await conn.rollBack()
            return {
                error:true,
                code:500,
                message:publicacoesQ.error_message ? publicacoesQ.error_message : 'Erro ao resgatar hashtags do monitoramento'
            }
        }

        const publicacao_stats = publicacoesQ.rows as publicacao_stats[]

        monitoramento.stats = publicacao_stats
        monitoramento.hashtags = (hashtagsQ.rows as {tag:string}[]).map(item => item.tag)

        await conn.finish()

        return {
            error:false,
            code:200,
            message:'',
            row: monitoramento
        }  

    },    
    
    create: async (client_id:number,titulo:string,descricao:string,creatat:Date,pesquisa:string,alvo:string, hashtags:string):Promise<create_response> => {
            
        const conn = await multiTransaction()

        const getLastPrioridade = await conn.query(`select prioridade from monitoramento where client_id = ${client_id} order by prioridade desc limit 1`)

        if(getLastPrioridade.error){
            await conn.rollBack()
            return {
                code:500,
                error:true,
                message:'Erro no servidor 1',
                insertId:0
            }
        }

        const rowsPrioridade = getLastPrioridade.rows as any[]

        const prioridade = 
            rowsPrioridade.length == 0 ? 1 
            : parseInt(rowsPrioridade[0].prioridade) + 1

        const resp = await conn.execute(`
        insert into monitoramento(client_id, titulo, descricao, ativo, creatat, pesquisa, alvo, prioridade, repetir) 
        VALUES (?,?,?,?,?,?,?,?,1)
         `, {
            binds:[client_id,titulo,descricao,1,creatat,pesquisa,alvo,prioridade]
        })

        if(resp.error){
            await conn.rollBack()
            if(resp.error_code == 1366) return {
                code:400,
                error:true,
                message:'Campo enviado mal formatado',
                insertId:0
            }; else return {
                code:500,
                error:true,
                message:'Erro no servidor - '+resp.error_code,
                insertId:0
            }
        }

        const insertId = (resp.rows as any).insertId

        let exec = 'insert into hashtags(monitoramento_id, tag) values '

        const tags = hashtags.trim().split(' ')
        for(const tag of tags){
            exec += `(${insertId}, '${tag}'),`
        }

        const insertHashtags = await conn.execute(exec.substring(0, exec.length - 1))

        if(insertHashtags.error){
            await conn.rollBack()
            return {
                code:500,
                error:true,
                message:'Erro no servidor',
                insertId:0
            } 
        }

        await conn.finish()

        return {
            code:200,
            error:false,
            message:'',
            insertId: insertId
        }

    },    

    alterarStatus: async (client_id:number, id:number, status:boolean):Promise<boolean> => {

        const conn = await multiTransaction()
        let resp:any

        if(!status){
            resp = conn.execute(`
                update
                    monitoramento
                set ativo = 0, repetir = 0
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

    alterarRepeticao: async (client_id:number, id:number, status:boolean) => {

        const conn = await multiTransaction()

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

        if(result.total == 0 && status && result.monitoramento_fila_id){
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

        const changeExec = status ? 
            await conn.execute(`
                update
                    monitoramento
                set repetir = 1
                where 
                    client_id = ${client_id}
                    and id = ${id}
        `) : await conn.execute(`
                update
                    monitoramento
                set repetir = 0
                where 
                    client_id = ${client_id}
                    and id = ${id}
            `)

        if(changeExec.error){
            await conn.rollBack()
            return false
        }

        await conn.finish()
        return true

    },
    
    update: async (client_id:number,titulo:string,descicao:string,pesquisa:string,alvo:string,id:number, hashtags:string):Promise<boolean> => {
        
        const conn = await multiTransaction()

        const resp1 = await conn.execute(`
            delete from hashtags where monitoramento_id = ?
        `, {
            binds:[id]
        })

        if(resp1.error){
            await conn.rollBack()
            return false
        }

        let exec = 'insert into hashtags(monitoramento_id, tag) values '

        const tags = hashtags.trim().split(' ')
        for(const tag of tags){
            exec += `(${id}, '${tag}'),`
        }

        const insertHashtags = await conn.execute(exec.substring(0, exec.length - 1))

        if(insertHashtags.error){
            await conn.rollBack()
            return false
        }

        const resp = await conn.execute(`
            update monitoramento      
                join client on monitoramento.client_id = client.id 
            set  monitoramento.titulo = ?,  
                monitoramento.descricao = ?,  
                monitoramento.pesquisa = ?,  
                monitoramento.alvo = ?
            WHERE client.id = ?  and monitoramento.id = ? `, {
            binds:[titulo,descicao,pesquisa,alvo,client_id,id]
        })

        if(resp.error){
            await conn.rollBack()
            return false
        }
        
        await conn.finish()
        return true
    
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