import { Router } from 'express'
import monitoramentos from '../services/monitoramentos'
import AuthorizeMid from '../middlewares/AuthorizeMid'

const router = Router()

export default () => {

    router.get('/list', AuthorizeMid.onlyValidUser, monitoramentos.list)
    router.post('/update', AuthorizeMid.onlyValidUser, monitoramentos.update)
    router.post('/create', AuthorizeMid.onlyValidUser, monitoramentos.create)
    router.get('/delete/:id', AuthorizeMid.onlyValidUser, monitoramentos.delete)
    router.get('/read/:id', AuthorizeMid.onlyValidUser, monitoramentos.read)

    return router

}