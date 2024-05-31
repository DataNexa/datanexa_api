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
    token_device_id:number,
    vtoken:number
}

interface data_account_i {
    nome:string,
    account_id:number
}

interface data_token_i {
    account_id:number,
    token_device_id:number,
    vtoken:number
}

interface header_i {
    type:type_session,
    expire_in:number
}

interface data_session_i {
    header:header_i,
    user:data_user_i
}

interface response_data_i { header:header_i, user?:data_user_i, token?:data_token_i, account?:data_account_i }


const generateSession = (data_user:data_user_i, hash_salt:string) => {
    return JWT.generate({alg:'sha512', type:type_session.SESSION, expire_in:Date.now() + 1000 * 60 * 60}, data_user, hash_salt, data_user.vtoken)
}

const generateToken = (data_token:data_token_i) => {
    return JWT.generate({alg:'sha512', type:type_session.TOKEN, expire_in:Date.now() + 1000 * 60 * 60 * 24 * 365}, data_token)
}

const generateSessionTemp = (data:data_account_i) => {
    return JWT.generate({alg:'sha512', type:type_session.SESSION_TEMP, expire_in:Date.now() + 1000 * 60 * 30}, data)
}

const getDataSession = (session:string):data_session_i => {
    const parts  = session.split('.')
    const header:header_i = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'))
    const user:data_user_i = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    return {
        header, user
    }
}

const verifySession = (session:string, hash_salt:string = "", vtoken:number = 0):false|response_data_i => {
    
    const data_full = JWT.verify(session, hash_salt, vtoken)


    if(!data_full) return false
    let time_now = data_full.header.expire_in - Date.now()
    if(time_now < 0) return false
    
    const datafinal:response_data_i = {
        header:data_full.header
    }

    if(data_full.header.type == type_session.SESSION){
        datafinal.user = data_full.data
    } else 
    if(data_full.header.type == type_session.SESSION_TEMP){
        datafinal.account = data_full.data
    } else
    if(data_full.header.type == type_session.TOKEN) {
        datafinal.token = data_full.data
    }

    return datafinal
    
}

export { type_session, data_account_i, data_user_i, data_token_i, header_i, getDataSession, generateSession, verifySession, generateToken, generateSessionTemp}