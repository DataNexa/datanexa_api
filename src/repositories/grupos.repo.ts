import { execute, query, multiTransaction } from "../util/query"

interface grupos_i {
    id:number,
    client_id:number,
    titulo:string,
    descricao:string,
    link:string,
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
    row?:grupos_i
}

const grupos_repo = {
        
    
    list: async (client_id:number, injectString:string=''):Promise<grupos_i[]|false> => {
            
        const resp = await query(` 
        SELECT  grupos.id, grupos.link_whatsapp as link, grupos.client_id,  grupos.titulo,  grupos.descricao,  grupos.ativo
        from grupos 
             join client on grupos.client_id = client.id 
        
         WHERE  client.id = ? and grupos.ativo = 1
        ${injectString}`, {
            binds:[client_id]
        })

        if(resp.error) return false 

        return (resp.rows as grupos_i[])
    },    
    
    unique: async (client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  grupos.id,  grupos.link_whatsapp as link, grupos.client_id,  grupos.titulo,  grupos.descricao,  grupos.ativo
        from grupos 
             join client on grupos.client_id = client.id 
 
         WHERE  client.id = ? 
            and grupos.id = ? `, {
            binds:[client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as grupos_i[])

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
    
    create: async (client_id:number,titulo:string,descricao:string,link:string,ativo:number):Promise<create_response> => {
            
        const resp = await execute(`
        insert into grupos(client_id, titulo, descricao, link_whatsapp, ativo) 
        VALUES (?,?,?,?,?)
         `, {
            binds:[client_id,titulo,descricao,link,ativo]
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
    
    update: async (client_id:number,titulo:string,descricao:string,ativo:number,id:number, link:string):Promise<boolean> => {
        
        const resp = await execute(`update grupos      join client on grupos.client_id = client.id 
      set  grupos.client_id = ?,  grupos.titulo = ?, grupos.link_whatsapp = ?,  grupos.descricao = ?,  grupos.ativo = ?
         WHERE  client.id = ?  and grupos.id = ? `, {
            binds:[client_id,titulo,link,descricao,ativo,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
        update grupos      
        join client on grupos.client_id = client.id 
        set  grupos.ativo = 2
           WHERE  client.id = ?  and grupos.id = ? `, {
            binds:[client_id,id]
        })

        return !resp.error
    }
}

export { grupos_repo, grupos_i }