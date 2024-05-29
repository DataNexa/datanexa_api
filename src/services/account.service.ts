import { Request, Response, NextFunction } from 'express'
import response from '../helpers/response';
import { body, validationResult } from 'express-validator';
import { query, execute, multiTransaction } from '../helpers/query';
import JWT from '../model/JWT';
import { generateSessionTemp, generateToken } from '../model/session_manager';
import globals from '../config/globals';
import { account_repo, JOIN } from '../repositories/account.repo';

export default {

    createAccount: async (req:Request, res:Response, next:NextFunction) => {
        
        await body('nome').isString().isLength({min:3}).trim().run(req)
        await body('email').isEmail().trim().run(req)
        await body('senha').isString().isLength({min:6}).trim().run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, {
                code: 400,
                message: 'Invalid Request'
            })
        }

        const { nome, email, senha } = req.body

        const passHash = await JWT.cryptPassword(senha)

        const conn = await multiTransaction()
        
        const statusResp = await conn.execute('insert into account(nome, email, senha) values (?,?,?)', {
            binds:[ nome, email, passHash ]
        })

        if(statusResp.error){
            if(statusResp.error_code == 1062)
                return response(res, {
                    code: 500,
                    message: 'Este e-mail já está em uso'
                })
            else
                return response(res, {
                    code: 500,
                    message: 'Erro ao tentar salvar e-mail. Tente novamente, por favor.'
                })
        }

        const account_id = (statusResp.rows as any[])[0].insertId

        const statusCreate = await conn.execute('insert into token_account(account_id, vtoken) values (?,?)', {
            binds:[account_id, 1]
        })

        if(statusCreate.error){
            return response(res, {
                code: 500,
                message: 'Erro ao tentar salvar e-mail. Tente novamente, por favor.'
            })
        }

        conn.finish()

        response(res)

    },

    // login gera um token
    login: async (req:Request, res:Response, next:NextFunction) => {
        
        await body('email').isEmail().trim().run(req)
        await body('senha').isString().isLength({min:6}).trim().run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, {
                code: 400,
                message: 'Invalid Request'
            })
        }

        const { email, senha } = req.body

        const acc = await account_repo.getAccount({
            email: email
        }, {
            join:[JOIN.TOKEN_ACCOUNT]
        })

        if(!await JWT.comparePassword(senha, acc.senha)){
            return response(res, {
                code:404
            })
        }

        if(!acc.token_account){
            return response(res, {
                code: 500,
                message: 'ERRO NO REGISTRO'
            })
        }

        const device        = req.headers['user-agent'] ? req.headers['user-agent'] : ''
        const refresh_token = JWT.newToken(`${acc.id}refresh_token`, 'sha512')
        const hash_salt     = JWT.newToken(`${acc.id}hash_salt`)

        const response_register = await account_repo.registerToken(
            acc.token_account.token_account_id,
            hash_salt,
            refresh_token,
            device
        )

        if(response_register.error)
            return response(res, {
                code:500,
                message:'ERRO AO TENTAR SALVAR O TOKEN NO BANCO DE DADOS'
            })

        const token = generateToken({
            token_device_id:acc.token_account.token_account_id,
            vtoken:acc.token_account.vtoken
        })
        
        response(res, {
            code:200,
            body:{
                token:token
            }
        }, next)
    
    },

    // gera codigo aleatorio e entrega o codigo por email
    sendMeCodeRecover: async (req:Request, res:Response, next:NextFunction) => {
        
        await body('email').isEmail().trim().run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, {
                code: 400,
                message: 'Invalid Request'
            })
        }

        const { email } = req.body
    
        const acc = await account_repo.getAccount({
            email: email
        }, {
            join:[JOIN.RECOVER],
            order:" order by recover.id desc limit 1"
        })

        if (acc.error) {
            return response(res, {
                code:404,
                message:'Este e-mail não está cadastrado'
            })
        }

        if(acc.recover && !acc.recover.expired){
            
            const limitToNext = (new Date(acc.recover.expire_in)).getTime() - ((20 * 60 * 1000) - 1000 * 30)
        
            if(Date.now() < limitToNext){
                const faltam = Math.ceil((limitToNext - Date.now()) / 1000)
                return response(res, {
                    code:401,
                    message:`Aguarde ${faltam} segundos para solicitar um novo código`
                })
            }
        }
        

        const account_id = acc.id
        const code = JWT.generateRandomCode().toUpperCase()

        const execResp = await execute(`
            insert into recover (account_id, codigo, expire_in, expired)
            values(?,?,?,?) 
        `, {
            binds:[account_id, code, new Date(Date.now() + (1000 * 60 * 20)), 0]
        })

        if(execResp.error){
            return response(res, {
                code:404,
                message:'Erro ao tentar criar o codigo'
            })
        }

        // criar função que envia codigo por email
        if(!globals.production){
            console.log("codigo enviado: "+code);
        }

        response(res, {
            code:200,
            message:"codigo enviado com sucesso"
        }, next)

    },
    
    // consome codigo aleatorio gerando uma sessao temporaria
    // quando a recuperação for concluída todas as sessões e tokens serão expirados
    recover: async (req:Request, res:Response, next:NextFunction) => {

        await body('codigo').isAlphanumeric().isLength({min:6,max:6}).trim().toUpperCase().run(req)
        await body('email').isEmail().trim().run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, {
                code: 400,
                message: 'Código Invalido'
            })
        }

        const code  = (req.body as any).codigo
        const email = (req.body as any).email

        const acc   = await account_repo.getAccount({
            email:email
        }, {
            join:[JOIN.RECOVER],
            where:" and recover.codigo = ? and recover.expired = 0 ",
            values:[code]
        }) 

        if(acc.error || !acc.recover){
            return response(res, {
                code:404,
                message:'Código não encontrado'
            })
        }

        const expire  = acc.recover.expire_in 
        const rec_id  = acc.recover.recover_id
        const acc_id  = acc.id
        const nome    = acc.nome

        if(Date.now() > (new Date(expire)).getTime()){
            return response(res,{
                code:401,
                message:'Código expirado'
            })
        }

        const session_temp = generateSessionTemp({
            nome:nome,
            account_id:acc_id
        })

        const updateRec = await execute('update recover set expired = 1 where id = ?',{
            binds:[rec_id]
        })

        if(updateRec.error){
           return response(res, {
            code:500,
            message:'erro no servidor'
           }) 
        }

        response(res, {
            code:200,
            body:{
                session_temp:session_temp
            }
        })

    },

    // É necessário uma sessão temporária para editar dados sensiveis
    edit:(req:Request, res:Response, next:NextFunction) => {

        

    },

    // adiciona +1 ao vtoken
    // É necessário uma sessão temporária para expirar todas as sessões
    expireAllSessions: (req:Request, res:Response, next:NextFunction) => {

    },

    // é necessário uma sessão temporária para deletar tokens
    deleteTokenDevice: (req:Request, res:Response, next:NextFunction) => {

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