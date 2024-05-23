import test_query_helper from './test_query_helper'
import { Request, Response } from 'express'


export default async () => {
    let res = await test_query_helper()
    console.log(res);
}