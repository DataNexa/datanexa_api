import { User } from "./User";
import { Request, Response, NextFunction } from "express"

import { type_session, data_account_i, data_token_i, data_user_i, header_i, generateSession, verifySession, generateToken } from "./session_manager";
import response from "../util/response";
import { account_repo, JOIN } from "../repositories/account.repo";

const generateUser = async (dataUser:data_user_i, header:header_i, user:User):Promise<boolean> => {

    const token_device_id = dataUser.token_device_id
    // user token_device_id para resgatar o vtoken e o hash_salt
    const vtoken_db = 1 // resgatado no banco de dados
    const hash_salt = "saltdfkj"

    if(vtoken_db != dataUser.vtoken){
        return false
    }

    let hasNewSession = header.type == type_session.SESSION && header.expire_in - Date.now() <  1000 * 60 * 30
    if(hasNewSession){
        user.setSession(generateSession(dataUser, hash_salt, vtoken_db), true)
    }
    
    user.setTypeUser(dataUser.user_type)
    user.setId(dataUser.user_id)
    user.setSlug(dataUser.slug)
    user.setTokenDeviceId(dataUser.token_device_id)

    // iserir outros dados do usuario como permissões, etc

    return true

}

const generateUserAccount = async (dataAccount:data_account_i, header:header_i, user:User): Promise<boolean> => {

    const account_id  = dataAccount.account_id
    const session_tmp = user.getSessionTemp()

    const respAccount = await account_repo.getAccount({
        id:account_id
    }, {
        join: [JOIN.SESSION_TEMP],
        where: " and session_temp.session_value = ? and session_temp.expire_in > ? and used = 0",
        values: [session_tmp, new Date()]
    })

    if(respAccount.error){
        return false
    }
 
    user.setAccountId(respAccount.id)
    user.setNome(respAccount.nome)
    user.setEmail(respAccount.email)
    user.setEncPass(respAccount.senha)

    if(respAccount.session_temp)
    await account_repo.expireSessionTemp(account_id, respAccount.session_temp.session_temp_id)

    return true

}

const generateUserToken = async (dataToken:data_token_i, user:User):Promise<boolean> => {
    
    const token_device_id = dataToken.token_device_id
    const account_id = dataToken.account_id
    
    const userTokenReq = await account_repo.getAccount({
        id:account_id
    }, {
        join:[JOIN.TOKEN_ACCOUNT_AND_DEVICE],
        where:" and token_device_account.id = ?",
        values:[token_device_id]
    })

    const vtoken_db = userTokenReq.token_account?.vtoken // resgatado no banco de dados

    if(vtoken_db != dataToken.vtoken){
        return false    
    }
    
    user.setAccountId(account_id)
    user.setTokenDeviceId(token_device_id)
    user.setVToken(dataToken.vtoken)

    return true

}

export default async (req:Request, res:Response, next:NextFunction) => {
    
    const sess = typeof req.headers.session == 'string' ? req.headers.session : false
    const user = new User()
    res.user = user

    if(sess){
        
        const dataUser = verifySession(sess)
       
        if(dataUser && dataUser.user && dataUser.header.type == type_session.SESSION){
            
            user.setSession(sess)

            let status = await generateUser(dataUser.user, dataUser.header, user)
            if(!status){
                return response(res,{
                    code: 401
                }, next)
            }

        } else
        if(dataUser && dataUser.account && dataUser.header.type == type_session.SESSION_TEMP){
            
            user.setSessionTemp(sess)
            let status = await generateUserAccount(dataUser.account, dataUser.header, user)
            
            if(!status){
                return response(res,{
                    code: 401
                }, next)
            }

        } else
        if(dataUser && dataUser.token && dataUser.header.type == type_session.TOKEN){
            
            user.setTokenAccount(sess)
            let status = await generateUserToken(dataUser.token, user)
            
            if(!status){
                return response(res,{
                    code: 401
                }, next)
            }
            
        } 

    }

    next()
    
}

