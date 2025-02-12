import { Request, Response } from 'express'
import mensaoRepo from '../repositories/mensao.repo'

export default {


    read: async(req:Request, res:Response) => {

        const client_id = req.parsedQuery.client_id

        //mensaoRepo.get()

    }


}