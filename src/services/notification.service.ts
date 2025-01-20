import { Request, Response } from 'express'
import response from '../util/response'
import { body, validationResult } from 'express-validator'
import notificationRepo from '../repositories/notification.repo'

export default {

    save_key: async (req:Request, res:Response) => {

        await body('token').isString().run(req)

        if(!validationResult(req).isEmpty()){
            return response(res, {
                code: 400,
                message:"Bad Request"
            })
        }

        const token  = req.body.token
        const device = res.user.getUserTokenDeviceId()

        const resp   = await notificationRepo.saveToken(device, token)
        
        if(!resp){
            return response(res, {
                code:500,
                message:'erro ao tentar salvar o token'
            })
        }

        response(res)

    }, 


    list:  async (req:Request, res:Response) => {

        const user_id = res.user.getUserId()
        const dev_id  = res.user.getUserTokenDeviceId()

        response(res)

    }


}