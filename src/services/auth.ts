import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import response from '../util/response'
import password from '../util/password'
import userRepo from '../repositories/user.repo'
import { UserDetail } from '../types/User'

export default {


    login: async (req:Request, res:Response) => {

        await body('email').isEmail().trim().run(req)
        await body('senha').isString().trim().run(req)

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

        const user = userRepo.getUserByEmailAndPass(email, senha)

        if(!user){
            return response(res, {
                code: 404,
                message:"Not Found - Usuário não encontrado"
            })
        }

    },

    openSession: (req:Request, res:Response) => {

        

    }


}