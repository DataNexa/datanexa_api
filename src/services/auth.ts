import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import response from '../util/response'
import password from '../util/password'
import userRepo from '../repositories/user.repo'
import UserFactory from '../core/auth/UserFactory'
import JWT from '../core/auth/JWT'

export default {


    login: async (req:Request, res:Response) => {

        await body('email').isEmail().trim().run(req)
        await body('senha').isString().trim().run(req)

        const clientIp = Array.isArray(req.headers['x-forwarded-for']) 
            ? req.headers['x-forwarded-for'][0] 
            : req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'undefined';

        const userAgent = req.headers['user-agent'] || 'undefined';

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { email, senha } = req.body
        
        if(!password.passIsStronger(senha)){
            return response(res, {
                code: 400,
                message:"Bad Request - Senha Inválida"
            })
        }

        const user = await userRepo.getUserByEmailAndPass(email, senha, userAgent, clientIp)

        if(!user){
            return response(res, {
                code: 404,
                message:"Not Found - Usuário não encontrado"
            })
        }

        response(res, {
            body:user,
            code:200
        })

    },

    openSession: async (req:Request, res:Response) => {

        if(!req.headers.authorization){
            return response(res, {code:401})
        } 

        const [type, hash] = req.headers.authorization.split(' ')
        if(type != 'Open'){
            return response(res, {code:401}) 
        }

        const user = await userRepo.getUserByHash(hash)

        if(!user){
            return response(res, {code:401}) 
        }

        const session = UserFactory.generateUserToken(user)

        response(res, {code:200, body: session})

    },


    genCode: async (req:Request, res:Response) => {

        await body('email').isEmail().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { email } = req.body
        const user = await userRepo.getUserByEmail(email)
        
        if(!user){
            return response(res, {
                code: 404,
                message:"Usuário não encontrado"
            })
        }

        const code = JWT.generateRandomCode(6)

        if(!await userRepo.saveCodeUser(code, user.id)){
            return response(res, {
                code: 500,
                message:"Erro ao tentar gerar o código"
            })
        }

        // envia por e-mail

        response(res, {
            code:200,
            body:code
        })

    },


    consumeCode: async (req:Request, res:Response) => {

        await body('email').isEmail().trim().run(req)
        await body('code').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { email, code } = req.body

        const user = await userRepo.getUserByEmail(email)
        
        if(!user){
            return response(res, {
                code: 404,
                message:"Usuário não encontrado"
            })
        }

        if(!await userRepo.consumeCode(code, user.id)){
            return response(res, {
                code: 400,
                message:"Erro ao tentar consumir o código"
            })
        }

        response(res, {
            code:200,
            body: await UserFactory.generateUserToken(user)
        })

    },


    updatePass: async (req:Request, res:Response) => {

        await body('newPass').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { newPass } = req.body 

        if(!password.passIsStronger(newPass)){
            return response(res, {
                code: 400,
                message:"Bad Request - Senha Inválida"
            })
        }

        if(!await userRepo.updatePass(res.user.id, newPass)){
            return response(res, {
                code: 500,
                message:"Erro ao tentar salvar a nova senha."
            })
        }

        response(res)

    }

}