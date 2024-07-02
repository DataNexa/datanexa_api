import { User } from "./User";
import { Request, Response, NextFunction } from "express"

import { type_session, data_bot_i, data_account_i, data_token_i, data_user_i, header_i, generateSession, verifySession, getDataSession, generateToken, data_user_full_i, generateBotToken } from "./session_manager";
import response from "../util/response";
import { account_repo, JOIN } from "../repositories/account.repo";
import { user_repo, user_token_account } from "../repositories/user.repo";
import cache from "./cache";

const addDataUser = async (dataUser:data_user_full_i, user:User, save:boolean = false) => {

    user.setNome(dataUser.nome)
    user.setEmail(dataUser.email)
    user.setTypeUser(dataUser.user_type)
    user.setId(dataUser.user_id)
    user.setSlug(dataUser.slug)
    user.setTokenDeviceId(dataUser.token_device_id)
    user.setPermissions(dataUser.permissions)

    if(dataUser.client_id) user.setClientId(dataUser.client_id)

    if(save) return await cache.saveDataUser(dataUser)
    return true

}

const generateBotData = (user:User, dataBot:data_bot_i) => {
    user.setSlug(dataBot.slug)
    user.setLocale(dataBot.locale)

    // TODO: checagem para ver se o BOT está cadastrado no banco de dados

    return true
}

const generateUser = async (session:string, dataUser:data_user_i, header:header_i, user:User):Promise<boolean> => {

    let userDB:user_token_account|data_user_full_i|false|undefined = await cache.getDataUser(dataUser.user_id)
    let save = false
    if(!userDB) {
        save = true
        userDB = await user_repo.getDataFromSession(dataUser.user_id)
    } 

    if(!userDB) return false

    if(userDB.vtoken != dataUser.vtoken){
        return false
    }

    if(!verifySession(session, userDB.hash_salt, userDB.vtoken)){
        return false
    }

    let hasNewSession = header.type == type_session.SESSION && header.expire_in - Date.now() <  1000 * 60 * 30
    if(hasNewSession){
        user.setSession(generateSession(dataUser, userDB.hash_salt), true)
    }
    
    return await addDataUser(userDB as data_user_full_i, user, save)

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

    const vtoken_db = userTokenReq.token_account?.vtoken 

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
    
    if(sess){
        
        const dataSess = getDataSession(sess)
        const user = new User()
        res.user = user

        if(dataSess.header.type == type_session.SESSION){

            user.setSession(sess)

            let status = await generateUser(sess, (dataSess.user as data_user_i), dataSess.header, user)
            if(!status){
                return response(res,{
                    code: 401
                }, next)
            }
            if(user.getClientId()){
                req.body.client_id = user.getClientId()
            }
            return next()
        }

        const dataUser = verifySession(sess)
        
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
            
        } else
        if(dataUser && dataUser.token && dataUser.header.type == type_session.BOT){
            
            user.setTokenAccount(sess)
            let status = generateBotData(user, (dataSess.user as data_bot_i))
            
            if(!status){
                return response(res,{
                    code: 401
                }, next)
            }
            
        } 

    }

    next()
    
}

