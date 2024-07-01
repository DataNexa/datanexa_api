import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'

import { fila_monitoramento_repo, fila_monitoramento_i } from '../repositories/fila_monitoramento.repo'

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
        const resp_repo = await fila_monitoramento_repo.list(client_id)

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

}