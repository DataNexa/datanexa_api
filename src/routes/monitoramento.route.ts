import { Router } from "express";
import { authorization_route } from '../util/autorization'

import monitoramento_service from '../services/monitoramento.service'

const router = Router()

export default () => {

    router.post('/list', authorization_route('anyUserAuthorized', ['monitoramento@list']), monitoramento_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['monitoramento@list']), monitoramento_service.unique)
    router.post('/create', authorization_route('anyUserAuthorized', ['monitoramento@create']), monitoramento_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['monitoramento@update']), monitoramento_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['monitoramento@delete']), monitoramento_service.delete)

    return router
}