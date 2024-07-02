import { Request, Response, NextFunction } from 'express'
import Authorization from '../libs/Authorization'
import response from './response'
import globals from '../config/globals'


const authorization = (req:Request, res:Response, next?:NextFunction):Authorization =>{
    return new Authorization(req, res, next)
}

const authorization_route = (auth:string, permissions:string[] = []) => {
    
    if(['onlyAdmin', 'onlyClientAdmin', 'onlyUserClient', 'anyAdmins', 'anyUserAuthorized'].includes(auth))
        return (req:Request, res:Response, next:NextFunction) => {
            const auth_obj = authorization(req, res, next)
            auth_obj.setPermissions(permissions)
            switch (auth) {
                case 'onlyAdmin': auth_obj.onlyAdmin();break;
                case 'onlyClientAdmin': auth_obj.onlyClientAdmin();break;
                case 'onlyUserClient': auth_obj.onlyUserClient();break;
                case 'anyAdmins': auth_obj.anyAdmins();break;
                case 'anyUserAuthorized': 
                default: auth_obj.anyUserAuthorized()
            }
        }
    else return (req:Request, res:Response, next:NextFunction) => {
        if(!globals.production){
            console.log("ERRO DE AUTORIZAÇÂO: "+auth+" não existe. Verifique em './src/util/autorization.ts'");
        }
        response(res, {
            code:401
        })
    }

}

const onlyBot = () => {
    return (req:Request, res:Response, next:NextFunction) => {
        const auth_obj = authorization(req, res, next)
        auth_obj.onlyBotAuthorized()
    }
}

const botAndUserAuthorized = (permissions:string[] = []) => {
    return (req:Request, res:Response, next:NextFunction) => {
        const auth_obj = authorization(req, res)
        auth_obj.setPermissions(permissions)
        if(auth_obj.anyUserAuthorized() || auth_obj.onlyBotAuthorized()){
            return next()
        } 
        response(res, {
            code:401
        })
    }   
}

export { authorization, authorization_route, onlyBot, botAndUserAuthorized }