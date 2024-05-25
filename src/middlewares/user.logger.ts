import { Request, Response } from 'express'
import saveLog from '../helpers/logger'

export default {

    createUser: (req:Request, res:Response) => {
        const dataUser = res.user.getJSON()
        const dataBody = res.dataBody
        saveLog(res.user.getJSON().user_id, 'auth@createUser', `${dataUser.slug} criou um usuário: e-mail ${dataBody.email} - usuário precisa autorizar`)
    }

}
  