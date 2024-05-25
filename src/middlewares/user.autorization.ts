import {Request, Response, NextFunction} from 'express'

import response from '../helpers/response'
import authorization from '../helpers/autorization'

export default {

    createUserMid: (req:Request, res:Response, next:NextFunction) => {
        
        if(authorization(req,res).setPermissions(['auth@createUser']).anyUserAuthorized()){
            return next()
        }

        response(res, {
            code:401,
            message:'Você não tem acesso ao serviço'
        }, next)

    }

}

