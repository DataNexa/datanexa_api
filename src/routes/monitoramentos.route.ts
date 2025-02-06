import { Router } from 'express'
import monitoramentos from '../services/monitoramentos'
import AuthorizeMid from '../middlewares/AuthorizeMid'

const router = Router()

export default () => {

    router.get('/list', AuthorizeMid.onlyValidUser, monitoramentos.list)

    return router

}