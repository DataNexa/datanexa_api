import { Express, Request, Response} from "express"
import filesRoutes from "./files.routes"
import globals from "../app/globals"

export default (app:Express) => {

    if(!globals.production){
        app.get('/test', (req:Request, res:Response) => {
            res.send({
                user:res.user,
                body:req.body
            })
        })
    }

    app.use('/files', filesRoutes())

    return app

}