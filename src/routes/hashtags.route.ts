import { Router } from 'express'
import hashtags from '../services/hashtags'

const router = Router()

export default () => {

    router.get('/list/:mensao_id', hashtags.list)
    router.post('/create',hashtags.create)
    router.get('/delete/:mensao_id/:id', hashtags.delete)

    return router

}