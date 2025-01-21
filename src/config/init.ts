import express, { Express, Request, Response } from "express";
import { User } from "../types/User.d";
import userFactory from "../libs/UserFactory";
import routes from "../routes/routes";
import cors from 'cors';
import create_master_user from "./auto";

declare global{
    namespace Express {
        interface Response {
            user: User
        }
    }
}

export default async (version:string):Promise<Express> => {

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
    app.use('/', userFactory)
    app.get('/', (req:Request, res:Response) => res.send(`<b>DATANEXA API</b> <br> <i>version: ${version}</i>`))
    routes(app)
    return app

}