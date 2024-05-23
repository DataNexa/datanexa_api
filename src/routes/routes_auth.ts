import { Router } from "express";
import auth from "../services/auth";
const router = Router()


export default () => {
    router.get('/logar', auth.logar)
    return router
}