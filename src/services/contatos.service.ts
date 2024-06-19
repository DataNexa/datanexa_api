import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'

import { contatos_repo, contatos_i } from '../repositories/contatos.repo'

export default {

    

    list: async (req:Request, res:Response) => {

        await body('grupo_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { grupo_id,client_id } = req.body
        const resp_repo = await contatos_repo.list(grupo_id,client_id)

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

        await body('grupo_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { grupo_id,client_id,id } = req.body
        const resp_repo = await contatos_repo.unique(grupo_id,client_id,id)

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

        await body('grupo_id').isNumeric().run(req)
        await body('apelido').isString().trim().run(req)
        await body('nome').isString().trim().run(req)
        await body('whatsapp').isString().trim().run(req)
        await body('email').isString().trim().run(req)
        await body('instagram').isString().trim().run(req)
        await body('twitter').isString().trim().run(req)
        await body('facebook').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const { grupo_id,apelido,nome,whatsapp,email,instagram,twitter,facebook,client_id } = req.body
        const resp_repo = await contatos_repo.create(grupo_id,apelido,nome,whatsapp,email,instagram,twitter,facebook,client_id)

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

        await body('grupo_id').isNumeric().run(req)
        await body('apelido').isString().trim().run(req)
        await body('nome').isString().trim().run(req)
        await body('whatsapp').isString().trim().run(req)
        await body('email').isString().trim().run(req)
        await body('instagram').isString().trim().run(req)
        await body('twitter').isString().trim().run(req)
        await body('facebook').isString().trim().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { grupo_id,apelido,nome,whatsapp,email,instagram,twitter,facebook,client_id,id } = req.body
        const resp_repo = await contatos_repo.update(grupo_id,apelido,nome,whatsapp,email,instagram,twitter,facebook,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar alterar registro'
            })
        }

        response(res)

    },    
    
    delete: async (req:Request, res:Response) => {

        await body('grupo_id').isNumeric().run(req)
        await body('client_id').isNumeric().run(req)
        await body('id').isNumeric().run(req)


        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }
        
        const { grupo_id,client_id,id } = req.body
        const resp_repo = await contatos_repo.delete(grupo_id,client_id,id)

        if(!resp_repo){
            return response(res, {
                code:500,
                message: 'Erro no servidor ao tentar excluir registro'
            })
        }

        response(res)

    },

}