import { NextFunction, Response } from 'express'
import { RequestResponse } from '../types/RequestResponse';


export default (res: Response, dataResponse: RequestResponse = { code: 200 }, next?: NextFunction) => {
    try {

        if (res.headersSent) {
            console.warn("Os cabeçalhos já foram enviados. A resposta não pode ser modificada.");
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
        console.error("Erro ao enviar a resposta:", e);
    }
};