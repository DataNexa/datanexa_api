import { Router } from "express";
import { authorization_route, onlyBot,botAndUserAuthorized } from '../util/autorization'

import fila_monitoramento_service from '../services/fila_monitoramento.service'

import monitoramento_service from '../services/monitoramento.service'

const router = Router()

export default () => {

    router.post('/listPriority', authorization_route('anyUserAuthorized', ['monitoramento@list']), monitoramento_service.listPriority)
    router.post('/list', authorization_route('anyUserAuthorized', ['monitoramento@list']), monitoramento_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['monitoramento@list']), monitoramento_service.unique)
    router.post('/create', authorization_route('anyUserAuthorized', ['monitoramento@create']), monitoramento_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['monitoramento@update']), monitoramento_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['monitoramento@delete']), monitoramento_service.delete)
    router.post('/fila_manager', authorization_route('anyUserAuthorized', ['monitoramento@update']), fila_monitoramento_service.manager)
    router.post('/fila_list', botAndUserAuthorized(['monitoramento@list']), fila_monitoramento_service.list)
    router.post('/ativar', authorization_route('anyUserAuthorized', ['monitoramento@update']), monitoramento_service.ativar)
    router.post('/repetir', authorization_route('anyUserAuthorized', ['monitoramento@update']), monitoramento_service.repetir)

    router.post('/alterarStatusTask', onlyBot(), fila_monitoramento_service.alterarStatusTask)
    router.get('/listUniquePerClient', onlyBot(), fila_monitoramento_service.listUniquePerClient)
    router.get('/info', onlyBot(), fila_monitoramento_service.info)

    return router
}