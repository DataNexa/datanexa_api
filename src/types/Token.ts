import { User, UserDetail } from "./User"


type token_header = {
    alg:string,
    type:number,
    expire_in:number
}

type token = {
    header:token_header,
    data:User | UserDetail
}

export { token_header, token }