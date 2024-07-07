import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'

import { publicacoes_repo } from '../repositories/publicacoes.repo'

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
        const resp_repo = await publicacoes_repo.list(monitoramento_id,client_id)

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
        const resp_repo = await publicacoes_repo.unique(monitoramento_id,client_id,id)

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

}