
import express, {  Request, Response, NextFunction } from "express";
import { user_type, UserDetail } from "../types/User.d";


export default  async (req:Request, res:Response, next:NextFunction) => {

    
    res.user = {
        nome: "Andrei",
        email:"andrei@email.com",
        hashid:"IODFIOJDF",
        type: user_type.BOT
    } as UserDetail

    next()

}