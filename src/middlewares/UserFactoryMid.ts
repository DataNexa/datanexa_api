import { Request, Response, NextFunction } from 'express'
import UserFactory from '../core/auth/UserFactory'

// Função utilitária para definir usuário anônimo
const setAnonymousUser = (res: Response, req: Request) => {
    res.user = UserFactory.AnonUser
    res.token = ''
    req.body.token = ''
}

const authMid = async (req: Request, res: Response, next: NextFunction) => {
    try {
        
        if (!req.headers.authorization) {
            setAnonymousUser(res, req)
            return next()
        }

        const [type, token] = req.headers.authorization.split(' ')

        if (type !== 'Bearer' || !token) {
            setAnonymousUser(res, req)
            return next()
        }

        const data = await UserFactory.factory(token)
        res.user = data.user
        res.token = data.token
        req.body.token = data.token

        next()
    } catch (error) {
        console.error('Error in authMid:', error)
        setAnonymousUser(res, req)
        next()
    }
}

export default authMid