import {Express} from "express"
import routes_auth from "./routes_auth"
import globals from "../config/globals"
import test from "../_testes/test"
export default (app:Express) => {

    app.use('/auth', routes_auth())
    if(!globals.production){
        test()
    }
    return app
}