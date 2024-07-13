import { Router } from "express";
import { authorization_route } from '../util/autorization'

import hashtags_service from '../services/hashtags.service'

const router = Router()

export default () => {

    router.post('/list',   authorization_route('anyUserAuthorized', ['monitoramento@list']),   hashtags_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['monitoramento@list']),   hashtags_service.unique)
    router.post('/create', authorization_route('anyUserAuthorized', ['monitoramento@create']), hashtags_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['monitoramento@update']), hashtags_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['monitoramento@delete']), hashtags_service.delete)

    return router
}