import {Express} from "express"
import account_routes from "./account.route"
import user_routes from "./user.route"
import globals from "../config/globals"
import test from "../_testes/test"
export default (app:Express) => {

    app.use('/account', account_routes())
    app.use('/user', user_routes())
    if(!globals.production){
        test()
    }
    return app
}