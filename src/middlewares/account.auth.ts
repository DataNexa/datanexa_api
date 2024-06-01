import {Request, Response, NextFunction} from 'express'

import response from '../util/response'
import authorization from '../util/autorization'
import globals from '../config/globals'

export default {

    onlyTempSessions: (req:Request, res:Response, next:NextFunction) => {

        if(!res.user.getJSON().temp){
            response(res, {
                code:401,
                message:'Você não tem acesso ao serviço'
            }, next)
        }
        next()

    },

    hasToken: (req:Request, res:Response, next:NextFunction) => {

        if(!res.user.getJSON().token_account){
            return response(res, {
                code:401,
                message:'Você não tem acesso ao serviço'
            }, next)
        }

        next()
    }

}
