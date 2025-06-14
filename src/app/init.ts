import express, { Express, Request, Response } from "express";
import { User } from "../types/User";
import UserFactoryMid from "../middlewares/UserFactoryMid";
import routes from "../routes/routes";
import cors from 'cors';
import { filterQueryMid } from "../middlewares/FilterQueryMid";
import { FilterQuery } from "../types/FilterQuery";
import Config from "../util/config";
import cookieParser from "cookie-parser";
import Logger from "../util/logger";

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

const localhostOrigin = 'https://localhost:5173'

const corsOptions = {
 
    origin: (origin: string | undefined, callback: (err: Error | null, allow: boolean) => void) => {
        
        Logger.info(`CORS: ${origin} - ${new Date().toISOString()}`);

        if (!origin) return callback(null, true);

        const isLocalhost = !Config.instance().isInProduction()
        const isAllowedSubdomain = origin.endsWith('.datanexa.com.br');

        if (isLocalhost || isAllowedSubdomain) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'), false);
    },
 
    credentials: true,

}

export default async (version:string):Promise<Express> => {

    const app:Express = express()

    app.get('/', (_req:Request, res:Response) => res.send(`<b>DATANEXA API</b> <br> <i>version: ${version}</i>`))
    
    app.use(cors(corsOptions));
    app.use(cookieParser());
    app.use('/', express.json())
    app.use('/', UserFactoryMid)
    app.use('/', filterQueryMid)
    routes(app)
    
    return app

}