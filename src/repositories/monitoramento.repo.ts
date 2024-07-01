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
    
    update: async (client_id:number,titulo:string,objetivo:string,ativo:number,creatat:string,pesquisa:string,alvo:string,id:number):Promise<boolean> => {
        
        const resp = await execute(`update monitoramento      join client on monitoramento.client_id = client.id 
      set  monitoramento.client_id = ?,  monitoramento.titulo = ?,  monitoramento.objetivo = ?,  monitoramento.ativo = ?,  monitoramento.creatat = ?,  monitoramento.pesquisa = ?,  monitoramento.alvo = ?
         WHERE  client.id = ?  and monitoramento.id = ? `, {
            binds:[client_id,titulo,objetivo,ativo,creatat,pesquisa,alvo,client_id,id]
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