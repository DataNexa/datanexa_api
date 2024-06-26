import { Router } from "express";
import { authorization_route } from '../../util/autorization'

import opcoes_pergunta_pesquisa_service from '../../services/pesquisas/opcoes_pergunta_pesquisa.service'

const router = Router()

export default () => {

    router.post('/list', authorization_route('anyUserAuthorized', ['pesquisas@list']), opcoes_pergunta_pesquisa_service.list)
    router.post('/create', authorization_route('anyUserAuthorized', ['pesquisas@create']), opcoes_pergunta_pesquisa_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['pesquisas@update']), opcoes_pergunta_pesquisa_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['pesquisas@delete']), opcoes_pergunta_pesquisa_service.delete)

    return router
}