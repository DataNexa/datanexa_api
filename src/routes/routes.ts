import {Express} from "express"
import account_routes from "./account.route"
import globals from "../config/globals"
import test from "../_testes/test"
export default (app:Express) => {

    app.use('/account', account_routes())
    if(!globals.production){
        test()
    }
    return app
}