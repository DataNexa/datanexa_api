import { Router } from "express";
import { authorization_route } from '../util/autorization'

import tarefas_service from '../services/tarefas.service'

const router = Router()

export default () => {

    router.post('/list',   authorization_route('anyUserAuthorized', ['campanhas@list']), tarefas_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['campanhas@list']), tarefas_service.unique)
    router.post('/create', authorization_route('anyUserAuthorized', ['campanhas@tarefas_create']), tarefas_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['campanhas@tarefas_update']), tarefas_service.update)
    // router.post('/delete', authorization_route('anyUserAuthorized', ['campanhas@tarefas_delete']), tarefas_service.delete)

    return router

}