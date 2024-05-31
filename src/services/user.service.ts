import { Request, Response, NextFunction } from 'express'
import response from '../util/response';
import { body, validationResult } from 'express-validator';
import { generateSession, type_session } from '../model/session_manager';
import { user_repo } from '../repositories/user.repo';
import { type_user } from '../model/User';

export default {

    // gera uma sessão usando a slug do usuário e o token da conta
    openSession: async (req:Request, res:Response) => {

        body('slug').trim().matches(/^[a-zA-Z0-9_@]+$/).run(req)

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            response(res, {
                code: 400,
                message:"A slug do usuário não é válida"
            })
        }

        const { slug } = req.body

        const userReg = await user_repo.getUserByTokenDevice(res.user.getUserTokenDeviceId(), res.user.getAccountId(), slug)
        
        if(!userReg){
            return response(res, { code: 404, message:'Usuário não encontrado' })
        }

        if(!userReg.accepted){
            return response(res, { code: 401, message:`Você ainda não Aceitou Solicitação` })
        }

        if(!userReg.ativo){
            return response(res, { code: 401, message:`Você está bloqueado` })
        }
        
        const obj = {
            user_id: userReg.id,
            slug:userReg.slug,
            user_type:type_user[userReg.tipo_usuario],
            token_device_id:res.user.getUserTokenDeviceId(),
            vtoken:userReg.vtoken
        }
        
        const session = generateSession(obj, userReg.hash_salt)
        
        response(res, {
            code:200,
            body:{
                session:session
            }
        })

    },


    // pega os dados do usuário através de sua sessão
    // inclusive permissões
    getDataUser: async (req:Request, res:Response) => {

        const userData = {
            nome:res.user.getNome(),
            email:res.user.getEmail(),
            slug:res.user.getSlug()
        }

        response(res, {
            code:200,
            body: userData
        })

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