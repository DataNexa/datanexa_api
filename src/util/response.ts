import { NextFunction, Response } from 'express'

interface response_i {
    body?:any,
    session?:string,
    redirect?:string,
    message?:string,
    code:number
}

export default (res: Response, dataResponse: response_i = { code: 200 }, next?: NextFunction) => {
    try {

        if (res.headersSent) {
            console.warn("Os cabeçalhos já foram enviados. A resposta não pode ser modificada.");
            return;
        }

        res.setHeader('Content-Type', 'application/json');

        const user = res.user;

        if (user && user.isNewSession()) {
            dataResponse.session = user.getSession();
        }

        res.status(dataResponse.code).json(dataResponse); // Envia a resposta

        if (next && dataResponse.code === 200) {
            next();
        }
    } catch (e) {
        console.error("Erro ao enviar a resposta:", e);
    }
};