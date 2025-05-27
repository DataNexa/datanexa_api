import { Router } from 'express'
import monitoramentos from '../services/monitoramentos'
import AuthorizeMid from '../middlewares/AuthorizeMid'
import MappingMid from '../middlewares/MappingMid'

const router = Router()

export default () => {

    router.get('/list', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.list)
    router.post('/update', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.update)
    router.post('/create', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.create)
    router.get('/delete/:id', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.delete)
    router.get('/read/:id', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.read)
    router.post('/ativarMonitoramento', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.ativarMonitoramento)
    router.post('/desativarMonitoramento', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.desativarMonitoramento)
    router.post('/addConfig', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.addConfig)
    router.post('/editConfig', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.editConfig)
    router.post('/deleteConfig', MappingMid.mustHaveClientId, AuthorizeMid.onlyValidUser, monitoramentos.deleteConfig)

    router.get('/readAll', AuthorizeMid.onlyBotUser, monitoramentos.readAll)
    

    return router

}