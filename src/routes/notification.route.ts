import { Router } from "express";
import account_auth from "../middlewares/account.auth";
import notificationService from "../services/notification.service";
import { authorization_route } from '../util/autorization'

const router = Router()

export default () => {

    router.post('/save_key', account_auth.hasToken, notificationService.save_key)
    router.post('/list', authorization_route('anyUser'), notificationService.list)
    return router

}