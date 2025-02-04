import { Router, Request, Response } from 'express'
import AuthorizeMid from "../middlewares/AuthorizeMid"

const router = Router()

const sendOk =  (req:Request, res:Response) => res.send({code:200})

export default () => {

    router.get('/default', (req:Request, res:Response) => {
        res.send({
            user:res.user,
            body:req.body
        })
    })
    router.get('/onlyClientUser', AuthorizeMid.onlyClientUser, sendOk)
    router.get('/isNotAnon', AuthorizeMid.isNotAnon, sendOk)
    router.get('/onlyAdminUser', AuthorizeMid.onlyAdminUser, sendOk)
    router.get('/onlyValidUser', AuthorizeMid.onlyValidUser, sendOk)
    router.post('/onlyValidUser', AuthorizeMid.onlyValidUser, sendOk)

    // misturando rotas
    router.get('/onlyValidClient', AuthorizeMid.onlyClientUser, AuthorizeMid.onlyValidUser, sendOk)


    return router

}