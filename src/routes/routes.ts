import express, {Express} from "express"
import account_routes from "./account.route"
import user_routes from "./user.route"
import tarefas_route from "./tarefas.route"
import campanhas_route from "./campanhas.route"
import grupos_route from "./grupos.route"
import contatos_route from "./contatos.route"
import publicacoes_route from "./publicacoes.route"
import pesquisas_route from "./pesquisas.route"
import monitoramento_route from "./monitoramento.route"
import hashtags_route from "./hashtags.route"

export default (app:Express) => {

    app.use('/account', account_routes())
    app.use('/user', user_routes())
    app.use('/tarefas', tarefas_route())
    app.use('/campanhas', campanhas_route())
    app.use('/grupos', grupos_route())
    app.use('/contatos', contatos_route())
    app.use('/publicacoes', publicacoes_route())
    app.use('/pesquisas', pesquisas_route())
    app.use('/monitoramento', monitoramento_route())
    app.use('/hashtags', hashtags_route())
    return app
    
}