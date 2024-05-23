import mysqli from "./mysqli"
import globals from "../config/globals"
import { Response } from 'express'
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

const genQueryString = (query:query_obj) => {
    return ""
}

const queryPromisse = (query:string|query_obj, binds?:any[]) => {
    
    const querystr:string = typeof query == "string" ? query : genQueryString(query)

    return new Promise((resolve, reject) => {
        if(binds){
            mysqli().query(querystr, binds, function (err, result) {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        } else {
            mysqli().query(querystr, function (err, result) {
                if (err) {
                    return reject(err)
                }
                resolve(result)
            })
        }
        
    })
    
}

const query = async (query:string|query_obj, binds?:any[], res?:Response) => { 
    try {
        let result = await queryPromisse(query, binds)
        if(res)
            return response(res, { body:result, code:200 })
        return result
    } catch (e) {
        if(!globals.production)
            console.log(e);
        if(res)
            response(res, { code:500 })
    }
    
}

export default query 