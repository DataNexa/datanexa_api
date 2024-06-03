import { Router } from "express";
import user_service from "../services/user.service";
import user_auth from "../middlewares/user.auth";
import user_log from '../middlewares/user.log'
import { authorization_route } from '../util/autorization'

const router = Router()

export default () => {
    router.post('/openSession', user_auth.withToken, user_service.openSession)
    router.get('/getDataUser', user_auth.isNotAnonimous, user_service.getDataUser)
    router.post('/create', authorization_route('anyUserAuthorized',['user@create']), user_service.create)
    return router
}