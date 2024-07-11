enum type_user {
    ANONIMUS, GHOST, ADMIN, ADMIN_CLIENT, USER_CLIENT, BOT
}

interface user_i {
    account_id:number,
    user_id:number,
    type_user:type_user,
    temp:string|undefined,
    session:string|undefined,
    slug:string|undefined,
    permissions:string[],
    client_id:number|undefined,
    client_nome:string|undefined,
    client_slug:string|undefined,
    token_account:string|undefined,
    token_device_id:number|undefined,
    vtoken:number|undefined
}

class User {

    private user_id:number = 0
    private account_id:number = 0
    private type_user:type_user = type_user.ANONIMUS
    private session_temp:string|undefined
    private session:string|undefined
    private slug:string|undefined
    private permissions:string[] = []
    private client_id:number|undefined
    private client_nome:string = 'DataNexa'
    private client_slug:string = 'datanexa'
    private token_account:string|undefined
    private token_device_id:number = 0
    private vtoken:number = 0
    private newSession:boolean = false
    private nome:string = ''
    private email:string = ''
    private encPass:string = ''
    private locale:string = ''

    public setLocale(locale:string) {
        this.locale = locale
    }

    public getAccountId() {
        return this.account_id
    }

    public getUserId() {
        return this.user_id
    }

    public isNewSession():boolean {
        return this.newSession
    }

    public setTypeUser(type:type_user){
        this.type_user = type
    }

    public setSession(session:string, isNew:boolean = false){
        this.newSession = isNew
        this.session = session
    }

    public setId(id:number){
        this.user_id = id
    }

    public setSlug(slug:string){
        this.slug = slug
    }

    public setAccountId(account_id:number) {
        this.account_id = account_id
    }

    public setPermissions(permissions:string[]){
        this.permissions = permissions
    }

    public setClientId(client_id:number){
        this.client_id = client_id
    }

    public setSessionTemp(session_temp:string){
        this.session_temp = session_temp
    }

    public setTokenAccount(token_account:string){
        this.token_account = token_account
    }

    public setTokenDeviceId(token_device_id:number){
        this.token_device_id = token_device_id
    }

    public setVToken(vtoken:number){
        this.vtoken = vtoken
    }

    public setClientNome(nome:string) {
        this.client_nome = nome
    }

    public setClientSlug(slug:string) {
        this.client_slug = slug
    }

    public setNome(nome:string) {
        this.nome = nome
    }

    public setEmail(email:string){
        this.email = email
    }

    public setEncPass(senha:string){
        this.encPass = senha
    }

    public getNome(){
        return this.nome
    }

    public getEmail(){
        return this.email
    }

    public getSlug(){
        return this.slug
    }

    public getEncPass(){
        return this.encPass
    }

    public getVToken(){
        return this.vtoken
    }

    public getUserTokenDeviceId(){
        return this.token_device_id
    }

    public getTypeUser(){
        return this.type_user
    }

    public getPermissions(){
        return this.permissions
    }

    public getClientId(){
        return this.client_id
    }

    public getClientNome(){
        return this.client_nome
    }

    public getClientSlug(){
        return this.client_slug
    }

    public getLocale(){
        return this.locale
    }

    public getJSON():user_i {
        return {
            account_id:this.account_id,
            user_id:this.user_id,
            type_user:this.type_user,
            temp:this.session_temp,
            session:this.session,
            slug:this.slug,
            client_nome:this.client_nome,
            permissions:this.permissions,
            client_id:this.client_id,
            client_slug:this.client_slug,
            token_account:this.token_account,
            token_device_id:this.token_device_id,
            vtoken:this.vtoken
        }
    }

    public getSession(){
        return this.session
    }

    public getSessionTemp(){
        return this.session_temp
    }
    
}

export { type_user, User }