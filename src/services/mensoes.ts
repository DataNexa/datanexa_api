import { Request, Response } from 'express'
import mensaoRepo from '../repositories/mensao.repo'
import response from '../util/response'
import { body, validationResult } from 'express-validator';

import { Mensao } from '../types/Mensao'


export default {

    read: async(req:Request, res:Response) => {

        const id = Number(req.params.id ) || 0

        if(id == 0 || Number.isNaN(id)) {
            return response(res, { code: 400, message:'O parâmetro id é requerido' })
        }
        
        req.parsedQuery.filters['id'] = id
        req.parsedQuery.filters['client_id'] = req.parsedQuery.client_id

        const mensoes = await mensaoRepo.get(req.parsedQuery)
        if(!mensoes || mensoes.length == 0){
            return response(res, { code: 404 })
        }

        response(res, {
            code: 200,
            body: mensoes[0]
        })

    },

    list: async (req:Request, res:Response) => {

        req.parsedQuery.filters['client_id'] = req.parsedQuery.client_id

        const mensoes = await mensaoRepo.get(req.parsedQuery)
        if(!mensoes){
            return response(res, { code:500 })
        }

        response(res, {
            code: 200,
            body: mensoes
        })

    },

    create: async (req:Request, res:Response) => {

        await body('monitoramento_id').isInt().run(req)
        await body('expressao').isString().trim().run(req)
        await body('hashtags').isArray().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { monitoramento_id, expressao, hashtags } = req.body
        var mensao:Mensao|false = {
            id:0,
            expressao: expressao,
            hashtags: hashtags
        }

        mensao = await mensaoRepo.set(mensao, req.parsedQuery.client_id,monitoramento_id)

        if(!mensao){
            return response(res, { code: 500 })
        }

        response(res, {
            code:200,
            body: mensao
        })

    },

    update: async (req:Request, res:Response) => {

        await body('id').isInt().run(req)
        await body('monitoramento_id').isInt().run(req)
        await body('expressao').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { id, expressao, hashtags } = req.body
        var mensao:Mensao = {
            id:id,
            expressao: expressao,
            hashtags: hashtags
        }

        if(!await mensaoRepo.update(mensao, req.parsedQuery.client_id)){
            return response(res, { code: 500 })
        }

        response(res)

    },

    delete: async (req:Request, res:Response) => {

        const id = Number(req.params.id ) || 0

        if(id == 0 || Number.isNaN(id)) {
            return response(res, { code: 400, message:'O parâmetro id é requerido' })
        }
        
        await mensaoRepo.del(req.parsedQuery.client_id, id) ? 
            response(res) : 
            response(res, {
                code:500,
                message:'Server Error - Erro ao tentar deletar Mensão'
            })

    }

}