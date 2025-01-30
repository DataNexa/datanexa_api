import { Router } from 'express'
import auth from '../services/auth'

const router = Router()

export default () => {

    router.post('/login', auth.login)

    return router

}