import { Request, Response, NextFunction } from 'express'
import response from '../util/response'
import { UserDetail } from '../types/User'

export default {

    onlyClientUser: (req:Request, res:Response, next:NextFunction) => { 
        if(res.user.type == 1){
            next()
        } else {
            response(res, { code: 401 })
        }
    },

    onlyAdminUser: (req:Request, res:Response, next:NextFunction) => {
        if(res.user.type == 2){
            next()
        } else {
            response(res, { code: 401 })
        }
    },

    onlyValidUser: (req:Request, res:Response, next:NextFunction) => {
        
        const clientId = req.body.client_id || req.query.client_id;

        if(res.user.type == 0){ 
            return response(res, { code: 401 });
        }

        if (!clientId && res.user.type > 0) {
            return next()
        }

        const cliIdInt = parseInt(clientId)

        if (isNaN(cliIdInt)) {
            return response(res, { code: 400 });
        }
        
        if(res.user.type == 1){
            const u = res.user as UserDetail
            if(u.client_id != cliIdInt){
                return response(res, { code: 401 })
            }
        }

        next()

    },

    isNotAnon: (req:Request, res:Response, next:NextFunction) => {
        if(res.user.type > 0){
            next()
        } else {
            response(res, { code: 401 })
        }
    },

}