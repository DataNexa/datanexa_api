import { Request, Response, NextFunction } from 'express'
import response from '../util/response';

export default {

    // gera uma sessão usando a slug do usuário e o token da conta
    openSession: (req:Request, res:Response) => {

    },

    // cria um usuário usando um e-mail
    // é necessário uma conta cadastrada
    // dono da conta precisa aceitar participação
    // apenas usuários com permissão
    createUser: (req:Request, res:Response) => {

    },

    // cria/edita as permissões e o tipo de usuário 
    // apenas usuários com permissão
    addPermissionsUser: (req:Request, res:Response) => {

    },

    // bloquear usuário
    // apenas usuários com permissão
    blockUser:(req:Request, res:Response) => {
        
    },

    // reativar usuário
    // apenas usuários com permissão
    reactivate:(req:Request, res:Response) => {


    }

}