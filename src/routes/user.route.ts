import { Router } from "express";
import account_service from "../services/account.service";
import account_auth from "../middlewares/account.auth";
import account_log from '../middlewares/account.log'

const router = Router()

export default () => {
    router.get('/login', account_service.login, account_log.login)
    router.post('/createUser', authMid.createUserMid, account.createUser)
    return router
}