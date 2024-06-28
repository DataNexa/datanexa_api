import { Request, Response, NextFunction } from 'express'
import response from '../../util/response'
import { body, validationResult } from 'express-validator'

import { pesquisas_repo } from '../../repositories/pesquisas/pesquisas.repo'
import { genRelatorioPesquisa, pesquisa_i, perfil_i, questionario_data_i } from '../../util/relatorios'
import Data from '../../util/data'

export default {


    list: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id } = req.body
        const resp_repo = await pesquisas_repo.list(client_id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor'
            })
        }

        response(res, {
            code:200,
            body:resp_repo
        })

    },

    unique: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id,id } = req.body
        const resp_repo = await pesquisas_repo.unique(client_id,id)

        if(resp_repo.error){
            return response(res, {
                code:resp_repo.code,
                message: resp_repo.message
            })
        }

        response(res, {
            code:200,
            body:resp_repo.row
        })

    },

    create: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('titulo').isString().trim().run(req)
        await body('descricao').isString().trim().run(req)
        await body('ativo').isNumeric().run(req)
        await body('termino').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id, titulo, descricao, ativo, termino } = req.body
        const resp_repo = await pesquisas_repo.create(client_id,titulo,descricao,ativo,termino)

        if(resp_repo.error){
            return response(res, {
                code:resp_repo.code,
                message: resp_repo.message
            })
        }

        response(res, {
            code:200,
            body:resp_repo.insertId
        })

    },

    update: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('titulo').isString().trim().run(req)
        await body('descricao').isString().trim().run(req)
        await body('termino').isString().trim().run(req)
        await body('ativo').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id,titulo,descricao,ativo,id } = req.body
        const resp_repo = await pesquisas_repo.update(client_id,titulo,descricao,ativo,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar alterar registro'
            })
        }

        response(res)

    },    
    
    delete: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { client_id,id } = req.body
        const resp_repo = await pesquisas_repo.delete(client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar excluir registro'
            })
        }

        response(res)

    },

    relatorio: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code:400,
                message:'Bad Request'
            })
        }   

        const { client_id, id} = req.body 

        const resp_repo = await pesquisas_repo.estatisticas(client_id, id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message:"Erro no servidor ao tentar gerar as estatísticas"
            })
        }

        response(res, {
            code:200,
            body:resp_repo
        })


    },

    responder: async (req:Request, res:Response) => {

        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)
        await body('options_perfil').isArray().run(req)
        await body('options_questionario').isArray().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code:400,
                message:'Bad Request'
            })
        }   

        const { client_id, id, options_perfil, options_questionario } = req.body 

        const resposta = await pesquisas_repo.responder(client_id,id,options_perfil, options_questionario)

        if(resposta.error){
            return response(res, {
                code: resposta.code,
                message:resposta.message
            })
        }

        response(res)

    },

    imprimirRelatorio: async (req:Request, res:Response) => {

        await body('id').isNumeric().run(req)
        await body('name').isString().run(req)
        await body('client_id').isNumeric().run(req)

        if(!validationResult(req).isEmpty()){
            console.log(req.body);
            
            return response(res, {
                code:400,
                message:'Bad Request'
            })
        }   

        const { id, name, client_id } = req.body

        const pesquisa_req = await pesquisas_repo.unique(client_id, id)

        if(pesquisa_req.error || !pesquisa_req.row){
            return response(res, {
                code:404,
                message:'Pesquisa não encontrada 1'
            }) 
        }

        const pesquisa_info = pesquisa_req.row

        const relatorio_completo = await pesquisas_repo.estatisticas(client_id, id)
        
        if(!relatorio_completo){
            return response(res, {
                code:404,
                message:'Pesquisa não encontrada 2'
            }) 
        }

        const perfis:perfil_i[] = []
        const questionarios:questionario_data_i[] = []

        for(const per of Object.values(relatorio_completo.perfil)){
            
            let per_temp = {
                nome:per.pergunta,
                data:{} as {[key:string]:number}
            }
            const total = Object.values(per.options).reduce((acc, item) => acc + item.votos, 0)
            
            for(const dat of per.options){
                if(dat.votos > 0)
                per_temp.data[dat.valor] = Math.round((dat.votos * 100) / total)
            }
            perfis.push(per_temp)

        }

        for(const que of Object.values(relatorio_completo.questionario)){
            
            let q_temp = {
                pergunta:que.pergunta,
                options:[] as {
                    valor:string,
                    porcentagem:number
                }[]
            }
            const total = Object.values(que.options).reduce((acc, item) => acc + item.votos, 0)
            
            for(const dat of que.options){
                q_temp.options.push({
                    valor:dat.valor,
                    porcentagem: Math.round((dat.votos * 100) / total)
                })
            }
            questionarios.push(q_temp)
        }
     
        const pesquisaI:pesquisa_i = {
            pesquisa_info:{
                titulo:pesquisa_info.titulo,
                quantidadePesquisados:pesquisa_info.quantParticipantes ? pesquisa_info.quantParticipantes : 0,
                dataRelatorio:(new Data(new Date())).toBr(),
                dataInicio: pesquisa_info.createAt ? (new Data(pesquisa_info.createAt)).toBr() : 'indeterminado',
                dataFim: pesquisa_info.duration ?  (new Data(pesquisa_info.duration)).toBr() : 'indeterminado',
                geradoPor: res.user.getNome()
            },
            perfis:perfis,
            questionarios: questionarios
        }

        try {
            const pdfBytes = await genRelatorioPesquisa(pesquisaI);
            
            if(pdfBytes){
                res.setHeader('Content-Disposition', 'attachment; filename='+name+'.pdf');
                res.setHeader('Content-Type', 'application/pdf');
                res.send(Buffer.from(pdfBytes));
            } else {
                return response(res, {
                    code:400,
                    message:'Bad Request'
                })
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            res.status(500).send('Internal Server Error');
        }

    }


}