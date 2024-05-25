import { User } from "./User";
import { Request, Response, NextFunction } from "express"

import { type_session, data_token_i, data_user_i, header_i, generateSession, verifySession, generateToken } from "./session_manager";
import response from "../helpers/response";

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

const generateUserAccount = async (dataToken:data_token_i, user:User):Promise<boolean> => {
    const token_device_id = dataToken.token_device_id
    // user token_device_id para resgatar o vtoken e o hash_salt
    const vtoken_db = 1 // resgatado no banco de dados
    user.setTokenDeviceId(token_device_id)
    if(vtoken_db != dataToken.vtoken){
        return false
    }
    
    // isere os dados necessários do banco de dados
    user.setVToken(dataToken.vtoken)

    return true

}

export default async (req:Request, res:Response, next:NextFunction) => {
    
    const sess = typeof req.headers.session == 'string' ? req.headers.session : false
    const user = new User()
   
    if(sess){
        
        const dataUser = verifySession(sess)
       
        if(dataUser && dataUser.user){
           
            if(dataUser.header.type == type_session.SESSION_TEMP){
                user.setSessionTemp(sess)
            }

            if(dataUser.header.type == type_session.SESSION){
                user.setSession(sess)
            }

            let status = await generateUser(dataUser.user, dataUser.header, user)
            if(!status){
                return response(res,{
                    code: 401
                }, next)
            }

        } else
        if(dataUser && dataUser.account){
            user.setTokenAccount(sess)
            let status = await generateUserAccount(dataUser.account, user)
            if(!status){
                return response(res,{
                    code: 401
                }, next)
            }
            
        } 

    }

    next()
    
}

