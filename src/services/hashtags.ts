import { Request, Response } from 'express'
import hashtagsRepo from '../repositories/hashtags.repo'
import response from '../util/response'
import { body, validationResult } from 'express-validator'


export default {


    list: async (req:Request, res:Response) => {

        const mensao_id = Number(req.params.mensao_id) || 0

        if(mensao_id == 0 || Number.isNaN(mensao_id)){
            return response(res, { code: 400, message:'O parâmetro mensao_id é requerido'})
        }

        req.parsedQuery.filters['mensao_id'] = mensao_id
        req.parsedQuery.filters['id'] = req.parsedQuery.client_id

        const hashtags = await hashtagsRepo.get(req.parsedQuery)
        
        if(!hashtags) return response(res, { code: 500 })

        response(res, { code: 200, body:hashtags })

    },


    create: async (req:Request, res:Response) => {

        await body('mensao_id').isInt().run(req)
        await body('valor').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { mensao_id, valor } = req.body

        const hashtag = await hashtagsRepo.set(valor, mensao_id, req.parsedQuery.client_id)

        if(!hashtag){
            return response(res, { code: 500 })
        }

        response(res, { code: 200, body: hashtag })

    },


    delete: async (req:Request, res:Response) => {

        const mensao_id = Number(req.params.mensao_id) || 0
        const id = Number(req.params.id) || 0
        
        if(mensao_id == 0 || id == 0 ||
            Number.isNaN(mensao_id) || Number.isNaN(id)
        ) return response(res, { code: 400, message: 'Os campos mensao_id e id são requeridos'})

        return await hashtagsRepo.del(id, mensao_id, req.parsedQuery.client_id) ?
            response(res):
            response(res, {
                code: 500,
                message:"Server Error - Erro ao tentar deletar hashtag"
            })

    }


}