import { Request, Response, NextFunction } from 'express'
import UserFactory from '../core/auth/UserFactory'

const authMid = async (req:Request, res:Response, next:NextFunction) => {

    if(!req.headers.authorization){
        res.user = UserFactory.AnonUser
        res.token = ''
        req.body.token = ''
        next()
        return
    }

    const [type, token] = req.headers.authorization.split(' ')

    if (type !== 'Bearer' || !token) {
        res.user = UserFactory.AnonUser
        res.token = ''
        req.body.token = ''
        next()
        return
    }

    const data = await UserFactory.factory(token)
    res.user = data.user
    res.token = data.token
    req.body.token = data.token

    next()
    
}

export default authMid



