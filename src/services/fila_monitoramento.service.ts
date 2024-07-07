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

    manager: async (req:Request, res:Response) => {
        
        await body('client_id').isNumeric().run(req)
        await body('fila_ids').isArray().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id, fila_ids } = req.body

        const resp_repo = await fila_monitoramento_repo.alterarFila(client_id, fila_ids)

        if(!resp_repo){
            return response(res, {
                code:500,
                message:'Não foi possível alterar a fila de monitoramentos'
            })
        }

        return response(res)

    },

    alterarStatusTask: async (req:Request, res:Response) =>{

        await body('client_id').isNumeric().run(req)
        await body('task_id').isNumeric().run(req)
        await body('status').isInt({min:0}).run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { client_id, task_id, status } = req.body

        const respo = await fila_monitoramento_repo.alterarStatusMonitoramentoTask(task_id, client_id, status)

        if(!respo){
            return response(res, {
                code:500,
                message:'Error'
            })
        }

        response(res)

    }

}