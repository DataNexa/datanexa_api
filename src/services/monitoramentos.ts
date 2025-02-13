import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import response from '../util/response'
import monitoramentoRepo from '../repositories/monitoramento.repo'
import { Monitoramento } from '../types/Monitoramento'

export default {


    read: async (req:Request, res:Response) => {

        const id = parseInt(req.params.id) || 0

        if(id == 0 || Number.isNaN(id)) {
            return response(res, { code: 400, message:'O parâmetro id é requerido' })
        }

        const parsed = req.parsedQuery
        parsed.filters['id'] = id
        parsed.filters['client_id'] = req.parsedQuery.client_id

        const monitoramentos = await monitoramentoRepo.get(parsed)

        if(!monitoramentos){
            return response(res, {
                code: 500,
                message: 'Ocorreu um erro inesperado no servidor'
            })
        }

        if(monitoramentos.length == 1){
            return response(res, {
                code:200,
                body:monitoramentos[0]
            })
        }

        response(res, { code: 404, message:'Monitoramento não encontrado'})

    },


    list: async (req:Request, res:Response) => {
        
        req.parsedQuery.filters['client_id'] = req.parsedQuery.client_id
        const monitoramentos = await monitoramentoRepo.get(req.parsedQuery)

        if(!monitoramentos){
            return response(res, { code: 400, message: 'Erro na requisição'})
        }

        response(res, { code: 200, body: monitoramentos })

    },


    update: async (req:Request, res:Response ) => {

        const client_id = req.parsedQuery.client_id

        await body('id').isInt().trim().run(req)
        await body('titulo').isString().trim().run(req)
        await body('descricao').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { id, titulo, descricao } = req.body
        const monitoramento:Monitoramento = { id, titulo, descricao }

        if(!await monitoramentoRepo.update(client_id, monitoramento)){
            return response(res, {
                code: 500,
                message:"Server Error - Erro ao tentar editar monitoramento"
            })
        }

        response(res)

    },


    create: async (req:Request, res:Response) => {

        const client_id = req.parsedQuery.client_id

        await body('titulo').isString().trim().run(req)
        await body('descricao').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { titulo, descricao } = req.body
        const monitoramento:Monitoramento = { id:0, titulo, descricao }

        const monitFinal = await monitoramentoRepo.set(client_id, monitoramento)

        if(!monitFinal){
            return response(res, {
                code: 500,
                message:"Server Error - Erro ao tentar criar monitoramento"
            }) 
        }

        response(res, {
            code:200,
            body: monitFinal
        })

    },


    delete: async (req:Request, res:Response) => {

        const client_id = req.parsedQuery.client_id
        const id = Number(req.params.id) || 0

        if(id == 0 || Number.isNaN(id)) {
            return response(res, { code: 400, message:'O parâmetro id é requerido' })
        }

        await monitoramentoRepo.del(client_id, id) ?
            response(res) :
            response(res, {
                code: 500,
                message:"Server Error - Erro ao tentar deletar monitoramento"
            }) 
        
    }


}