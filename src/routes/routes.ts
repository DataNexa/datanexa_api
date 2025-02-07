import { Express, Request, Response} from "express"
import filesRoutes from "./files.routes"
import authRoutes from "./auth.route"
import globals from "../app/globals"
import testsRoutes from "./tests.route"
import MappingMid from '../middlewares/MappingMid'
import monitoramentosRoutes from "./monitoramentos.route"


export default (app:Express) => {

    if(!globals.production){
        app.use('/tests', testsRoutes())
    }
    
    app.use('/auth', authRoutes())
    app.use('/files', filesRoutes())
    app.use('/monitoramentos', MappingMid.mustHaveClientId, monitoramentosRoutes())
    return app

}
