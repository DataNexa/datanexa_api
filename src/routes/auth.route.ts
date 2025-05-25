import { Router } from 'express'
import auth from '../services/auth'
import AuthorizeMid from '../middlewares/AuthorizeMid'

const router = Router()

export default () => {

    router.post('/google', auth.google)
    router.post('/login', auth.login)
    router.get('/openSession', auth.openSession)
    router.post('/genCode', auth.genCode)
    router.post('/consumeCode', auth.consumeCode)
    router.post('/updatePass', AuthorizeMid.onlyValidUser, auth.updatePass)
    router.post('/openSessionUsingSecretToken', auth.openSessionUsingSecretToken)
    return router

}