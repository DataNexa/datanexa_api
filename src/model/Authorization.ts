import { Request, Response} from 'express'
import { type_user } from './User'

class Authorization {

    private req:Request
    private res:Response
    private permissions:string[] = []

    constructor(req:Request, res:Response) {
        this.req = req 
        this.res = res 
    }

    setPermissions(permissions:string[]){
        this.permissions = permissions
        return this
    }

    onlyAdmin():boolean {
        return type_user[type_user.ADMIN] == this.res.user.getJSON().type_user
    }

    onlyClientAdmin():boolean {
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)
        return type_user[type_user.ADMIN_CLIENT] == userData.type_user && client_id_sended == userData.client_id
    }

    onlyUserClient():boolean {
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)
        if(type_user[type_user.USER_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            for(const permission in userData.permissions){
                if(this.permissions.includes(permission)){
                    return true
                }
            }
        }
        return false
    }

    anyAdmins():boolean {
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)

        if(type_user[type_user.ADMIN] == userData.type_user){
            return true
        }

        if(type_user[type_user.ADMIN_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            return true
        }

        return false
    }

    anyUserAuthorized():boolean{
        
        const userData = this.res.user.getJSON()
        const client_id_sended = parseInt(this.req.params.client_id)

        if(type_user[type_user.ADMIN] == userData.type_user){
            return true
        }

        if(type_user[type_user.ADMIN_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            return true
        }

        if(type_user[type_user.USER_CLIENT] == userData.type_user && client_id_sended == userData.client_id){
            for(const permission in userData.permissions){
                if(this.permissions.includes(permission)){
                    return true
                }
            }
        }

        return false
    }

}


export default Authorization