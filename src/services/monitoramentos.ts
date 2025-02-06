import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { UserDetail } from '../types/User'
import response from '../util/response'
import monitoramentoRepo from '../repositories/monitoramento.repo'


export default {

    list: async (req:Request, res:Response) => {

        const client_id = req.body.parsedQuery.client_id

        if(client_id == 0) {
            return response(res, { code: 400, message:'O parâmetro client_id é requerido' })
        }

        const monitoramentos = await monitoramentoRepo.get(req.body.parsedQuery)

        if(!monitoramentos){
            return response(res, { code: 400, message: 'Erro na requisição'})
        }

        response(res, { code: 200, body: monitoramentos })

    },

    update: async (req:Request, res:Response ) => {

        const client_id = req.body.parsedQuery.client_id

    }

}