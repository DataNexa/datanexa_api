import { Router } from 'express'
import auth from '../services/auth'

const router = Router()

export default () => {

    router.post('/login', auth.login)
    router.get('/openSession', auth.openSession)
    router.post('/genCode', auth.genCode)
    router.post('/consumeCode', auth.consumeCode)
    router.post('/updatePass', auth.updatePass)
    return router

}