import { Request, Response, NextFunction } from 'express'
import response from '../util/response';
import { body, validationResult } from 'express-validator';
import { generateSession } from '../libs/session_manager';
import { user_repo } from '../repositories/user.repo';
import cache from '../libs/cache';
import { type_user } from '../libs/User';
import clientRepo from '../repositories/client.repo';

export default {

    // gera uma sessão usando a slug do usuário e o token da conta
    openSession: async (req:Request, res:Response) => {

        await body('slug').trim().matches(/^[a-zA-Z0-9\._@#]+$/).run(req)

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return response(res, {
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
            user_id: userReg.user_id,
            slug:userReg.slug,
            user_type:userReg.tipo_usuario,
            token_device_id:res.user.getUserTokenDeviceId(),
            vtoken:userReg.vtoken
        }

        const userFull = {
            user_id:userReg.user_id,
            slug:userReg.slug,
            user_type:userReg.tipo_usuario,
            token_device_id:res.user.getUserTokenDeviceId(),
            vtoken:userReg.vtoken,
            nome:userReg.nome,
            email:userReg.email,
            hash_salt:userReg.hash_salt,
            permissions:userReg.permissions,
            client_id:userReg.client_id
        }
        
        const session = generateSession(obj, userReg.hash_salt)
        
        await cache.saveDataUser(userFull)

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
            slug:res.user.getSlug(),
            user_type:res.user.getTypeUser(),
            permissions:res.user.getPermissions()
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
    create: async (req:Request, res:Response) => {

        // se for um type_user.USER_CLIENT é necessário o id do usuário enviado por ele
        // lembrando: a segurança de permissão pelo id do usuário já foi feita

        const user = res.user
        
        await body('tipo_usuario').isInt({min:1, max:4}).run(req)

        if(user.getTypeUser() == type_user.USER_CLIENT || 
            user.getTypeUser() == type_user.ADMIN_CLIENT || 
            req.body.tipo_usuario == type_user.USER_CLIENT ||
            req.body.tipo_usuario == type_user.ADMIN_CLIENT )
            await body('client_id').isInt().run(req)
        
        await body('service_actions').isArray({min:0}).run(req)
        await body('service_actions.*').isInt().run(req)
        await body('email').isEmail().run(req)
        
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return response(res, {
                code: 400,
                message:"Erro ao enviar dados"
            })
        }

        const b:{client_id?:number, service_actions:number[], email:string, tipo_usuario:number} = req.body 

        if( 
            // se o usuário for do tipo ADMIN_CLIENT ele não poderá criar ADMIN ou GHOST user
            ( user.getTypeUser() == type_user.ADMIN_CLIENT  && (b.tipo_usuario == 1 || b.tipo_usuario == 2))  ||
            // se o usuário for do tipo USER_CLIENT (com permissão de usuários) ele só poderá criar outros USER_CLIENT
            (user.getTypeUser() == type_user.USER_CLIENT && b.tipo_usuario != type_user.USER_CLIENT)
        ) return response(res, {
            code:401,
            message:'Você não tem permissão para criar este tipo de usuário'
        })


        let slug  = b.email.split('@')[0]+"@"
        let assig =  b.tipo_usuario == type_user.ADMIN ? 'admin' : 'ghost'
        if(b.client_id) {
            let cli_slug = (await clientRepo.getSlugById(b.client_id))
            if(cli_slug) assig = cli_slug.slug
        }
        slug += assig
        slug += b.client_id ? "#"+Date.now() : ""

        const saveUser = await user_repo.register(slug, b.service_actions, b.email, b.tipo_usuario, b.client_id)

        if(saveUser){
            return response(res, {
                code:200,
                message:'Usuário registrado com sucesso. Porém, o usuário precisa aceitar a solicitação'
            })
        }

        response(res, {
            code:401,
            message:"Ocorreu um erro ao tentar salvar novo usuário no banco de dados."
        })

    },

    // cria/edita as permissões e o tipo de usuário 
    // apenas usuários com permissão
    updatePermissionsUser: async (req:Request, res:Response) => {

        // algoritmo vai deletar todas as permissões do usuário e adicionar novamente
        // se o service_actions vier vazio, apenas deletar as permissões

        await body('service_actions').isArray({min:0}).run(req)
        await body('service_actions.*').isInt().run(req)
        await body('user_id').isInt({min:1}).run(req)
        // usuarios de nivel client compermissões só podem alterar usuários do client 
        const user = res.user
        if(user.getTypeUser() == type_user.USER_CLIENT || 
            user.getTypeUser() == type_user.ADMIN_CLIENT )
            await body('client_id').notEmpty().isInt().run(req)

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return response(res, {
                code: 400,
                message:"Erro no envio de dados"
            })
        }

        const { service_actions, user_id } = req.body

        if(!await user_repo.update(service_actions, user_id)) 
            return response(res, {
                code:500,
                message:'Erro ao tentar alterar as permissões do usuário'
            })

        // deletar registro no cache
        await cache.deleteDataUser(user_id)
        response(res)
    },

    // bloquear usuário
    // apenas usuários com permissão
    block: async (req:Request, res:Response) => {
      
        await body('user_id').isInt({min:1}).run(req)
        const user = res.user

        if(user.getTypeUser() == type_user.USER_CLIENT || 
            user.getTypeUser() == type_user.ADMIN_CLIENT )
            await body('client_id').isInt({min:1}).run(req)

        const errors = validationResult(req)
        
        if(!errors.isEmpty()){
            return response(res, {
                code: 400,
                message:"Erro no envio de dados"
            })
        }

        const { user_id, client_id }:{user_id:number, client_id?:number } = req.body

        if(!await user_repo.blockUser(true, user_id, client_id)){
            return response(res, {
                code: 500,
                message:'Erro ao tentar bloquear usuário'
            })
        }

        await cache.deleteDataUser(user_id)

        response(res)
    },

    // reativar usuário
    // apenas usuários com permissão
    reactivate: async (req:Request, res:Response) => {

        await body('user_id').isInt({min:1}).run(req)
        const user = res.user

        if(user.getTypeUser() == type_user.USER_CLIENT || 
            user.getTypeUser() == type_user.ADMIN_CLIENT )
            await body('client_id').notEmpty().isInt().run(req)

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return response(res, {
                code: 400,
                message:"Erro no envio de dados"
            })
        }

        const { user_id, client_id }:{user_id:number, client_id?:number } = req.body

        if(!await user_repo.blockUser(false, user_id, client_id)){
            return response(res, {
                code: 500,
                message:'Erro ao tentar desbloquear usuário'
            })
        }

        await cache.deleteDataUser(user_id)

        response(res)

    },

    acceptOrDeclineUser: async (req:Request, res:Response) => {

        await body('slug').trim().matches(/^[a-zA-Z0-9\._@#]+$/).run(req)
        await body('accepted').isInt({min:1, max:2}).run(req)

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return response(res, {
                code: 400,
                message:"Erro no envio de dados"
            })
        }

        const { slug, accepted } = req.body

        const resp = await user_repo.acceptOrDecline(slug, accepted)

        if(resp.error){
            return response(res, {
                code: 500,
                message: 'Erro no servidor'
            })
        }

        response(res)

    } 

}