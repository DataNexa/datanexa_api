import { Request, Response, NextFunction } from 'express';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const sleeper = (ms: number) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await sleep(ms);
        next();
    };
};