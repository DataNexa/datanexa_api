import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'

import { tarefas_repo, tarefas_i } from '../repositories/tarefas.repo'

export default {

    

    list: async (req:Request, res:Response) => {

        await body('campanha_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { campanha_id,client_id } = req.body
        const resp_repo = await tarefas_repo.list(campanha_id,client_id)

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

        await body('campanha_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { campanha_id,client_id,id } = req.body
        const resp_repo = await tarefas_repo.unique(campanha_id,client_id,id)

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

        await body('campanha_id').isNumeric().run(req)
        await body('tarefa').isString().trim().run(req)
        await body('status').isNumeric().run(req)
        await body('createAt').isString().trim().run(req)
        await body('dataLimite').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { campanha_id,tarefa,status,createAt,dataLimite,client_id } = req.body
        const resp_repo = await tarefas_repo.create(campanha_id,tarefa,status,createAt,dataLimite,client_id)

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

        await body('campanha_id').isNumeric().run(req)
        await body('tarefa').isString().trim().run(req)
        await body('status').isNumeric().run(req)
        await body('createAt').isString().trim().run(req)
        await body('dataLimite').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { campanha_id,tarefa,status,createAt,dataLimite,client_id,id } = req.body
        const resp_repo = await tarefas_repo.update(campanha_id,tarefa,status,createAt,dataLimite,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar alterar registro'
            })
        }

        response(res)

    },    
    
    delete: async (req:Request, res:Response) => {

        await body('campanha_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { campanha_id,client_id,id } = req.body
        const resp_repo = await tarefas_repo.delete(campanha_id,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar excluir registro'
            })
        }

        response(res)

    },

}