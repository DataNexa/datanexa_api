import { Request, Response, NextFunction } from 'express'
import response from '../helpers/response';

export default {

    login: (req:Request, res:Response) => {
        res.send({})
    },

    createUser: (req:Request, res:Response) => {

    },

    recover: (req:Request, res:Response) => {

    },

    expireMyAccount: (req:Request, res:Response) => {

    },

    choseUser:(req:Request, res:Response) => {

    },

    changePermissionsUser: (req:Request, res:Response) => {

    },

    blockUser:(req:Request, res:Response) => {

    },

    createTempSession:(req:Request, res:Response) => {

    }

}