import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import response from '../util/response'
import password from '../util/password'
import userRepo from '../repositories/user.repo'
import UserFactory from '../core/auth/UserFactory'
import JWT from '../core/auth/JWT'
import { tokenValidation } from '../core/auth/GoogleValidation';

interface googlePayLoad { email:string, name:string, sub:string, picture:string, given_name:string }

export default {

    google: async (req:Request, res:Response) => {

        await body('googleToken').isString().trim().run(req)
        
        if(!validationResult(req).isEmpty()){
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
                console.log('Erro ao tentar salvar o usuário no banco de dados');
                
                return response(res, {
                    code: 500,
                    message: 'Erro ao tentar salvar o usuário no banco de dados'
                })
            }

            const hash = await userRepo.saveDeviceAndGenerateTokenRefresh(userDetail.id, gpayload.email, userAgent, clientIp)

            if(!hash){
                console.log('Erro ao tentar salvar refresh_token');
                return response(res, {
                    code: 500,
                    message: 'Erro ao tentar salvar criar refresh_token'
                })
            }

            return response(res, {
                body:{
                    user:userDetail,
                    refresh_token: hash
                },
                code:200
            })
        }

        const hash = await userRepo.saveDeviceAndGenerateTokenRefresh(userByEmail.id, gpayload.email, userAgent, clientIp)

        if(!hash){
            console.log('Erro ao tentar salvar refresh_token');
            
            return response(res, {
                code: 500,
                message: 'Erro ao tentar salvar criar refresh_token'
            })
        }

        response(res, {
            body:{
                user:userByEmail,
                refresh_token: hash
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

        const user = await userRepo.getUserByRefreshToken(hash)

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