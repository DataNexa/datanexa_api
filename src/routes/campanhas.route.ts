import { Router } from "express";
import { authorization_route } from '../util/autorization'
import { sleeper } from "../middlewares/sleeper";

import campanhas_service from '../services/campanhas.service'

const router = Router()

export default () => {

    router.post('/list',   authorization_route('anyUserAuthorized', ['campanhas@list']), campanhas_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['campanhas@list']), campanhas_service.unique)
    router.post('/create', sleeper(2000),authorization_route('anyUserAuthorized', ['campanhas@create']), campanhas_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['campanhas@update']), campanhas_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['campanhas@delete']), campanhas_service.delete)

    return router
}