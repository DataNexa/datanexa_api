import { Request, Response, NextFunction } from 'express'
import response from '../helpers/response';

export default {

    // login gera um token
    login: (req:Request, res:Response) => {
        res.send({})
    },

    // gera codigo aleatorio e entrega o codigo por email
    // ou consome codigo aleatorio gerando uma sessao temporaria
    // quando a recuperação for concluída todas as sessões e tokens serão expirados
    recover: (req:Request, res:Response) => {

    },

    // É necessário uma sessão temporária para editar dados sensiveis
    edit:(req:Request, res:Response) => {

    },

    // adiciona +1 ao vtoken
    // É necessário uma sessão temporária para expirar todas as sessões
    expireAllSessions: (req:Request, res:Response) => {

    },

    // é necessário uma sessão temporária para deletar tokens
    deletarTokenDevice: (req:Request, res:Response) => {

    },

    // listar todos os aparelhos conectados à conta
    // é necessário uma sessão temporaria
    listTokenDevice: (req:Request, res:Response) => {

    },

    // gera uma sessão temporária usando token e senha
    createTempSession:(req:Request, res:Response) => {

    },

    // lista usuários da conta
    // necessário o token 
    listUsersAccount:(req:Request, res:Response) => {

    }

}