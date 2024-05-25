import express, { Express } from "express";
import { User } from "../model/User";
import UserFactory from "../model/UserFactory";
import routes from "../routes/routes";
import cors from 'cors';

declare global{
    namespace Express {
        interface Response {
            user: User,
            dataBody:any // aqui será injetado o dado
        }
    }
}

export default ():Express => {

    const app:Express = express()
    const cors_options: cors.CorsOptions = {
        origin: "*"
    };
    app.use(cors(cors_options))
    app.use(express.json())
    app.use('/', UserFactory)
    routes(app)
    return app

}