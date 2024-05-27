import {Request, Response, NextFunction} from 'express'

import response from '../helpers/response'
import authorization from '../helpers/autorization'

export default {

    onlyTempSessions: (req:Request, res:Response, next:NextFunction) => {
        
        if(!res.user.getJSON().temp){
            response(res, {
                code:401,
                message:'Você não tem acesso ao serviço'
            }, next)
        }

    },

    hasToken: (req:Request, res:Response, next:NextFunction) => {

        if(!res.user.getJSON().token_account){
            response(res, {
                code:401,
                message:'Você não tem acesso ao serviço'
            }, next)
        }

    }

}
