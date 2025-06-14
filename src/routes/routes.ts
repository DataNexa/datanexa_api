import { Express, Request, Response} from "express"
import filesRoutes from "./files.routes"
import authRoutes from "./auth.route"
import globals from "../app/globals"
import testsRoutes from "./tests.route"
import MappingMid from '../middlewares/MappingMid'
import monitoramentosRoutes from "./monitoramentos.route"
import hashtagsRoute from "./hashtags.route"
import publishRoute from "./publish.route"

export default (app:Express) => {

    if(!globals.production){
        app.use('/tests', testsRoutes())
    }
    
    app.use('/auth', authRoutes())
    app.use('/files', filesRoutes())
    app.use('/monitoramentos', monitoramentosRoutes())
    app.use('/hashtags', MappingMid.mustHaveClientId, hashtagsRoute())
    app.use('/publicacoes',  publishRoute()) // MappingMid.mustHaveClientId está interno

    return app

}
