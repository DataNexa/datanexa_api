import { Router } from 'express'
import mensoes from '../services/mensoes'

const router = Router()

export default () => {

    router.get('/read/:id', mensoes.read)
    router.get('/list', mensoes.list)
    router.post('/create', mensoes.create)
    router.post('/update', mensoes.update)
    router.get('/delete/:id', mensoes.delete)

    return router

}