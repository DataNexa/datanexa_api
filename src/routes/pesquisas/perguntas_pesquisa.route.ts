import { Router } from "express";
import { authorization_route } from '../../util/autorization'

import perguntas_pesquisa_service from '../../services/pesquisas/perguntas_pesquisa.service'

const router = Router()

export default () => {

    router.post('/list', authorization_route('anyUserAuthorized', ['pesquisas@list']), perguntas_pesquisa_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['pesquisas@list']), perguntas_pesquisa_service.unique)
    router.post('/create', authorization_route('anyUserAuthorized', ['pesquisas@create']), perguntas_pesquisa_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['pesquisas@update']), perguntas_pesquisa_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['pesquisas@delete']), perguntas_pesquisa_service.delete)

    return router
}