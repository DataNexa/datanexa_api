import { Response } from 'express'

interface response_i {
    body?:any,
    session?:string,
    redirect?:string,
    message?:string,
    code:number
}

export default (res:Response, dataResponse?:response_i) => {
    const user = res.user
    if(dataResponse && user.isNewSession()){
        dataResponse.session = user.getSession()
    }
    res.statusCode = dataResponse ? dataResponse.code : 200
    res.send(dataResponse)
}