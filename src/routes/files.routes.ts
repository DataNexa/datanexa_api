import { Router } from 'express'
import files from '../services/files'

const router = Router()

export default () => {

    router.get('/type/:file', files.types)

    return router

}