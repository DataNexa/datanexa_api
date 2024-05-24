import { User } from "./User";
import { Request, Response, NextFunction } from "express"

import { type_session, generateSession, verifySession, generateToken } from "./session_manager";


class UserFactory {

    private user:User = new User()

    constructor(session?:string){
        
        if(session){
            
            const dataUser = verifySession(session)
            
            if (dataUser != false) {

                if(dataUser.header.type == type_session.SESSION && dataUser.user){

                    // resgatar usuário completo conforme as informação da sessao
                        // comparar se o vtoken da sessao é o mesmo que o vtoken 
                    // verificar se o nonce e o hash estao corretos no session control
                    // e pegar o client_slug e as permissões do usuario no banco de dados
                    // lembrando que apenas o USER_CLIENT precisa de pemissões
                    
                    // se o nonce e o hash estao corretos e nao for um session_temp...
                    // verificar se sessao precisa ser renovada
                    
                    let hasNewSession = dataUser.header.expire_in - Date.now() <  1000 * 60 * 5

                    if(hasNewSession){
                        // gera nova sessao
                        session = generateSession(dataUser.user)
                    }
                    
                    this.user.setId(dataUser.user.user_id)
                    this.user.setSession(session, hasNewSession)
                    this.user.setTypeUser(dataUser.user.user_type)
                    this.user.setSlug(dataUser.user.slug)

                    this.user.setClientSlug("qs_midia")
                    this.user.setPermissions(["salvar"])

                    return
                }

                if(dataUser.header.type == type_session.SESSION_TEMP){
                    this.user.setSessionTemp(session)
                    return 
                }

                if(dataUser.account){
                    const token_account = 
                        dataUser.header.expire_in - Date.now() <  1000 * 60 * 60 * 24 * 330 ? 
                        generateToken(dataUser.account) :
                        session  
                    
                    // salva o token no banco de dados
                    // gera uma sessao e redireciona para a home

                    this.user.setTokenAccount(token_account)
                }

            }

        }

    }

    public getUser():User{
        return this.user
    }

}

export default (req:Request, res:Response, next:NextFunction) => {
    const sess = typeof req.headers.session == 'string' ? req.headers.session : undefined
    const userFactory:UserFactory = new UserFactory(sess)
    res.user = userFactory.getUser()
    next()
}

