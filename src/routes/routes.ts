import express, {Express, Request, Response} from "express"
import filesRoutes from "./files.routes"

export default (app:Express) => {

    app.use('/files', filesRoutes())

    return app

}