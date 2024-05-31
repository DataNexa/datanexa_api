import { Request, Response } from 'express'
import Authorization from '../model/Authorization'


const authorization = (req:Request, res:Response):Authorization =>{
    return new Authorization(req, res)
}

export default authorization