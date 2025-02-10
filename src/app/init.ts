import express, { Express, Request, Response } from "express";
import { User } from "../types/User";
import UserFactoryMid from "../middlewares/UserFactoryMid";
import routes from "../routes/routes";
import cors from 'cors';
import { filterQueryMid } from "../middlewares/FilterQueryMid";
import { FilterQuery } from "../types/FilterQuery";

declare global{
    namespace Express {
        interface Response {
            user: User,
            token?:string
        }
    }
}

declare global{
    namespace Express {
        interface Request {
            parsedQuery:FilterQuery
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
    app.use('/', UserFactoryMid)
    app.use('/', filterQueryMid)
    routes(app)
    
    return app

}