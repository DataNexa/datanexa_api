enum user_type {
    ANONIMO, CLIENT, ADMIN, BOT
}

interface User {
    type:user_type,
    hashid?:String
}

interface UserDetail extends User {
    email:string,
    nome:String,
    id:number
}

export { User, UserDetail, user_type }