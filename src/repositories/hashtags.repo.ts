import { execute, query, multiTransaction } from "../util/query"

interface hashtags_i {
    id:number,
    monitoramento_id:number,
    tag:string
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
    row?:hashtags_i
}

const hashtags_repo = {
        
    
    list: async (monitoramento_id:number,client_id:number, injectString:string=''):Promise<hashtags_i[]|false> => {
            
        const resp = await query(` 
        SELECT  hashtags.id,  hashtags.monitoramento_id,  hashtags.tag
        from hashtags 
             join monitoramento on hashtags.monitoramento_id = monitoramento.id 
         join client on monitoramento.client_id = client.id 
 
         WHERE  monitoramento.id = ? and  client.id = ? 
        ${injectString}`, {
            binds:[monitoramento_id,client_id]
        })

        if(resp.error) return false 

        return (resp.rows as hashtags_i[])
    },    
    
    unique: async (monitoramento_id:number,client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  hashtags.id,  hashtags.monitoramento_id,  hashtags.tag
        from hashtags 
             join monitoramento on hashtags.monitoramento_id = monitoramento.id 
         join client on monitoramento.client_id = client.id 
 
         WHERE  monitoramento.id = ? and  client.id = ? 
            and hashtags.id = ? `, {
            binds:[monitoramento_id,client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as hashtags_i[])

        if(rows.length == 0) return {
            error:true,
            code:404,
            message:'Registro não encontrado'
        }  

        return {
            error:false,
            code:200,
            message:'',
            row: rows[0]
        }  

    },    
    
    create: async (monitoramento_id:number,tag:string,client_id:number):Promise<create_response> => {
            
        const conn = await multiTransaction()

        const test = await conn.query('select id from monitoramento where id = ? and client_id = ?',{
            binds:[monitoramento_id, client_id]
        }) 

        if(test.error || (test.rows as any[]).length == 0){
            await conn.rollBack()
            return {
                code:401,
                error:true,
                message:'Registro de monitoramento com este cliente não existe',
                insertId:0
            }
        }

        const resp = await execute(`
        insert into hashtags(monitoramento_id, tag) 
        VALUES (?,?)
         `, {
            binds:[monitoramento_id,tag]
        })

        if(resp.error)
            await conn.rollBack()

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

        await conn.finish()

        return {
            code:200,
            error:false,
            message:'',
            insertId: (resp.rows as any).insertId
        }

    },    
    
    update: async (monitoramento_id:number,tag:string,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update hashtags      join monitoramento on hashtags.monitoramento_id = monitoramento.id 
         join client on monitoramento.client_id = client.id 
      set  hashtags.monitoramento_id = ?,  hashtags.tag = ?
         WHERE  monitoramento.id = ? and  client.id = ?  and hashtags.id = ? `, {
            binds:[monitoramento_id,tag,monitoramento_id,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (monitoramento_id:number,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete hashtags 
           from hashtags 
               join monitoramento on hashtags.monitoramento_id = monitoramento.id 
         join client on monitoramento.client_id = client.id 
 
        WHERE  monitoramento.id = ? and  client.id = ?   and hashtags.id = ? `, {
            binds:[monitoramento_id,client_id,id]
        })

        return !resp.error
    }
}

export { hashtags_repo, hashtags_i }