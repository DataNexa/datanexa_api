import { execute, query, multiTransaction } from "../../util/query"

interface pesquisas_i {
    id:number,
    client_id:number,
    titulo:string,
    descricao:string,
    ativo:number
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
    row?:pesquisas_i
}

const pesquisas_repo = {
        
    
    list: async (client_id:number, injectString:string=''):Promise<pesquisas_i[]|false> => {
            
        const resp = await query(` 
        SELECT  pesquisas.id,  pesquisas.client_id,  pesquisas.titulo,  pesquisas.descricao,  pesquisas.ativo
        from pesquisas 
             join client on pesquisas.client_id = client.id 
 
         WHERE  client.id = ? 
        ${injectString}`, {
            binds:[client_id]
        })

        if(resp.error) return false 

        return (resp.rows as pesquisas_i[])
    },    
    
    unique: async (client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  pesquisas.id,  pesquisas.client_id,  pesquisas.titulo,  pesquisas.descricao,  pesquisas.ativo
        from pesquisas 
             join client on pesquisas.client_id = client.id 
 
         WHERE  client.id = ? 
            and pesquisas.id = ? `, {
            binds:[client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as pesquisas_i[])

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
    
    create: async (client_id:number,titulo:string,descricao:string,ativo:number):Promise<create_response> => {
            
        const resp = await execute(`
        insert into pesquisas(client_id, titulo, descricao, ativo) 
        VALUES (?,?,?,?)
         `, {
            binds:[client_id,titulo,descricao,ativo]
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
    
    update: async (client_id:number,titulo:string,descricao:string,ativo:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update pesquisas      join client on pesquisas.client_id = client.id 
      set  pesquisas.client_id = ?,  pesquisas.titulo = ?,  pesquisas.descricao = ?,  pesquisas.ativo = ?
         WHERE  client.id = ?  and pesquisas.id = ? `, {
            binds:[client_id,titulo,descricao,ativo,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete pesquisas 
           from pesquisas 
               join client on pesquisas.client_id = client.id 
 
        WHERE  client.id = ?   and pesquisas.id = ? `, {
            binds:[client_id,id]
        })

        return !resp.error
    }
}

export { pesquisas_repo, pesquisas_i }