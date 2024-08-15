import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'

import { client_repo, client_i } from '../repositories/client.repo'

export default {

    create: async (req:Request, res:Response) => {

        await body('nome').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        function generateSlug(name: string): string {
            return name
                .toLowerCase()       
                .trim()             
                .replace(/\s+/g, '_') 
                .replace(/[^a-z0-9_]/g, '')
        }

        const { nome } = req.body
        const slug = generateSlug(nome)
        
        const resp_repo = await client_repo.register(nome,slug,1)

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

    list: async (req:Request, res:Response) => {

        const resp_repo = await client_repo.list()

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

    update: async (req:Request, res:Response) => {

        await body('nome').isString().trim().run(req)
        await body('slug').isString().trim().run(req)
        await body('ativo').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { nome,slug,ativo,id } = req.body
        const resp_repo = await client_repo.update(nome,slug,ativo,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar alterar registro'
            })
        }

        response(res)

    },

}