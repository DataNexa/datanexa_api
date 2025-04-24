
interface User {
    type:number,
    vtoken:number,
    id:number,
    client_id?:number
}

interface UserDetail extends User {
    email:string,
    nome:String,
    picture:string
}

export { User, UserDetail }