import { execute, query, multiTransaction } from "../../util/query"

interface perguntas_pesquisa_i {
    id:number,
    pesquisa_id:number,
    pergunta:string
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
    row?:perguntas_pesquisa_i
}

const perguntas_pesquisa_repo = {
        
    
    list: async (pesquisa_id:number,client_id:number, injectString:string=''):Promise<perguntas_pesquisa_i[]|false> => {
            
        const resp = await query(` 
        SELECT  perguntas_pesquisa.id,  perguntas_pesquisa.pesquisa_id,  perguntas_pesquisa.pergunta
        from perguntas_pesquisa 
             join pesquisas on perguntas_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
 
         WHERE  pesquisas.id = ? and  client.id = ? 
        ${injectString}`, {
            binds:[pesquisa_id,client_id]
        })

        if(resp.error) return false 

        return (resp.rows as perguntas_pesquisa_i[])
    },    
    
    unique: async (pesquisa_id:number,client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  perguntas_pesquisa.id,  perguntas_pesquisa.pesquisa_id,  perguntas_pesquisa.pergunta
        from perguntas_pesquisa 
             join pesquisas on perguntas_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
 
         WHERE  pesquisas.id = ? and  client.id = ? 
            and perguntas_pesquisa.id = ? `, {
            binds:[pesquisa_id,client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as perguntas_pesquisa_i[])

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
    
    create: async (pesquisa_id:number,pergunta:string,client_id:number):Promise<create_response> => {
            
        const resp = await execute(`
        insert into perguntas_pesquisa(pesquisa_id, pergunta) 
        VALUES (?,?)
         `, {
            binds:[pesquisa_id,pergunta]
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
    
    update: async (pesquisa_id:number,pergunta:string,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update perguntas_pesquisa      join pesquisas on perguntas_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
      set  perguntas_pesquisa.pesquisa_id = ?,  perguntas_pesquisa.pergunta = ?
         WHERE  pesquisas.id = ? and  client.id = ?  and perguntas_pesquisa.id = ? `, {
            binds:[pesquisa_id,pergunta,pesquisa_id,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (pesquisa_id:number,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete perguntas_pesquisa 
           from perguntas_pesquisa 
               join pesquisas on perguntas_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
 
        WHERE  pesquisas.id = ? and  client.id = ?   and perguntas_pesquisa.id = ? `, {
            binds:[pesquisa_id,client_id,id]
        })

        return !resp.error
    }
}

export { perguntas_pesquisa_repo, perguntas_pesquisa_i }