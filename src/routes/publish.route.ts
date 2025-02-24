import { Router } from 'express'
import AuthorizeMid from '../middlewares/AuthorizeMid'
import MappingMid from '../middlewares/MappingMid'
import publicacoes from '../services/publicacoes'


const router = Router()

export default () => {

    router.get('/read/:id', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, publicacoes.read)
    router.get('/list', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, publicacoes.list)
    router.post('/create', AuthorizeMid.onlyBotUser, publicacoes.create)
    router.post('/createMany', AuthorizeMid.onlyBotUser, publicacoes.createMany)
    router.post('/update', AuthorizeMid.onlyBotUser, publicacoes.update)
    router.get('/delete/:id', MappingMid.mustHaveClientId, AuthorizeMid.onlyClientUser, publicacoes.delete)

    return router

}