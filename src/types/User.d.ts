enum user_type {
    ANONIMO = 0, 
    CLIENT = 1, 
    ADMIN = 2, 
    BOT = 3
}

interface User {
    type:user_type,
    vtoken:number,
    id:number
}

interface UserDetail extends User {
    email:string,
    nome:String,
    client_id:number
}

export { User, UserDetail, user_type }