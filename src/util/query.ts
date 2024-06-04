import { mysqli, QueryResult, PoolConnection } from "./mysqli"
import globals from "../config/globals"
import { NextFunction, Response } from 'express'
import response from "./response"

interface response_query {
    error:boolean,
    error_code?:number,
    error_message?:string,
    rows:QueryResult
}


interface query_obj {
    table:string,
    columns:string[],
    order_by:string[],
    where:string,
    like:string,
    page:number,
    limit:number
}

interface query_oriented {
    binds?:any[],
    next?:NextFunction,
    res?:Response,
    notEmptyRows?:boolean
}

interface execute_oriented {
    binds?:any[],
    next?:NextFunction,
    res?:Response
}

class MultiTransaction {

    private conn:PoolConnection | null = null;
    private transaction_num:number = 0
    private isBegin:boolean = false

    constructor(conn:PoolConnection | null){
        this.conn = conn
    }

    getTransactionNumber(){
        return this.transaction_num
    }

    async begin(){
        if(!this.conn || this.isBegin){
            return false
        }
        await this.conn.beginTransaction()
        this.isBegin = true
        return true
    }

    async execute(query:string, oriented?:execute_oriented):Promise<response_query>{
        try {
            if(!this.conn) return {
                error:true,
                error_code:1,
                rows:[]
            }
            const [result] = await this.conn.execute(query, oriented?.binds)
            return {
                error:false,
                rows:result
            }
        } catch (error) {
            await this.rollBack()
            
            return {
                error:true,
                error_code:(error as any).errno,
                rows:[]
            }
            
        }

    }

    async query(query:string, oriented?:execute_oriented):Promise<response_query> {
        try {
            if(!this.conn) return {
                error:true,
                error_code:1,
                rows:[]
            }
            const [result] = await this.conn.query(query, oriented?.binds)
            return {
                error:false,
                rows:result
            }
        } catch (error) {
            await this.rollBack()
            return {
                error:true,
                error_code:(error as any).errno,
                rows:[]
            }
            
        }
    }

    public async rollBack(){
        if(!this.conn) return
        await this.conn.rollback()
        this.conn.release();
        this.conn = null
    }

    async finish() {
        if(!this.conn) return
        await this.conn.commit()
        this.conn.release();
        this.conn = null
    }

}

const multiTransaction = async ():Promise<MultiTransaction> => {
    const conn = await mysqli().getConnection()
    const mult = new MultiTransaction(conn)
    await mult.begin()
    return mult
}


const genQueryString = (query:query_obj) => {
    return ""
}


const query = async (query:string, oriented?:query_oriented):Promise<response_query> => { 
    try {

        let [result] = await mysqli().query(query, oriented?.binds)

        if(oriented?.res){
            if(oriented?.notEmptyRows && result )
                response(oriented.res, { code:404, message:'Registro não encontrado' })
            else
                response(oriented.res, { body:result, code:200 })
        }
        return {
            rows: result,
            error:false
        }
   
    } catch (e) {

        if(!globals.production)
            console.log(e)

        if(oriented?.res)
            response(oriented.res, { code:500 })
        
        return {
            error_code: (e as any).errno,
            error_message: (e as any).sqlMessage,
            rows:[],
            error:true
        }
    }
}


const execute = async (query:string, oriented?:execute_oriented):Promise<response_query> => { 
    try {
        const [result] = await mysqli().execute(query, oriented?.binds)
        return {
            error:false,
            rows:result
        }
    } catch (e) {

        if(!globals.production)
            console.log(e)

        if(oriented?.res)
            response(oriented.res, { code:500 })
        
        return {
            error:true,
            rows:[],
            error_code:(e as any).errno,
            error_message:(e as any).sqlMessage
        }
    }
}



export { query , execute, multiTransaction } 