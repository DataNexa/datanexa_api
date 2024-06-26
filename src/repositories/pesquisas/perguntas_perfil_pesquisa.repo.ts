import { execute, query, multiTransaction } from "../../util/query"

interface perguntas_perfil_pesquisa_i {
    id:number,
    pesquisa_id:number,
    pergunta:string,
    options:{opcao_id:number, opcao_valor:number}[]
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
    row?:perguntas_perfil_pesquisa_i
}

const perguntas_perfil_pesquisa_repo = {
        
    
    list: async (pesquisa_id:number,client_id:number, injectString:string=''):Promise<perguntas_perfil_pesquisa_i[]|false> => {
            
        const resp = await query(` 
            SELECT  
                perguntas_perfil_pesquisa.id,  
                perguntas_perfil_pesquisa.pesquisa_id,  
                perguntas_perfil_pesquisa.pergunta,
                opcoes_pergunta_perfil_pesquisa.id as opcao_id,
                opcoes_pergunta_perfil_pesquisa.valor as opcao_valor
            from 
                opcoes_pergunta_perfil_pesquisa 
                join perguntas_perfil_pesquisa on perguntas_perfil_pesquisa.id = opcoes_pergunta_perfil_pesquisa.pergunta_perfil_pesquisa_id 
                join pesquisas on perguntas_perfil_pesquisa.pesquisa_id = pesquisas.id 
                join client on pesquisas.client_id = client.id 
            WHERE  
                perguntas_perfil_pesquisa.pesquisa_id = ? and pesquisas.client_id = ?  
                order by perguntas_perfil_pesquisa.id
            ${injectString}`, {
            binds:[pesquisa_id,client_id]
        })

        if(resp.error) return false 

        const result:{ [key:number] : perguntas_perfil_pesquisa_i } = {}
        const rows = resp.rows as any

        for(const row of rows){
            
            if(!result[row.id]){
                const { id, pergunta, pesquisa_id } = row
                const options = [] as {opcao_id:number, opcao_valor:number}[]
                result[row.id] = { id, pergunta, pesquisa_id, options }
            }

            result[row.id].options.push({
                opcao_id:row.opcao_id,
                opcao_valor:row.opcao_valor
            })
        }
        
        return Object.values(result)
    },    
    
    
    create: async (pesquisa_id:number,pergunta:string,client_id:number):Promise<create_response> => {
            
        const resp = await execute(`
        insert into perguntas_perfil_pesquisa(pesquisa_id, pergunta) 
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
        
        const resp = await execute(`update perguntas_perfil_pesquisa      join pesquisas on perguntas_perfil_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
      set  perguntas_perfil_pesquisa.pesquisa_id = ?,  perguntas_perfil_pesquisa.pergunta = ?
         WHERE  pesquisas.id = ? and  client.id = ?  and perguntas_perfil_pesquisa.id = ? `, {
            binds:[pesquisa_id,pergunta,pesquisa_id,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (pesquisa_id:number,client_id:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`
         delete perguntas_perfil_pesquisa 
           from perguntas_perfil_pesquisa 
               join pesquisas on perguntas_perfil_pesquisa.pesquisa_id = pesquisas.id 
         join client on pesquisas.client_id = client.id 
 
        WHERE  pesquisas.id = ? and  client.id = ?   and perguntas_perfil_pesquisa.id = ? `, {
            binds:[pesquisa_id,client_id,id]
        })

        return !resp.error
    }
}

export { perguntas_perfil_pesquisa_repo, perguntas_perfil_pesquisa_i }