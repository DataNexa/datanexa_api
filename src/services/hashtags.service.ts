import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'

import { hashtags_repo, hashtags_i } from '../repositories/hashtags.repo'

export default {

    

    list: async (req:Request, res:Response) => {

        await body('monitoramento_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { monitoramento_id,client_id } = req.body
        const resp_repo = await hashtags_repo.list(monitoramento_id,client_id)

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

        await body('monitoramento_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { monitoramento_id,client_id,id } = req.body
        const resp_repo = await hashtags_repo.unique(monitoramento_id,client_id,id)

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

        await body('monitoramento_id').isNumeric().run(req)
        await body('tag').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { monitoramento_id,tag,client_id } = req.body
        const resp_repo = await hashtags_repo.create(monitoramento_id,tag,client_id)

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

        await body('monitoramento_id').isNumeric().run(req)
        await body('tag').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { monitoramento_id,tag,client_id,id } = req.body
        const resp_repo = await hashtags_repo.update(monitoramento_id,tag,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar alterar registro'
            })
        }

        response(res)

    },    
    
    delete: async (req:Request, res:Response) => {

        await body('monitoramento_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { monitoramento_id,client_id,id } = req.body
        const resp_repo = await hashtags_repo.delete(monitoramento_id,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar excluir registro'
            })
        }

        response(res)

    },

}