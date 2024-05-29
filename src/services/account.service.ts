import { Request, Response, NextFunction } from 'express'
import response from '../helpers/response';
import { body, validationResult } from 'express-validator';
import { query, execute, multiTransaction } from '../helpers/query';
import JWT from '../model/JWT';
import { generateSessionTemp, generateToken } from '../model/session_manager';
import globals from '../config/globals';

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

        const account_id = (statusResp as any).insertId

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

        const resp = await query(
            `select 
                account.senha, account.id, token_account.id as token_account_id, token_account.vtoken 
                from account join token_account on token_account.account_id = account_id 
            where account.email = ?`, {
                binds:[email]
            }
        )


        const data = resp.rows as any[]

        const id = data[0]['id']
        const passHash = data[0]['senha']
        const vtoken = data[0]['vtoken']
        const token_account_id = data[0]['token_account_id']

        if(!await JWT.comparePassword(senha, passHash)){
            return response(res, {
                code:404
            })
        }

        const device        = req.headers['user-agent'] 
        const refresh_token = JWT.newToken(`${id}refresh_token`, 'sha512')
        const hash_salt     = JWT.newToken(`${id}hash_salt`)

        const respIns = await execute(
            `insert into 
                token_device_account (token_account_id, hash_salt, refresh_token, device)
                values(?,?,?,?)`,{
                    binds:[token_account_id, hash_salt, refresh_token, device]
                })
        
        if(!respIns) return response(res, {
            code:500,
            message:'ERRO AO TENTAR SALVAR O TOKEN NO BANCO DE DADOS'
        })

        const token_device_id = (respIns as any).insertId

        const token = generateToken({
            token_device_id:token_device_id,
            vtoken:vtoken
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
        
        const resp = await query(`select 
            account.id, recover.expire_in, recover.expired 
            from account left join recover on recover.account_id = account.id 
            where email = ? and 
            (recover.expired = 0 or recover.expired is null) 
            order by recover.id desc limit 1;`, {
            binds:[ email ]
        })

        if (resp.rows) {
            return response(res, {
                code:404,
                message:'Este e-mail não está cadastrado'
            })
        }

        const expir = (resp.rows as any).expire_in
        const limitToNext = (new Date(expir)).getTime() - ((20 * 60 * 1000) - 1000 * 30)
        console.log(Date.now());
        console.log(limitToNext);
        
        if(Date.now() < limitToNext){
            const faltam = Math.ceil((limitToNext - Date.now()) / 1000)
            return response(res, {
                code:401,
                message:`Aguarde ${faltam} segundos para solicitar um novo código`
            })
        }

        const account_id = (resp.rows as any).id
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

        const respQuery = await query(`
            select 
                account.nome, account.id as account_id, recover.id as recover_id, recover.expire_in 
            from recover 
            join account 
                        on recover.account_id = account.id
            where 
                recover.codigo = ? and account.email = ? and recover.expired = 0
        `, {
            binds:[ code, email ]
        })

        if(!respQuery.rows || respQuery.error){
            return response(res, {
                code:404,
                message:'Código não encontrado'
            })
        }

        const dataAcc = (respQuery.rows as any)

        const expire  = dataAcc.expire_in 
        const rec_id  = dataAcc.recover_id
        const acc_id  = dataAcc.account_id
        const nome    = dataAcc.nome

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