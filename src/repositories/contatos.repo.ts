import { execute, query, multiTransaction } from "../util/query"

interface contatos_i {
    id:number,
    grupo_id:number,
    apelido:string,
    nome:string,
    whatsapp:string,
    email:string,
    instagram:string,
    twitter:string,
    facebook:string
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
    row?:contatos_i
}

const contatos_repo = {
        
    
    list: async (grupo_id:number,client_id:number, injectString:string=''):Promise<contatos_i[]|false> => {
            
        const resp = await query(` 
        SELECT  contatos.id,  contatos.grupo_id,  contatos.apelido,  contatos.nome,  contatos.whatsapp,  contatos.email,  contatos.instagram,  contatos.twitter,  contatos.facebook
        from contatos 
             join grupos on contatos.grupo_id = grupos.id 
         join client on grupos.client_id = client.id 
 
         WHERE  grupos.id = ? and  client.id = ? 
        ${injectString}`, {
            binds:[grupo_id,client_id]
        })

        if(resp.error) return false 

        return (resp.rows as contatos_i[])
    },    
    
    unique: async (grupo_id:number,client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  contatos.id,  contatos.grupo_id,  contatos.apelido,  contatos.nome,  contatos.whatsapp,  contatos.email,  contatos.instagram,  contatos.twitter,  contatos.facebook
        from contatos 
             join grupos on contatos.grupo_id = grupos.id 
         join client on grupos.client_id = client.id 
 
         WHERE  grupos.id = ? and  client.id = ? 
            and contatos.id = ? `, {
            binds:[grupo_id,client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as contatos_i[])

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
    
    create: async (grupo_id:number,apelido:string,nome:string,whatsapp:string,email:string,instagram:string,twitter:string,facebook:string,client_id:number):Promise<create_response> => {
        
        const resp = await execute(`
        insert into contatos(grupo_id, apelido, nome, whatsapp, email, instagram, twitter, facebook) 
        VALUES (?,?,?,?,?,?,?,?)
         `, {
            binds:[grupo_id,apelido,nome,whatsapp,email,instagram,twitter,facebook]
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
    
    update: async (grupo_id:number,apelido:string,nome:string,whatsapp:string,email:string,instagram:string,twitter:string,facebook:string,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update contatos      join grupos on contatos.grupo_id = grupos.id 
         join client on grupos.client_id = client.id 
      set  contatos.grupo_id = ?,  contatos.apelido = ?,  contatos.nome = ?,  contatos.whatsapp = ?,  contatos.email = ?,  contatos.instagram = ?,  contatos.twitter = ?,  contatos.facebook = ?
         WHERE  grupos.id = ? and  client.id = ?  and contatos.id = ? `, {
            binds:[grupo_id,apelido,nome,whatsapp,email,instagram,twitter,facebook,grupo_id,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (grupo_id:number, client_id:number, id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete contatos 
           from contatos 
               join grupos on contatos.grupo_id = grupos.id 
         join client on grupos.client_id = client.id 
 
        WHERE  grupos.id = ? and  client.id = ?   and contatos.id = ? `, {
            binds:[grupo_id,client_id,id]
        })

        return !resp.error
    }
}

export { contatos_repo, contatos_i }