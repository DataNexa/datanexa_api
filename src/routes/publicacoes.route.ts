import { Router } from "express";
import { authorization_route } from '../util/autorization'

import publicacoes_service from '../services/publicacoes.service'

const router = Router()

export default () => {

    router.post('/list', authorization_route('anyUserAuthorized', ['monitoramento@list']), publicacoes_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['monitoramento@list']), publicacoes_service.unique)

    return router
}