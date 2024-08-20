import express, { Express } from "express";
import { User } from "../libs/User";
import UserFactory from "../libs/UserFactory";
import routes from "../routes/routes";
import cors from 'cors';
import create_master_user from "./auto";

declare global{
    namespace Express {
        interface Response {
            user: User,
            dataBody:any // aqui será injetado o dado
        }
    }
}

export default async ():Promise<Express> => {

    const created = await create_master_user()
    if(!created){
        throw "Não foi possivel criar o usuáŕio master"
    }

    const app:Express = express()
    const cors_options: cors.CorsOptions = {
        origin: "*"
    };
    app.use(cors(cors_options))
    app.use('/', express.json())
    app.use('/', UserFactory)
    routes(app)
    return app

}