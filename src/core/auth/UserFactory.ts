
import express, {  Request, Response, NextFunction } from "express";
import { User, user_type, UserDetail } from "../../types/User";
import JWT from "./JWT";
import globals from "../../config/globals";
import { token } from "../../types/Token";
import userCache from "../cache/userCache";
import userDB from "../database/userDB";

const AnonUser:User = {
    type:user_type.ANONIMO,
    vtoken:0,
    id:0
}


const factoryMiddleware = async (req:Request, res:Response, next:NextFunction) => {
    // todo
}


const generateUserToken = async (user:User) => {
    return JWT.generate(
        {
            alg:'sha256', 
            type:1, 
            expire_in: (new Date()).getTime() + (3600000 * 10) // 10 horas de expiração
        },
        {
            id:user.id,
            vtoken:user.vtoken,
            type:user.type
        },
    )
}


const factory = async (token_str?:string):Promise<User> => {

    if(!token_str) return AnonUser
    
    let token = JWT.verify(token_str)
    if(!token) return AnonUser
    
    let tokenChecked = await checkToken(token)
    if(!tokenChecked) return AnonUser

    return tokenChecked.data
}


const checkToken = async (token:token):Promise<token|false> => {

    let exp = token.header.expire_in - (new Date()).getTime()
    let ntoken:token | null = null 

    if(exp <= 0) return false
 
    const userC = await userCache.getDataUser(token.data.id)

    if(userC && userC.vtoken != token.data.vtoken){
        return false
    } else {
        if((await userDB.getUser(token.data.id)).vtoken != token.data.vtoken){
            return false
        }
    }

    if(exp < (3600000 * 1)){
        // falta 1 hora para expirar, gerar outro token
        let tempt = JWT.verify(await generateUserToken(token.data))
        ntoken = tempt ? tempt : token
    }

    return ntoken ? ntoken : token

}


export default { factoryMiddleware, factory, AnonUser }