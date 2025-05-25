import { NextFunction, Response } from 'express'
import { RequestResponse } from '../types/RequestResponse';
import Logger from './logger';


export default (res: Response, dataResponse: RequestResponse = { code: 200 }, next?: NextFunction) => {
    try {

        if (res.headersSent) {
            Logger.error("Cabeçalhos já enviados, não é possível enviar a resposta novamente.", "response");
            return;
        }

        if(res.token && res.token !== ""){
            dataResponse.session = res.token
        }

        res.setHeader('Content-Type', 'application/json')

        res.status(dataResponse.code).json(dataResponse); // Envia a resposta

        if (next && dataResponse.code === 200) {
            next();
        }
    } catch (e) {
        Logger.error(e, "response");
    }
};