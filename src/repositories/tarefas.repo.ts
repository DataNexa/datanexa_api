import { execute, query, multiTransaction } from "../util/query"

interface tarefas_i {
    campanha_id:number,
    tarefa:string,
    status:number,
    createAt:string,
    dataLimite:string
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
    row?:tarefas_i
}

const tarefas_repo = {
        
    
    list: async (campanha_id:number,client_id:number, injectString:string=''):Promise<tarefas_i[]|false> => {
            
        const resp = await query(` 
        SELECT  tarefas.id,  tarefas.campanha_id,  tarefas.tarefa,  tarefas.status,  tarefas.createAt,  tarefas.dataLimite
        from tarefas 
             join campanhas on tarefas.campanha_id = campanhas.id 
         join client on campanhas.client_id = client.id 
 
         WHERE  campanhas.id = ? and  client.id = ? 
        ${injectString}`, {
            binds:[campanha_id,client_id]
        })

        if(resp.error) return false 

        return (resp.rows as tarefas_i[])
    },    
    
    unique: async (campanha_id:number,client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  tarefas.id,  tarefas.campanha_id,  tarefas.tarefa,  tarefas.status,  tarefas.createAt,  tarefas.dataLimite
        from tarefas 
             join campanhas on tarefas.campanha_id = campanhas.id 
         join client on campanhas.client_id = client.id 
 
         WHERE  campanhas.id = ? and  client.id = ? 
            and tarefas.id = ? `, {
            binds:[campanha_id,client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as tarefas_i[])

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
    
    create: async (campanha_id:number,tarefa:string,status:number,createAt:string,dataLimite:string,client_id:number):Promise<create_response> => {
            
        const resp = await execute(`
        insert into tarefas(campanha_id, tarefa, status, createAt, dataLimite) 
        VALUES (?,?,?,?,?)
             join campanhas on tarefas.campanha_id = campanhas.id 
         join client on campanhas.client_id = client.id 

         WHERE  campanhas.id = ? and  client.id = ? 
         `, {
            binds:[campanha_id,tarefa,status,createAt,dataLimite,campanha_id,client_id]
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
    
    update: async (campanha_id:number,tarefa:string,status:number,createAt:string,dataLimite:string,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update tarefas set  campanha_id = ?,  tarefa = ?,  status = ?,  createAt = ?,  dataLimite = ?     join campanhas on tarefas.campanha_id = campanhas.id 
         join client on campanhas.client_id = client.id 
         WHERE  campanhas.id = ? and  client.id = ?  and tarefas.id = ? `, {
            binds:[campanha_id,tarefa,status,createAt,dataLimite,campanha_id,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (campanha_id:number,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete from tarefas 
          join campanhas on tarefas.campanha_id = campanhas.id 
         join client on campanhas.client_id = client.id 
 
        WHERE  campanhas.id = ? and  client.id = ?   and tarefas.id = ? `, {
            binds:[campanha_id,client_id,id]
        })

        return !resp.error
    }
}

export { tarefas_repo, tarefas_i }