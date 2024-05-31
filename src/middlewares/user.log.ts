import { Request, Response } from 'express'
import saveLog from '../util/logger'

export default {

    createUser: (req:Request, res:Response) => {
        const dataUser = res.user.getJSON()
        const dataBody = res.dataBody
        saveLog('auth@createUser', `${dataUser.slug} criou um usuário: e-mail ${dataBody.email} - usuário precisa autorizar`)
    }

}
  