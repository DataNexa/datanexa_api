import { Request, Response, NextFunction } from 'express'
import response from '../../util/response'
import { body, validationResult } from 'express-validator'

import { perguntas_pesquisa_repo, perguntas_pesquisa_i } from '../../repositories/pesquisas/perguntas_pesquisa.repo'

export default {


    list: async (req:Request, res:Response) => {

        await body('pesquisa_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { pesquisa_id,client_id } = req.body
        const resp_repo = await perguntas_pesquisa_repo.list(pesquisa_id,client_id)

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

    create: async (req:Request, res:Response) => {

        await body('pesquisa_id').isNumeric().run(req)
        await body('pergunta').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { pesquisa_id,pergunta,client_id } = req.body
        const resp_repo = await perguntas_pesquisa_repo.create(pesquisa_id,pergunta,client_id)

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

        await body('pesquisa_id').isNumeric().run(req)
        await body('pergunta').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { pesquisa_id,pergunta,client_id,id } = req.body
        const resp_repo = await perguntas_pesquisa_repo.update(pesquisa_id,pergunta,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar alterar registro'
            })
        }

        response(res)

    },    
    
    delete: async (req:Request, res:Response) => {

        await body('pesquisa_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { pesquisa_id,client_id,id } = req.body
        const resp_repo = await perguntas_pesquisa_repo.delete(pesquisa_id,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar excluir registro'
            })
        }

        response(res)

    },

}