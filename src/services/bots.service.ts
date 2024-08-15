import { Request, Response } from 'express'
import response from '../util/response'
import botsRepo from '../repositories/bots.repo'
import { generateBotToken } from '../libs/session_manager'

export default {

    add: async (req:Request, res:Response) => {

        if(!req.params.locale || !req.params.slug){
            return response(res, {
                code:400,
                message:'bad request'
            })
        }

        const locale = req.params.locale 
        const slug   = req.params.slug
        
        const resp   = await botsRepo.create(slug, locale)

        response(res, {
            code:resp.error ? 500 : 200
        })

    },

    createToken: async (req:Request, res:Response) => {

        if(!req.params.slug){
            return response(res, {
                code:400,
                message:'bad request'
            })
        }

        const botres = await botsRepo.getBot(req.params.slug)

        if(botres.error){
            return response(res, {
                code:500,
                message:'Erro no Servidor'
            })
        }

        if((botres.rows as any[]).length == 0){
            return response(res, {
                code:404,
                message:'Not Found'
            })
        }

        const bot = (botres.rows as any[])[0]

        const token = generateBotToken({
            slug:bot.slug,
            locale:bot.locale,
            vtoken:bot.vtoken
        })

        response(res, {
            code:200,
            body:token
        })

    }

}