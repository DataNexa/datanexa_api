import { QueryResult } from "mysql2"
import { query, execute } from "../helpers/query"

interface recover {
    recover_id:number,
    codigo:number,
    expire_in:Date,
    expired:boolean
}

interface session_temp {
    session_temp_id:number,
    session_value:string,
    expire_in:Date,
    used:boolean
}

interface token_account {
    token_account_id:number,
    vtoken:number,
    token_device_account?:{
        token_device_account_id:number,
        hash_salt:string,
        refresh_token: string,
        device:string
    }
}

interface response_data {
    error:boolean,
    error_code?:number,
    insertId?:number,
}

interface account {
    error:boolean,
    nome:string,
    email:string,
    senha:string,
    id:number,
    recover?:recover,
    session_temp?:session_temp,
    token_account?:token_account
}

enum JOIN {
    SESSION_TEMP,
    TOKEN_ACCOUNT,
    TOKEN_ACCOUNT_AND_DEVICE,
    RECOVER
} 

interface BY {
    email?:string,
    id?:number
}


interface join_and_where_order {
    join?:JOIN[],
    where?:string,
    order?:string,
    values?:any[]
}

const generate_fields_str = (table:string, fields:string[]) => {
    let f=""
    for(let fd of fields){
        f+=`,${table}.${fd} as ${table}_${fd}`
    }
    return f
}

const get_data_join_recover = () => {
    const fields = generate_fields_str('recover', ['id', 'codigo', 'expire_in', 'expired'])
    return [fields, " left join recover on recover.account_id = account.id"]
}

const get_data_join_session = () => {
    const fields = generate_fields_str('session_temp', ['id','session_value', 'expire_in', 'used'])
    return [fields, " left join session_temp on session_temp.account_id = account.id"]
}

const get_data_join_token = () => {
    const fields = generate_fields_str('token_account', ['id', 'vtoken'])
    return [fields, " left join token_account on token_account.account_id = account.id"]
}

const get_data_join_token_device = () => {
    let fields = generate_fields_str('token_account', ['id', 'vtoken'])
    fields += generate_fields_str('token_device_account', ['id', 'hash_salt', 'refresh_token', 'device'])
    return [fields, `
        left join token_account on token_account.account_id = account.id
        left join token_device_account on token_account.id = token_device_account.token_account_id
    `]
}

const startWhere = (str_where:string) => {
    return str_where == "" ? " where " : " AND "+str_where
}

const generateSingleRow = (rows:QueryResult):account => {
    
    const data = (rows as any[])[0]
    
    if(!data){
        return {
            error:true,
            id:0,
            nome:'',
            email:'',
            senha:''
        }
    }
    
    let obj:account = {
        error:false,
        id:data.id,
        nome:data.nome,
        email:data.email,
        senha:data.senha
    }

    if(data.recover_id){
        obj.recover = {
            recover_id: data.recover_id,
            codigo:data.recover_codigo,
            expire_in:new Date(data.recover_expire_in),
            expired:data.recover_expired == 1
        }
    }

    if(data.token_account_id){
        obj.token_account = {
            token_account_id:data.token_account_id,
            vtoken:data.token_account_vtoken
        }
        if(data.token_device_account_id){
            obj.token_account.token_device_account = {
                token_device_account_id: data.token_device_account_id,
                hash_salt:data.hash_salt,
                refresh_token:data.refresh_token,
                device:data.device
            }
        }
    }

    return obj
}

const account_repo = {

    async getAccount(by:BY, join_where_order:join_and_where_order = {}):Promise<account>{
        
        let str_fields = "select account.id, account.nome, account.email, account.senha "
        let str_from = " from account "
        let str_where = "" 
        let binds:any = []

        if(by.email) {
            str_where += startWhere(str_where)+" account.email = ? "
            binds.push(by.email)
        }
            
        if(by.id) {
            str_where += startWhere(str_where)+" account.id = ? "
            binds.push(by.id)
        }

        if(join_where_order.join)
            for(let j of join_where_order.join){
                if (j == JOIN.RECOVER){
                    let dataRecover = get_data_join_recover()
                    str_fields += dataRecover[0]
                    str_from += dataRecover[1]
                } else 
                if (j == JOIN.SESSION_TEMP){
                    let dataSession = get_data_join_session()
                    str_fields += dataSession[0]
                    str_from += dataSession[1]
                } else 
                if (j == JOIN.TOKEN_ACCOUNT) {
                    let dataToken = get_data_join_token()
                    str_fields += dataToken[0]
                    str_from += dataToken[1]
                } else 
                if (j == JOIN.TOKEN_ACCOUNT_AND_DEVICE) {
                    let dataTokenDev = get_data_join_token_device()
                    str_fields += dataTokenDev[0]
                    str_from += dataTokenDev[1]
                }

            }

        if(join_where_order.where)
            for(let j of join_where_order.where){
                str_where += j
            }

        let query_str = str_fields + str_from + str_where
        if(join_where_order.order){
            query_str += join_where_order.order
        }

        if(join_where_order.values){
            for(let v of join_where_order.values){
                binds.push(v)
            }
        }

        const res = await query(query_str, {
            binds:binds
        })

        if(res.error){
            return {
                error:true,
                email:'',
                senha:'',
                nome:'',
                id:0
            }
        }

        return generateSingleRow(res.rows)

    },

    async register(nome:string, email:string, senha:string):Promise<response_data>{
        return {
            error:false
        }
    },

    async registerToken(token_account_id:number, hash_salt:string, refresh_token:string, device:string):Promise<response_data>{
        const respIns = await execute(
            `insert into 
                token_device_account (token_account_id, hash_salt, refresh_token, device)
                values(?,?,?,?)`,{
                    binds:[token_account_id, hash_salt, refresh_token, device]
                })
        
        if(!respIns)
            return {
                error:true
            }
       
        return {
            error:false
        }
    },

    async registerRecover():Promise<response_data>{
        return {
            error:false
        }
    },


}

export {

    BY,
    JOIN,
    account_repo

}