import JWT from "./JWT";

enum type_session {
    SESSION,
    SESSION_TEMP,
    TOKEN
}

interface data_user_i {
    user_id:number,
    slug:string,
    user_type:string,
    nonce:number,
    hash:string
}

interface data_token_i {
    token_account_device:string,
    token_account_hash:string
}

interface header_i {
    type:type_session,
    expire_in:number
}

interface response_data_i { header:header_i, user?:data_user_i, account?:data_token_i }


const generateSession = (data_user:data_user_i) => {
    return JWT.generate({alg:'sha512', type:type_session.SESSION, expire_in:Date.now() + 1000 * 60 * 30}, data_user)
}

const generateToken = (data_token:data_token_i) => {
    return JWT.generate({alg:'sha512', type:type_session.TOKEN, expire_in:Date.now() + 1000 * 60 * 60 * 24 * 365}, data_token)
}

const generateSessionTemp = (data:any) => {
    return JWT.generate({alg:'sha512', type:type_session.SESSION, expire_in:Date.now() + 1000 * 60 * 30}, data)
}

const verifySession = (session:string):false|response_data_i => {
    
    const data_full = JWT.verify(session)
    
    if(!data_full) return false
    let time_now = data_full.header.expire_in - Date.now()
    if(time_now < 0) return false
    
    const datafinal:response_data_i = {
        header:data_full.header
    }

    if(data_full.data.token_account_device){
        datafinal.account = data_full.data
    } else {
        datafinal.user = data_full.data
    }

    return datafinal
    
}

export { type_session, generateSession, verifySession, generateToken, generateSessionTemp}