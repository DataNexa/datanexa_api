import {Request, Response, NextFunction} from 'express'

import response from '../util/response'
import { type_user } from '../model/User'

export default {

    withToken: (req:Request, res:Response, next:NextFunction) => {
        if(res.user.getAccountId() == 0 || res.user.getVToken() == 0 || res.user.getUserTokenDeviceId() == 0 )
            return response(res, {
                code:401,
                message:'Você não tem acesso ao serviço'
            }, next)
        next()
    },

    isNotAnonimous: (req:Request, res:Response, next:NextFunction) => {
        if(res.user.getTypeUser() == type_user.ANONIMUS){
            return response(res, {
                code:401,
                message:'Usuário não autenticado'
            }, next)
        }
        next()
    }

}

