import { mysqli, RowDataPacket, QueryError, QueryResult } from "./mysqli"
import globals from "../config/globals"
import { NextFunction, Response } from 'express'
import response from "./response"

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
    res?:Response,
    lastInserted?:boolean
}

const genQueryString = (query:query_obj) => {
    return ""
}

const queryPromisse = (query:string|query_obj, binds?:any[]):Promise<RowDataPacket[] | RowDataPacket[][]> => {
    
    const querystr:string = typeof query == "string" ? query : genQueryString(query)

    return new Promise((resolve, reject) => {
        if(binds){
            mysqli().query(querystr, binds, function (err:QueryError | null, result:RowDataPacket[] | RowDataPacket[][]) {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        } else {
            mysqli().query(querystr, function (err:QueryError | null, result:RowDataPacket[] | RowDataPacket[][]) {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        }
        
    })
    
}

const executePromise = (query:string|query_obj, binds?:any[]):Promise<QueryResult> => {
    
    const querystr:string = typeof query == "string" ? query : genQueryString(query)

    return new Promise((resolve, reject) => {
        if(binds){
            mysqli().execute(querystr, binds, function (err:QueryError | null, result:RowDataPacket[] | RowDataPacket[][]) {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        } else {
            mysqli().execute(querystr, function (err:QueryError | null, result:RowDataPacket[] | RowDataPacket[][]) {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        }
        
    })
}

const query = async (query:string|query_obj, oriented?:query_oriented) => { 
    try {
        let result = await queryPromisse(query, oriented?.binds)

        if(oriented?.res){
            if(oriented?.notEmptyRows && result.length == 0 )
                response(oriented.res, { code:404, message:'Registro não encontrado' })
            else
                response(oriented.res, { body:result, code:200 })
        }

        return result
   
    } catch (e) {

        if(!globals.production)
            console.log(e)

        if(oriented?.res)
            response(oriented.res, { code:500 })
        
        return []
    }
}


const execute = async (query:string|query_obj, oriented?:execute_oriented) => { 
    try {
        return await executePromise(query, oriented?.binds)
    } catch (e) {

        if(!globals.production)
            console.log(e)

        if(oriented?.res)
            response(oriented.res, { code:500 })
        
        return false
    }
}



export { query , execute } 