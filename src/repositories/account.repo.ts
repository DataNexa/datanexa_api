import { QueryResult } from "mysql2"
import { query, execute, multiTransaction, MultiTransaction } from "../util/query"
import { response_data } from "./repositories"
import JWT from '../libs/JWT';

import { generateToken } from "../libs/session_manager";

interface data_tokens {id:number, device:string}

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


interface account {
    error:boolean,
    nome:string,
    email:string,
    senha:string,
    id:number,
    confirmed:boolean,
    temporary:boolean,
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

const getDateSessionTemp = () => {
    return new Date(Date.now() + 1000 * 60 * 30)
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
            senha:'',
            confirmed:false,
            temporary:false
        }
    }
    
    let obj:account = {
        error:false,
        id:data.id,
        nome:data.nome,
        email:data.email,
        senha:data.senha,
        confirmed:data.confirmed == 1,
        temporary:data.temporary == 1
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

    if(data.session_temp_id){
        obj.session_temp = {
            session_temp_id: data.session_temp_id,
            session_value: data.session_temp_session_value,
            expire_in: data.session_temp_expire_in,
            used: data.session_temp_used
        }
    }

    return obj
}

const account_repo = {

    async getAccount(by:BY, join_where_order:join_and_where_order = {}):Promise<account>{
        
        let str_fields = "select account.id, account.nome, account.email, account.senha, account.confirmed, account.temporary "
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
                id:0,
                confirmed:false,
                temporary:false
            }
        }

        return generateSingleRow(res.rows)

    },

    async registerTemp(email:string, conn:MultiTransaction):Promise<response_data> {

        const resp = await conn.execute(`insert into account (nome, email, senha, temporary) values ('temp', ?, 'temp', 1)`, {
            binds:[email]
        })

        if(resp.error){
            if(resp.error_code == 1062)
                return {
                    error:true,
                    error_code:1062,
                    error_message:"Este e-mail já está em uso"
                }
            else
                return {
                    error:true,
                    error_code:1,
                    error_message:"Erro ao tentar salvar e-mail. Tente novamente, por favor."
                }
        }

        return {
            error:false,
            insertId:(resp.rows as any).insertId
        }

    },

    async register(nome:string, email:string, passHash:string):Promise<response_data>{

        const conn = await multiTransaction()

        const selQ = await conn.query('select id, temporary from account where email = ?', {
            binds:[email]
        })

        let account_id  = 0
        let resp_db_arr = (selQ.rows as {id:number, temporary:number}[])

        if(resp_db_arr.length == 0){
            
            const statusResp = await conn.execute('insert into account(nome, email, senha) values (?,?,?)', {
                binds:[ nome, email, passHash ]
            })
    
            if(statusResp.error){
                
                if(statusResp.error_code == 1062)
                    return {
                        error:true,
                        error_code:1062,
                        error_message:"Este e-mail já está em uso"
                    }
                else
                    return {
                        error:true,
                        error_code:1,
                        error_message:"Erro ao tentar criar conta"
                    }
            }
    
            account_id = (statusResp.rows as any).insertId

        } else if(resp_db_arr[0].temporary == 1) {

            account_id = resp_db_arr[0].id

            const statusResp = await conn.execute('update account set nome = ?, email = ?, senha = ?, temporary = 0 where id = ?', {
                binds:[ nome, email, passHash, account_id ]
            })

            if(statusResp.error) {
                return {
                    error:true,
                    error_code:1,
                    error_message:"Erro ao tentar criar conta"
                }
            }

        } else {
            return {
                error:true,
                error_code:1062,
                error_message:"Este e-mail já está em uso;"
            }
        }
        
        const statusCreate = await conn.execute('insert into token_account(account_id, vtoken) values (?,?)', {
            binds:[account_id, 1]
        })

        if(statusCreate.error){
            return {
                error:true,
                error_code:2,
                error_message:"Erro ao tentar salvar e-mail. Tente novamente, por favor."
            }
        }

        conn.finish()
        
        return {
            error:false
        }
    },

    async registerToken(token_account_id:number, hash_salt:string, refresh_token:string, device:string, conn?:MultiTransaction):Promise<{error:boolean, insertId:number}>{
        
        const respIns = !conn 
            ? await execute(
                `insert into 
                token_device_account (token_account_id, hash_salt, refresh_token, device)
                values(?,?,?,?)`,{
                    binds:[token_account_id, hash_salt, refresh_token, device]
                }) 
            : await conn.execute(
                    `insert into 
                token_device_account (token_account_id, hash_salt, refresh_token, device)
                values(?,?,?,?)`,{
                    binds:[token_account_id, hash_salt, refresh_token, device]
                })
       
        return {
            error:respIns.error,
            insertId: !respIns.error ? (respIns.rows as any).insertId : 0
        }
        
    },

    async registerSessionTemp(account_id:number, session_value:string):Promise<response_data>{
        
        const execRespSess = await execute(`
            insert into session_temp(account_id, session_value, expire_in, used)
            values (?,?,?,?)
        `, {
            binds: [account_id, session_value, getDateSessionTemp(), 0]
        })

        return {
            error:execRespSess.error
        }
    },

    async registerNewRecoverCode(account_id:number, codigo:string, expire_in:Date):Promise<response_data>{
        
        const execResp = await execute(`
            insert into recover (account_id, codigo, expire_in, expired)
            values(?,?,?,?) 
        `, {
            binds:[account_id, codigo, expire_in, 0]
        })

        return {
            error:execResp.error
        }
    },

    async expireSessionTemp(account_id:number, session_temp_id:number):Promise<response_data> {
        const expireTemp = await execute(
            'update session_temp set used = 1 where account_id = ? and id = ?'
        , {
            binds:[account_id, session_temp_id]
        })
        return {
            error: expireTemp.error
        }
    },

    async expireRecoverCode(recover_id:number):Promise<response_data>{

        const updateRec = await execute('update recover set expired = 1 where id = ?',{
            binds:[recover_id]
        })

        return {
            error:updateRec.error
        }
    },

    async confirmAccount(email:string, code:string):Promise<response_data>{

        const conn = await multiTransaction()

        const qacc = await conn.query(`
            select 
                account.id as account_id, recover.id as recover_id, recover.expired, recover.expire_in 
            from recover 
                join account on account.id = recover.account_id
            where
                account.email = ? and recover.codigo = ?
            `, {
                binds:[email, code]
            });

        if(qacc.error){
            return {
                error:true,
                error_message:'erro no banco de dados - 1'
            }
        }

        const infoacc = (qacc.rows as any[])
        if(infoacc.length == 0){
            return {
                error:true,
                error_message: 'Código não encontrado'
            }
        }

        if(infoacc[0].expired || Date.now() > (new Date(infoacc[0].expirein)).getTime()){
            return {
                error:true,
                error_message:'Código expirado'
            }
        }

        const account_id = infoacc[0].account_id
        const recover_id = infoacc[0].recover_id

        if((await conn.execute(`update recover set expired = 1 where id = ${recover_id}`)).error){
            return {
                error:true,
                error_message: 'erro no banco de dados - 2'
            }
        }

        if((await conn.execute(`update account set confirmed = 1 where id = ${account_id}`)).error){
            return {
                error:true,
                error_message:'erro no banco de dados - 3'
            }
        }

        await conn.finish()

        return {
            error:false,
            error_message:'Conta confirmada com sucesso'
        }  

    },

    async login(email:string, senha:string, user_agent:string):Promise<{token:string, error:boolean, code:number, message:string}>{

        const conn = await multiTransaction()
        const selAccout = await conn.query(`
            select 
                account.id, account.nome, account.email, account.senha, 
                account.confirmed, account.temporary, 
                token_account.id as token_account_id, 
                token_account.vtoken as vtoken 
            from account  
                left join token_account on token_account.account_id = account.id 
            where account.email = ?  and account.temporary = 0
        `,{
            binds:[email]
        })

        if(selAccout.error){
            await conn.rollBack()
            return {
                token:'',
                error:true,
                code:500,
                message:'Erro no servidor - 1'
            }
        }

        const acc = (selAccout.rows as any[])[0]

        if(acc.length == 0 || !await JWT.comparePassword(senha, acc.senha)){
            await conn.rollBack()
            return {
                token:'',
                error:true,
                code:404,
                message:'E-mail e/ou senha incorretos'
            }
        }

        if(!acc.confirmed){
            await conn.rollBack()
            return {
                token:'',
                error:true,
                code:404,
                message:'Você ainda não confirmou seu e-mail'
            }
        }

        const refresh_token = JWT.newToken(`${acc.id}refresh_token${Date.now()}`, 'sha512')
        const hash_salt     = JWT.newToken(`${acc.id}hash_salt${Date.now()}`)

        const response_register = await account_repo.registerToken(
            acc.token_account_id,
            hash_salt,
            refresh_token,
            user_agent,
            conn
        )

        if(response_register.error){
            await conn.rollBack()
            return {
                token:'',
                error:true,
                code:404,
                message:'Erro ao tentar salvar token no banco de dados, por favor tente novamente.'
            }
        }

        const token_device_account_id = response_register.insertId

        const token = generateToken({
            account_id:acc.id,
            token_device_id:token_device_account_id,
            vtoken:acc.vtoken
        })

        await conn.finish()

        return {
            token:token,
            error:false,
            code:200,
            message:''
        }

    },

    async updateVToken(account_id:number):Promise<response_data>{

        const updateVTok = await execute('update token_account set vtoken = vtoken + 1 where account_id = ?', {
            binds:[account_id]
        })

        return {
            error:updateVTok.error
        }

    },

    async deleteTokens(account_id:number, tokens_id:number[]):Promise<response_data>{

        const placeholders = tokens_id.map(() => '?').join(',');
        const binds = [ account_id ]
        binds.push(...tokens_id)

        const deleteTokens = await query(`
            delete from token_device_account 
            join token_account on token_account.id = token_device_account.token_account_id
            join account on account.id = token_account.account_id
            where 
                account.id = ?
            and 
                token_device_account.id in (${placeholders})
        `, {
            binds:binds
        })

        return {
            error:deleteTokens.error
        }
    },

    async getListTokens( account_id:number):Promise<data_tokens[]|false>{

        const listQuery = await query(`
            select
                token_device_account.id,
                token_device_account.device 
            from token_device_account 
                join token_account on token_account.id = token_device_account.token_account_id
                join account on account.id = token_account.account_id
            where 
                account.id = ?
        `, {
            binds:[account_id]
        })


        return listQuery.error ? false : (listQuery.rows as data_tokens[])

    },

    async update(data:{nome?:string, email?:string, senha?:string }, account_id:number):Promise<response_data>{

        if(!data.nome && !data.email && !data.senha){
            return {
                error_code:400,
                error:true
            }
        }
        
        const binds:any[] = []
        let sqlinsert = "update account set confirmed = 1, ";

        if(data.nome){
            sqlinsert += " nome = ?, "
            binds.push(data.nome)
        }

        if(data.email) {
            sqlinsert += " email = ?, "
            binds.push(data.email)
        }

        if(data.senha) {
            sqlinsert += " senha = ?, "
            binds.push(data.senha)
        }

        sqlinsert = sqlinsert.substring(0, sqlinsert.length - 2)
        sqlinsert += " where id = ? "
        binds.push(account_id)

        const statusExec  = await execute(sqlinsert, {
            binds:binds
        })

        return {
            error:statusExec.error
        }
    }

}

export {

    BY,
    JOIN,
    account_repo

}