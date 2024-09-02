import { Router } from "express";
import { authorization_route, onlyBot } from '../util/autorization'

import publicacoes_service from '../services/publicacoes.service'

const router = Router()

export default () => {

    router.post('/filter_by_date', authorization_route('anyUserAuthorized', ['monitoramento@list']), publicacoes_service.filter_by_date)
    router.post('/list', authorization_route('anyUserAuthorized', ['monitoramento@list']), publicacoes_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['monitoramento@list']), publicacoes_service.unique)
    router.post('/add', onlyBot(), publicacoes_service.add)
    router.post('/filter', onlyBot(), publicacoes_service.filter)
    router.post('/list_by_media', onlyBot(), publicacoes_service.list_by_media)
    router.post('/update', onlyBot(), publicacoes_service.update)

    return router
    
}