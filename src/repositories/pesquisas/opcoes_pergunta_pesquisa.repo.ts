import { execute, query, multiTransaction } from "../../util/query"

interface opcoes_pergunta_pesquisa_i {
    id:number,
    pergunta_pesquisa_id:number,
    valor:string
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
    row?:opcoes_pergunta_pesquisa_i
}

const opcoes_pergunta_pesquisa_repo = {
        
    
    list: async (pergunta_pesquisa_id:number,pesquisa_id:number,client_id:number, injectString:string=''):Promise<opcoes_pergunta_pesquisa_i[]|false> => {
            
        const resp = await query(` 
        SELECT  opcoes_pergunta_pesquisa.id,  opcoes_pergunta_pesquisa.pergunta_pesquisa_id,  opcoes_pergunta_pesquisa.valor
        from opcoes_pergunta_pesquisa 
             join perguntas_pesquisa on opcoes_pergunta_pesquisa.pergunta_pesquisa_id = perguntas_pesquisa.id 
         join pesquisas on perguntas_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
 
         WHERE  perguntas_pesquisa.id = ? and  pesquisas.id = ? and  client.id = ? 
        ${injectString}`, {
            binds:[pergunta_pesquisa_id,pesquisa_id,client_id]
        })

        if(resp.error) return false 

        return (resp.rows as opcoes_pergunta_pesquisa_i[])
    },    
    
    
    create: async (pergunta_pesquisa_id:number,valor:string, client_id:number):Promise<create_response> => {
        
        // TODO: verificar se o cliente_id está vinculado a pergunta_pesquisa_id

        const resp = await execute(`
        insert into opcoes_pergunta_pesquisa(pergunta_pesquisa_id, valor) 
        VALUES (?,?)
         `, {
            binds:[pergunta_pesquisa_id,valor]
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
    
    update: async (pergunta_pesquisa_id:number,valor:string,pesquisa_id:number,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update opcoes_pergunta_pesquisa      join perguntas_pesquisa on opcoes_pergunta_pesquisa.pergunta_pesquisa_id = perguntas_pesquisa.id 
         join pesquisas on perguntas_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
      set  opcoes_pergunta_pesquisa.pergunta_pesquisa_id = ?,  opcoes_pergunta_pesquisa.valor = ?
         WHERE  perguntas_pesquisa.id = ? and  pesquisas.id = ? and  client.id = ?  and opcoes_pergunta_pesquisa.id = ? `, {
            binds:[pergunta_pesquisa_id,valor,pergunta_pesquisa_id,pesquisa_id,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (pergunta_pesquisa_id:number,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete opcoes_pergunta_pesquisa 
           from opcoes_pergunta_pesquisa 
               join perguntas_pesquisa on opcoes_pergunta_pesquisa.pergunta_pesquisa_id = perguntas_pesquisa.id 
         join pesquisas on perguntas_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
 
        WHERE  perguntas_pesquisa.id = ? and  client.id = ?   and opcoes_pergunta_pesquisa.id = ? `, {
            binds:[pergunta_pesquisa_id,client_id,id]
        })

        return !resp.error
    }
}

export { opcoes_pergunta_pesquisa_repo, opcoes_pergunta_pesquisa_i }