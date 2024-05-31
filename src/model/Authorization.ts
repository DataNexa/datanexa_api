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
        const status = type_user[type_user.ADMIN] == this.res.user.getJSON().type_user
        if(this.next) {
            return status ? this.next() : response(this.res, {code:401, message:this.unauthorizedMessage})
        }
        return status
    }

    onlyClientAdmin():boolean|void {
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)
        const status = type_user[type_user.ADMIN_CLIENT] == userData.type_user && client_id_sended == userData.client_id
        if(this.next) {
            return status ? this.next() : response(this.res, {code:401, message:this.unauthorizedMessage})
        }
        return status
    }

    onlyUserClient():boolean|void {
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)
        let status = false
        if(type_user[type_user.USER_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            for(const permission in userData.permissions){
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
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)

        if(type_user[type_user.ADMIN] == userData.type_user){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(type_user[type_user.ADMIN_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(!this.next) return false
        response(this.res, {code:401, message:this.unauthorizedMessage})

    }

    anyUserAuthorized():boolean|void{
        
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)

        if(type_user[type_user.ADMIN] == userData.type_user){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(type_user[type_user.ADMIN_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            if(this.next) {
                return this.next()
            }
            return true
        }

        if(type_user[type_user.USER_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            for(const permission in userData.permissions){
                if(this.permissions.includes(permission)){
                    return true
                }
            }
        }

        if(!this.next) return false
        response(this.res, {code:401, message:this.unauthorizedMessage})

    }

}


export default Authorization