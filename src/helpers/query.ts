import mysqli from "./mysqli"
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

const query = async (query:string|query_obj, oriented?:query_oriented) => { 
    try {
        let result = await queryPromisse(query, oriented?.binds)
        if(oriented?.res)
            return response(oriented.res, { body:result, code:200 })
        return result
    } catch (e) {
        if(!globals.production)
            console.log(e);
        if(oriented?.res)
            response(oriented.res, { code:500 })
    }
}

export default query 