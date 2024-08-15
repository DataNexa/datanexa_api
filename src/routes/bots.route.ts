import { Router, Request, Response } from "express";
import { authorization_route, onlyBot } from '../util/autorization'
import { sleeper } from "../middlewares/sleeper";

import bots_service from "../services/bots.service";
import response from "../util/response";

const router = Router()

export default () => {

    router.get('/add/:locale/:slug', sleeper(2000), authorization_route('onlyAdmin'), bots_service.add)
    router.get('/token/:slug',  sleeper(2000), authorization_route('onlyAdmin'), bots_service.createToken)
    router.get('/imreal', onlyBot(), (req:Request, res:Response) => response(res))
    
    return router

}