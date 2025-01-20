import { NextFunction, Request, Response} from 'express'
import { type_user } from './User'
import response from '../util/response'

class Authorization {

    private req:Request
    private res:Response
    private next:NextFunction|undefined
    private permissions:string[] = []

    private unauthorizedMessage:string = 'Authorization: deny'

    constructor(req:Request, res:Response, next?:NextFunction) {
        this.req = req 
        this.res = res 
        this.next = next
    }

    setPermissions(permissions:string[]){
        this.permissions = permissions
        return this
    }

    onlyAdmin():boolean|void {
        const status = type_user.ADMIN == this.res.user.getTypeUser()
        if(this.next) {
            return status ? this.next() : response(this.res, {code:401, message:this.unauthorizedMessage})
        }
        return status
    }

    onlyClientAdmin():boolean|void {
        const client_id_sended = parseInt(this.req.params.client_id)
        const status = type_user.ADMIN_CLIENT == this.res.user.getTypeUser() && client_id_sended == this.res.user.getClientId()
        if(this.next) {
            return status ? this.next() : response(this.res, {code:401, message:this.unauthorizedMessage})
        }
        return status
    }

    onlyUserClient():boolean|void {

        const client_id_sended = parseInt(this.req.params.client_id)
        let status = false
        const typeu = this.res.user.getTypeUser()
        
        if(typeu && type_user.USER_CLIENT == typeu 
            && client_id_sended == this.res.user.getClientId()
        ){
            for(const permission of this.res.user.getPermissions()){
                if(this.permissions.includes(permission)){
                    status = true 
                    break
                }
            }
        }
        if(this.next) {
            return status ? this.next() : response(this.res, {code:401, message:this.unauthorizedMessage})
        }
        return status
    }

    anyAdmins():boolean|void {

        const client_id_sended = parseInt(this.req.params.client_id)
        const typeu = this.res.user.getTypeUser()

        if(typeu && type_user.ADMIN == typeu){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(typeu && type_user.ADMIN_CLIENT == typeu && client_id_sended == this.res.user.getClientId()){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(!this.next) return false
        response(this.res, {code:401, message:this.unauthorizedMessage})

    }

    onlyBotAuthorized():boolean|void {

        if(!this.res.user) return false

        const typeu = this.res.user.getTypeUser()
        
        if(typeu && type_user.BOT == typeu){
            return true
        }
        
        return false
    }

    anyUser():boolean|void {

        if(!this.res.user || this.res.user.getTypeUser() == type_user.ANONIMUS) 
            return this.next ? response(this.res, {code:401, message:this.unauthorizedMessage}) : false
    
        return this.next ? this.next() : true
        
    }

    anyUserAuthorized():boolean|void{

        if(!this.res.user) return response(this.res, {code:401, message:this.unauthorizedMessage})
        
        const client_id_sended = parseInt(this.req.body.client_id)
        const typeu = this.res.user.getTypeUser()

        if(typeu && type_user.ADMIN == typeu){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(typeu && type_user.ADMIN_CLIENT == typeu && client_id_sended == this.res.user.getClientId()){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(typeu && type_user.USER_CLIENT == typeu && client_id_sended == this.res.user.getClientId()){
            for(const permission of this.res.user.getPermissions()){
                if(this.permissions.includes(permission)){
                    if(this.next) {
                        return this.next()
                    }
                    return true
                }
            }
        }

        if(!this.next) return false
        response(this.res, {code:401, message:this.unauthorizedMessage})

    }

}


export default Authorization