import test_query_helper from './test_query_helper'
import { Request, Response } from 'express'

import { multiTransaction } from '../util/query'
import repo_tests from './repo_tests'
import cache from '../libs/cache'
import { user_repo } from '../repositories/user.repo'

export default async () => {
    //test_query_helper()
    //repo_tests()
    // console.log(await cache.getDataUser(5));
    //user_repo.register('andreicoelho@qsmidia#1234567891', [2,3], 'andreifcoelho@gmail.com', 3);
}