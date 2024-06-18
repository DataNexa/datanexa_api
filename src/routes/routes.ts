import {Express} from "express"
import account_routes from "./account.route"
import user_routes from "./user.route"
import globals from "../config/globals"
import test from "../_testes/test"
import tarefas_route from "./tarefas.route"
import campanhas_route from "./campanhas.route"
export default (app:Express) => {

    app.use('/account', account_routes())
    app.use('/user', user_routes())
    app.use('/tarefas', tarefas_route())
    app.use('/campanhas', campanhas_route())
    if(!globals.production){
        test()
    }
    return app
}