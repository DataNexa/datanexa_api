enum type_user {
    GHOST, ADMIN, ADMIN_CLIENT, USER_CLIENT, ANONIMUS
}

interface user_i {
    user_id:number,
    type_user:string,
    temp:string|undefined,
    session:string|undefined,
    slug:string|undefined,
    permissions:string[],
    client_slug:string|undefined,
    token_account:string|undefined
}

class User {

    private user_id:number = 0
    private type_user:type_user = type_user.ANONIMUS
    private session_temp:string|undefined
    private session:string|undefined
    private slug:string|undefined
    private permissions:string[] = []
    private client_slug:string|undefined
    private token_account:string|undefined
    private newSession:boolean = false

    public setTypeUser(type:string){
        if(["GHOST", "ADMIN", "ADMIN_CLIENT", "USER_CLIENT", "ANONIMUS"].includes(type))
        this.type_user = type_user[type as keyof typeof type_user]
    }

    public setSession(session:string, isNew:boolean = false){
        this.newSession = isNew
        this.session = session
    }

    public isNewSession() {
        return this.newSession
    }

    public setId(id:number){
        this.user_id = id
    }

    public setSlug(slug:string){
        this.slug = slug
    }

    public setPermissions(permissions:string[]){
        this.permissions = permissions
    }

    public setClientSlug(client_slug:string){
        this.client_slug = client_slug
    }

    public setSessionTemp(session_temp:string){
        this.session_temp = session_temp
    }

    public setTokenAccount(token_account:string){
        this.token_account = token_account
    }

    public getJSON():user_i {
        return {
            user_id:this.user_id,
            type_user:type_user[this.type_user],
            temp:this.session_temp,
            session:this.session,
            slug:this.slug,
            permissions:this.permissions,
            client_slug:this.client_slug,
            token_account:this.token_account
        }
    }

    public getSession(){
        return this.session
    }
    
}

export { type_user, User }