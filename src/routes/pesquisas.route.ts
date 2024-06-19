import { Router } from "express";
import { authorization_route } from '../util/autorization'
import { sleeper } from "../middlewares/sleeper";

import pesquisas_service from '../services/pesquisas/pesquisas.service'
import opcoes_pergunta_perfil_pesquisaRoute from "./pesquisas/opcoes_pergunta_perfil_pesquisa.route";
import opcoes_pergunta_pesquisaRoute from "./pesquisas/opcoes_pergunta_pesquisa.route";
import perguntas_perfil_pesquisaRoute from "./pesquisas/perguntas_perfil_pesquisa.route"; 
import perguntas_pesquisaRoute from "./pesquisas/perguntas_pesquisa.route";

const router = Router()

export default () => {

    router.post('/list', authorization_route('anyUserAuthorized', ['pesquisas@list']), pesquisas_service.list)
    router.post('/unique', authorization_route('anyUserAuthorized', ['pesquisas@list']), pesquisas_service.unique)
    router.post('/create', sleeper(2000),authorization_route('anyUserAuthorized', ['pesquisas@create']), pesquisas_service.create)
    router.post('/update', authorization_route('anyUserAuthorized', ['pesquisas@update']), pesquisas_service.update)
    router.post('/delete', authorization_route('anyUserAuthorized', ['pesquisas@delete']), pesquisas_service.delete)
    
    router.use('/opcoes_pergunta_perfil_pesquisa', opcoes_pergunta_perfil_pesquisaRoute())
    router.use('/opcoes_pergunta_pesquisa', opcoes_pergunta_pesquisaRoute())
    router.use('/perguntas_perfil_pesquisa', perguntas_perfil_pesquisaRoute())
    router.use('/perguntas_pesquisa', perguntas_pesquisaRoute())
    
    return router

}