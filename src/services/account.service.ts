import { Request, Response, NextFunction } from 'express'
import response from '../util/response';
import { body, validationResult } from 'express-validator';
import JWT from '../libs/JWT';
import { generateSessionTemp, generateToken } from '../libs/session_manager';
import globals from '../config/globals';
import { account_repo, JOIN } from '../repositories/account.repo';
import { user_repo } from '../repositories/user.repo';



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

        const statusAdd = await account_repo.register(nome, email, passHash)

        if(statusAdd.error)
            return response(res, {
                code: 500,
                message: statusAdd.error_message
            })

        response(res, {
            code:200
        }, next)

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

        const resp = await account_repo.login(email, senha, req.headers['user-agent'] ? req.headers['user-agent'] : '')

        response(res, {
            code:resp.code,
            message:resp.message,
            body:{
                token:resp.token
            }
        }, next)
            
    
    },

    // gera codigo aleatorio e entrega o codigo por email
    sendMeCodeRecover: async (req:Request, res:Response, next:NextFunction) => {
        
        await body('email').isEmail().trim().run(req)
        await body('type_code').isString().trim().run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, {
                code: 400,
                message: 'Invalid Request'
            })
        }

        const { email, type_code } = req.body

        // type_code é tipo de template que será usado ao enviar o email

        if(!['confirmation', 'recover'].includes(type_code)){
            return response(res, {
                code:400,
                message:'Tipo de código não existe'
            })
        }
    
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
        const expirein = new Date(Date.now() + (1000 * 60 * 20))

        const execResp = await account_repo.registerNewRecoverCode(account_id, code, expirein)

        if(execResp.error){
            return response(res, {
                code:404,
                message:'Erro ao tentar criar o codigo'
            })
        }

        // criar função que envia codigo por email
        // o type_code indica o tipo de template que será usado
        const template_code = type_code == 'recover' ?
            `código de recuperção enviado: ${code}`:
            `código de confirmação enviado: ${code}`

        if(!globals.production){
            console.log(template_code);
        }

        response(res, {
            code:200,
            message:"codigo enviado com sucesso"
        }, next)

    },
    
    confirmEmail: async (req:Request, res:Response, next:NextFunction) => {
        
        await body('codigo').isAlphanumeric().isLength({min:6,max:6}).trim().toUpperCase().run(req)
        await body('email').isEmail().trim().run(req)

        const { codigo, email } = req.body

        const resp = await account_repo.confirmAccount(email, codigo)

        response(res, {
            code: !resp.error ? 200 : 400,
            message: resp.error_message
        })

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

        const updateRec = await account_repo.expireRecoverCode(rec_id)

        if(updateRec.error){
           return response(res, {
            code:500,
            message:'erro ao tentar alterar status recover'
           }) 
        }

        const regSess = await account_repo.registerSessionTemp(acc_id, session_temp)

        if(regSess.error){
            return response(res, {
                code:500,
                message:'erro ao registrar sessão'
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
    edit:async (req:Request, res:Response, next:NextFunction) => {

        res.dataBody = ""
        if(req.body.senha){
            res.dataBody += " :senha: "
            await body('senha').isString().isLength({min:6}).trim().run(req)
            req.body.senha = await JWT.cryptPassword(req.body.senha)
        }

        if(req.body.email){
            res.dataBody += " :email: "
            await body('email').isEmail().trim().run(req)
        }

        if(req.body.nome){
            res.dataBody += " :nome: "
            await body('nome').isString().isLength({min:3}).trim().run(req)
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, {
                code: 400,
                message: 'Requisição Inválida'
            })
        }
        
        const statusAccount = await account_repo.update(req.body, res.user.getAccountId())        

        if(statusAccount.error){
            return response(res, {
                code: 500
            }, next)
        }

        response(res, {code:200}, next)

    },

    // adiciona +1 ao vtoken
    // É necessário uma sessão temporária para expirar todas as sessões
    expireAllSessions: async (req:Request, res:Response, next:NextFunction) => {

        const sessTemp = await account_repo.updateVToken(res.user.getAccountId())
        response(res, {
            code: sessTemp.error ? 401 : 200
        })

    },

    // é necessário uma sessão temporária para deletar tokens
    deleteTokenDevice: async (req:Request, res:Response, next:NextFunction) => {
        
        await body('tokens')
            .isArray({min:1})
            .custom((array) => array.every((item: any) => typeof item === 'number'))
            .run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return response(res, {
                code: 400,
                message: 'Requisição Inválida'
            })
        }

        const {tokens} = req.body

        const deleteTokens = await account_repo.deleteTokens(res.user.getAccountId(), tokens)

        response(res, {
            code: deleteTokens.error ? 401 : 200
        })

    },

    // listar todos os aparelhos conectados à conta
    // é necessário uma sessão temporaria
    listTokenDevice: async (req:Request, res:Response) => {
        
        const responseTokens = await account_repo.getListTokens(res.user.getAccountId())
        if(!responseTokens){
            return response(res, {
                code:401
            })
        }

        response(res, {
            code:200,
            body:{
                tokens:responseTokens
            }
        })

    },

    // gera uma sessão temporária usando token, email e senha
    createTempSession: async (req:Request, res:Response) => {
        
        const session_temp = generateSessionTemp({
            nome:res.user.getNome(),
            account_id:res.user.getAccountId()
        })

        const resultSess = await account_repo.registerSessionTemp(res.user.getAccountId(), session_temp)
        
        if(resultSess.error){
            return response(res, {
                code:500,
                message:'Erro ao tentar gerar uma sessão temporária'
            })
        }
        
        response(res, {
            code:200,
            body:{
                session_temp:session_temp
            }
        })
        
    },

    // lista usuários da conta
    // necessário o token 
    listUsersAccount: async (req:Request, res:Response) => {

        const responseList = await user_repo.list(res.user.getAccountId())

        if(!responseList){
            return response(res, {
                code:500,
                message:'Ocorreu algum erro no servidor'
            })
        }
        response(res, {
            code:200,
            body:responseList
        })

    },

    getAccountData: async(req:Request, res:Response) => {
        const acc = await account_repo.getAccount({
            id: res.user.getAccountId()
        })
        if(acc.error){
            return response(res, {
                code:500,
                message:'Erro ao tentar resgatar informações da conta'
            })
        }
        response(res, {
            code:200,
            body:{
                email:acc.email,
                nome:acc.nome
            }
        })
    }

}