import { Request, Response, NextFunction } from 'express'
import response from '../../util/response'
import { body, validationResult } from 'express-validator'

import { pesquisas_repo } from '../../repositories/pesquisas/pesquisas.repo'

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

    }


}