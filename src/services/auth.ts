import { Request, Response } from 'express'

export default {

    logar: (req:Request, res:Response) => {
        console.log(res.user);
        res.send({})
    }

}