
import { User } from "../../types/User";
import JWT from "./JWT";
import { token } from "../../types/Token";
import userCache from "../cache/userCache";
import userDB from "../database/userDB";

const AnonUser:User = {
    type:0,
    vtoken:0,
    id:0
}


const generateUserToken = async (user:User, expire_horas:number = 10) => {
    return JWT.generate(
        {
            alg:'sha256', 
            type:user.type, 
            expire_in: (new Date()).getTime() + (3600000 * expire_horas)
        },
        user
    )
}


const factory = async (token_str?:string):Promise<{token:string, user:User}> => {

    if(!token_str) return { token: '', user:AnonUser }
    
    let token = JWT.verify(token_str.trim())
    if(!token) return { token: '', user:AnonUser }
    
    let tokenChecked = await checkTokenAndGetUser(token)
    if(!tokenChecked) return { token: '', user:AnonUser }

    return { token: tokenChecked.token, user:tokenChecked.user }
    
}


const checkTokenAndGetUser = async (token:token):Promise<{token:string, user:User}|false> => {

    let exp = token.header.expire_in - (new Date()).getTime()

    if(exp <= 0) return false
 
    const userC = await userCache.getDataUser(token.data.id)
    let userF:User

    let isInCache = false

    if(userC){
        if(userC.vtoken != token.data.vtoken)
            return false
        isInCache = true
        userF = userC
    } else {
        const userD = await userDB.getUser(token.data.id)
        if(userD.vtoken != token.data.vtoken)
            return false
        userF = userD
    }

    if(!isInCache){
        userCache.saveDataUser(userF)
    }
    
    let tokenstr = ""

    if(exp < (3600000 * 1)){
        tokenstr = await generateUserToken(token.data)
    }

    return { token: tokenstr, user: userF }

}


export default { factory, AnonUser, generateUserToken }