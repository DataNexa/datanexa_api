import { Router } from "express";
import { authorization_route } from '../util/autorization'

import grupos_service from '../services/grupos.service'

const router = Router()

export default () => {

    router.post('/list', authorization_route('anyUserAuthorized', ['grupos@list']), grupos_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['grupos@list']), grupos_service.unique)
    router.post('/create', authorization_route('anyUserAuthorized', ['grupos@create']), grupos_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['grupos@update']), grupos_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['grupos@delete']), grupos_service.delete)

    return router
}