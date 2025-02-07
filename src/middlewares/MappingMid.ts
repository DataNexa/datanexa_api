import { Request, Response, NextFunction } from 'express'
import response from '../util/response'


export default {


    mustHaveClientId: (req:Request, res:Response, next:NextFunction) => {

        const client_id = req.body.client_id || req.query.client_id

        if(!client_id || parseInt(client_id) == 0) {
            return response(res, { code: 400, message: 'É necessário ter client_id' })
        }

        next()

    }

}