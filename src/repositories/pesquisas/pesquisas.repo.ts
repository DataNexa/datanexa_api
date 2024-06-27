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

interface resposta_response {
    error:boolean,
    message:string,
    code:number
}

interface stats {
    perfil:{
        [key:number]:{
            pergunta:string,    
            options:{
                valor:string,
                votos:number
            }[]
        }
    },
    questionario:{
        [key:number]:{
            pergunta:string,
            options:{
                valor:string,
                votos:number
            }[]
        }
    },
}

const pesquisas_repo = {
        
    
    list: async (client_id:number, injectString:string=''):Promise<pesquisas_i[]|false> => {
            
        const resp = await query(` 
            SELECT  
                pesquisas.id,  
                pesquisas.client_id,  
                pesquisas.titulo,  
                pesquisas.descricao,  
                pesquisas.ativo,
                pesquisas.createAt,
                pesquisas.duration,
                (select count(*) from perguntas_pesquisa where pesquisa_id = pesquisas.id) as quantPerguntas,
                (select count(*) from respostas_pesquisa where pesquisa_id = pesquisas.id) as quantParticipantes
            from pesquisas 
                join client on pesquisas.client_id = client.id 
    
            WHERE client.id = ?
                    and pesquisas.ativo < 3
            ORDER BY pesquisas.id DESC
        ${injectString}`, {
            binds:[client_id]
        })

        if(resp.error) return false 

        return (resp.rows as pesquisas_i[])
    },    
    
    unique: async (client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  
            pesquisas.id,  
            pesquisas.client_id,  
            pesquisas.titulo,  
            pesquisas.descricao,  
            pesquisas.ativo,
            pesquisas.createAt,
            pesquisas.duration,
            (select count(*) from perguntas_pesquisa where pesquisa_id = pesquisas.id) as quantPerguntas,
            (select count(*) from respostas_pesquisa where pesquisa_id = pesquisas.id) as quantParticipantes
        from pesquisas 
             join client on pesquisas.client_id = client.id 
 
         WHERE  client.id = ? 
            and pesquisas.id = ? and pesquisas.ativo < 3 `, {
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
    
    create: async (client_id:number,titulo:string,descricao:string,ativo:number, termino:string = ''):Promise<create_response> => {
        
        
        const hoje = new Date()

        let strFields = '(client_id, titulo, descricao, ativo, createAt'+(termino == ''?')':', duration)')
        let valFields = '(?,?,?,?,?'+(termino == ''?')':',?)')

        let binds = [client_id,titulo,descricao,ativo, hoje]

        if(termino != ""){
            const limt = new Date(termino)
            binds.push(limt)
        }

        const resp = await execute(`
            insert into pesquisas ${strFields}
            VALUES ${valFields}
         `, {
            binds:binds
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
    },

    estatisticas: async (client_id:number,  id:number):Promise<stats|false> => {

        const stats:stats = {
            perfil:{},
            questionario:{}
        }

        const conn = await multiTransaction()

        const resp_perguntas_q = await conn.query(`
            select 
                perguntas_pesquisa.id       as pergunta_pesquisa_id,
                opcoes_pergunta_pesquisa.id as opcao_id, 
                perguntas_pesquisa.pergunta, 
                opcoes_pergunta_pesquisa.valor, 
                (   
                    select 
                        count(*) 
                    from  respostas_pergunta 
                    where opcao_pergunta_id = opcao_id
                ) as total_votos
            from 
                opcoes_pergunta_pesquisa
                join perguntas_pesquisa on perguntas_pesquisa.id = opcoes_pergunta_pesquisa.pergunta_pesquisa_id 
                join pesquisas          on pesquisas.id          = perguntas_pesquisa.pesquisa_id
            where 
                pesquisas.id = ? and client_id = ?;
        `, {
            binds:[id, client_id]
        });
        
        
        if(resp_perguntas_q.error){
            await conn.rollBack()
            return false
        }
        
        const perguntas = (resp_perguntas_q.rows as any)

        for(const pergunta of perguntas){
            if(!stats.questionario[pergunta.pergunta_pesquisa_id]){
                stats.questionario[pergunta.pergunta_pesquisa_id] = {
                    pergunta:pergunta.pergunta,
                    options:[]
                }
            }
            stats.questionario[pergunta.pergunta_pesquisa_id].options.push({
                valor:pergunta.valor,
                votos:pergunta.total_votos
            })
        }

        const resp_perfil_q = await conn.query(`
            select 
                perguntas_perfil_pesquisa.id       as pergunta_pesquisa_id,
                opcoes_pergunta_perfil_pesquisa.id as opcao_id, 
                perguntas_perfil_pesquisa.pergunta, 
                opcoes_pergunta_perfil_pesquisa.valor, 
                (   
                    select 
                        count(*) 
                    from  respostas_perfil_pesquisa 
                    where opcao_pergunta_perfil_id = opcao_id
                ) as total_votos
            from 
                opcoes_pergunta_perfil_pesquisa
                join perguntas_perfil_pesquisa on perguntas_perfil_pesquisa.id = opcoes_pergunta_perfil_pesquisa.pergunta_perfil_pesquisa_id 
                join pesquisas                 on pesquisas.id                 = perguntas_perfil_pesquisa.pesquisa_id
            where 
                pesquisas.id = ? and client_id = ?;
        `, {
            binds:[id, client_id]
        });
        
        
        if(resp_perfil_q.error){
            await conn.rollBack()
            return false
        }
        
        const perfis = (resp_perfil_q.rows as any)

        for(const perfil of perfis){
            if(!stats.perfil[perfil.pergunta_pesquisa_id]){
                stats.perfil[perfil.pergunta_pesquisa_id] = {
                    pergunta:perfil.pergunta,
                    options:[]
                }
            }
            stats.perfil[perfil.pergunta_pesquisa_id].options.push({
                valor:perfil.valor,
                votos:perfil.total_votos
            })
        }

        await conn.finish()

        return stats

    },

    responder: async (client_id:number, id:number, options_perfil:number[], options_questionario:number[]):Promise<resposta_response> => {

        const conn = await multiTransaction()

        const checkPesquisa = await conn.query(`select id from pesquisas where client_id = ? and id = ?`, {
            binds:[client_id, id]
        })

        if(checkPesquisa.error || (checkPesquisa.rows as any[]).length == 0){
            conn.rollBack()
            return {
                error:true,
                code:500,
                message:'Essa pesquisa não existe ou não é do cliente'
            }
        }

   
        const options_perfil_final   = options_perfil.filter((value, index, self) => self.indexOf(value) === index);

        const options_quest_final   = options_questionario.filter((value, index, self) => self.indexOf(value) === index);

        const insertResposta = await conn.execute(`
            insert into respostas_pesquisa (pesquisa_id) values (${id})
        `);

        if(insertResposta.error){
            conn.rollBack()
            return {
                error:true,
                code:500,
                message:'Não foi possível criar uma resposta'
            }
        }

        const resposta_id = (insertResposta.rows as any).insertId

        let insertPerfil = 'insert into respostas_perfil_pesquisa (resposta_id, opcao_pergunta_perfil_id) values '
        for(const option of options_perfil_final){
            insertPerfil += `(${resposta_id}, ${option}),`
        }

        const insertPerfilValues = await conn.execute(insertPerfil.substring(0, insertPerfil.length - 1))
        if(insertPerfilValues.error){
            conn.rollBack()
            return {
                error:true,
                code:500,
                message:'Não foi possível criar uma resposta'
            }
        }


        let insertQuestionario = 'insert into respostas_pergunta (resposta_id, opcao_pergunta_id) values '
        for(const option of options_quest_final){
            insertQuestionario += `(${resposta_id}, ${option}),`
        }
        
        const insertQuestValues = await conn.execute(insertQuestionario.substring(0,insertQuestionario.length - 1))
        if(insertQuestValues.error){
            conn.rollBack()
            return {
                error:true,
                code:500,
                message:'Não foi possível criar uma resposta'
            }
        }

        await conn.finish()

        return {
            error:false,
            code:200,
            message:''
        }
        
    }

}


export { pesquisas_repo, pesquisas_i }