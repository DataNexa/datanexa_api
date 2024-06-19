import { Router } from "express";
import { authorization_route } from '../util/autorization'

import contatos_service from '../services/contatos.service'

const router = Router()

export default () => {

    router.post('/list', authorization_route('anyUserAuthorized', ['grupos@list']), contatos_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['grupos@list']), contatos_service.unique)
    router.post('/create', authorization_route('anyUserAuthorized', ['contatos@create']), contatos_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['contatos@update']), contatos_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['contatos@delete']), contatos_service.delete)

    return router
}