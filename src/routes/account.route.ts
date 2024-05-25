import { Router } from "express";
import auth from "../services/user.service";
import authMid from "../middlewares/user.autorization";

const router = Router()

export default () => {
    router.get('/logar', auth.login)
    router.post('/createUser', authMid.createUserMid, auth.createUser)
    return router
}