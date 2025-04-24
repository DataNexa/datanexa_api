import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import response from '../util/response'
import password from '../util/password'
import userRepo from '../repositories/user.repo'
import UserFactory from '../core/auth/UserFactory'
import JWT from '../core/auth/JWT'
import { tokenValidation } from '../core/auth/GoogleValidation';
import cookie from '../core/auth/cookie'
import Logger from '../util/logger'
import sleeper from '../util/seleeper'

interface googlePayLoad { email:string, name:string, sub:string, picture:string, given_name:string }

export default {

    google: async (req:Request, res:Response) => {

        await body('googleToken').isString().trim().run(req)
        
        if(!validationResult(req).isEmpty()){
            Logger.error('Campo de googleToken faltando', 'google')
            return response(res, {
                code: 400,
                message:"Bad Request - Precisa da credencial do google"
            })
        }

        const { googleToken } = req.body

        const data = await tokenValidation(googleToken)

        if(!data) {
            console.log('Erro ao tentar validar o token do google');
            return response(res, {
                code:500,
                message: 'Erro ao tentar resgatar informações do google'
            })
        }

        const gpayload = data as any as googlePayLoad
        const userByEmail = await userRepo.getUserByEmail(gpayload.email)
        
        const clientIp = Array.isArray(req.headers['x-forwarded-for']) 
            ? req.headers['x-forwarded-for'][0] 
            : req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'undefined';

        const userAgent = req.headers['user-agent'] || 'undefined';

        if(!userByEmail){

            const userDetail = await userRepo.saveUserClient(gpayload.name, gpayload.email, gpayload.picture, '')

            if(!userDetail) {
                Logger.error('Erro ao tentar salvar o usuário no banco de dados', 'google')
                
                return response(res, {
                    code: 500,
                    message: 'Erro ao tentar salvar o usuário no banco de dados'
                })
            }

            const hash = await userRepo.saveDeviceAndGenerateTokenRefresh(userDetail.id, gpayload.email, userAgent, clientIp)

            if(!hash){
                Logger.error('Erro ao tentar salvar refresh_token', 'google')
                return response(res, {
                    code: 500,
                    message: 'Erro ao tentar salvar criar refresh_token'
                })
            }

            cookie.setCookie(res, 'refresh_token', hash)

            return response(res, {
                body:{
                    user:userDetail
                },
                code:200
            })
        }

        const hash = await userRepo.saveDeviceAndGenerateTokenRefresh(userByEmail.id, gpayload.email, userAgent, clientIp)

        if(!hash){
            
            Logger.error('Erro ao tentar salvar refresh_token', 'google')
            
            return response(res, {
                code: 500,
                message: 'Erro ao tentar salvar criar refresh_token'
            })
        }

        cookie.setCookie(res, 'refresh_token', hash)

        response(res, {
            body:{
                user:userByEmail
            },
            code:200
        })

    },


    login: async (req:Request, res:Response) => {

        await body('email').isEmail().trim().run(req)
        await body('senha').isString().trim().run(req)

        const clientIp = Array.isArray(req.headers['x-forwarded-for']) 
            ? req.headers['x-forwarded-for'][0] 
            : req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'undefined';

        const userAgent = req.headers['user-agent'] || 'undefined';

        if(!validationResult(req).isEmpty()){
            Logger.error('Campo de e-mail ou senha faltando', 'login')
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

        if(!user || !user.user){
            return response(res, {
                code: 404,
                message:"Not Found - Usuário não encontrado"
            })
        }

        const hash = await userRepo.saveDeviceAndGenerateTokenRefresh(user.user.id, email, userAgent, clientIp)

        if(!hash){
            Logger.error('Erro ao tentar salvar refresh_token', 'login')
            return response(res, {
                code: 500,
                message: 'Erro ao tentar salvar criar refresh_token'
            })
        }

        cookie.setCookie(res, 'refresh_token', hash)

        response(res, {
            body:user,
            code:200
        })

    },

    openSession: async (req:Request, res:Response) => {

        const refresh_token = req.cookies['refresh_token'];

        await sleeper.secureSleep(2000)

        if(!refresh_token){
            Logger.error('refresh_token não enviado', 'openSession')
            return response(res, {code:401}) 
        }

        const user = await userRepo.getUserByRefreshToken(refresh_token)

        if(!user){
            Logger.error('refresh_token inválido', 'openSession')
            return response(res, {code:401}) 
        }

        const session = await UserFactory.generateUserToken(user)

        response(res, {code:200, body: session})

    },


    genCode: async (req:Request, res:Response) => {

        await body('email').isEmail().trim().run(req)

        if(!validationResult(req).isEmpty()){
            Logger.error('Campo de e-mail faltando', 'genCode')
            return response(res, {
                code: 400,
                message:"Bad Request - Campos de e-mail faltando"
            })
        }

        const { email } = req.body
        const user = await userRepo.getUserByEmail(email)
        
        if(!user){
            Logger.error('Usuário não encontrado', 'genCode')
            return response(res, {
                code: 404,
                message:"Usuário não encontrado"
            })
        }

        const code = JWT.generateRandomCode(6)

        if(!await userRepo.saveCodeUser(code, user.id)){
            Logger.error('Erro ao tentar salvar o código', 'genCode')
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
            Logger.error('Campo de e-mail ou código faltando', 'consumeCode')
            return response(res, {
                code: 400,
                message:"Bad Request - Campos Faltando"
            })
        }

        const { email, code } = req.body

        const user = await userRepo.getUserByEmail(email)
        
        if(!user){
            Logger.error('Usuário não encontrado', 'consumeCode')
            return response(res, {
                code: 404,
                message:"Usuário não encontrado"
            })
        }

        if(!await userRepo.consumeCode(code, user.id)){
            Logger.error('Erro ao tentar consumir o código', 'consumeCode')
            return response(res, {
                code: 400,
                message:"Erro ao tentar consumir o código"
            })
        }

        response(res, {
            code:200,
            body: await UserFactory.generateUserToken(user, 0.5)
        })

    },


    updatePass: async (req:Request, res:Response) => {

        await body('newPass').isString().trim().run(req)

        if(!validationResult(req).isEmpty()){
            Logger.error('Campo de nova senha faltando', 'updatePass')
            return response(res, {
                code: 400,
                message:"Bad Request - Campo de nova senha faltando"
            })
        }

        const { newPass } = req.body 

        if(!password.passIsStronger(newPass)){
            return response(res, {
                code: 400,
                message:"Bad Request - Senha muito fraca"
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