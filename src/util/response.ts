import { NextFunction, Response } from 'express'

interface response_i {
    body?:any,
    session?:string,
    redirect?:string,
    message?:string,
    code:number
}

export default (res:Response, dataResponse:response_i = { code:200 }, next?:NextFunction) => {
    
    const user = res.user

    if(user.isNewSession()){
        dataResponse.session = user.getSession()
    }
    
    res.statusCode = dataResponse.code
    res.json(dataResponse)
    res.dataBody = dataResponse.body

    if(next && dataResponse.code == 200){
        next()
    }
    
}