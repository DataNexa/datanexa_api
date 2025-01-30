import express, { Express, Request, Response } from "express";
import { User } from "../types/User";
import authMid from "../middlewares/AuthMid";
import routes from "../routes/routes";
import cors from 'cors';
import { filterQueryMid } from "../middlewares/FilterQueryMid";

declare global{
    namespace Express {
        interface Response {
            user: User,
            token?:string
        }
    }
}

export default async (version:string):Promise<Express> => {

    const app:Express = express()

    app.get('/', (_req:Request, res:Response) => res.send(`<b>DATANEXA API</b> <br> <i>version: ${version}</i>`))
    
    const cors_options: cors.CorsOptions = {
        origin: "*"
    };
    app.use(cors(cors_options))
    app.use('/', express.json())
    app.use('/', authMid)
    app.use('/', filterQueryMid)
    routes(app)
    
    return app

}