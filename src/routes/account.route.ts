import { Router } from "express";
import account_service from "../services/account.service";
import account_auth from "../middlewares/account.auth";
import account_log from '../middlewares/account.log'

const router = Router()

export default () => {
    router.post('/createAccount', account_service.createAccount, account_log.criouConta)
    router.post('/login', account_service.login, account_log.logou)
    router.post('/sendMeCodeRecover', account_service.sendMeCodeRecover, account_log.enviadoCodigoRecuperacao)
    router.post('/recover', account_service.recover, account_log.recuperou)
    router.post('/edit', account_auth.onlyTempSessions, account_service.edit, account_log.editou)
    router.post('/expireSessions', account_auth.onlyTempSessions, account_service.expireAllSessions, account_log.expirouSessoes)
    router.post('/detelarTokenDevice', account_auth.onlyTempSessions, account_service.deleteTokenDevice, account_log.deletouTokens)
    router.get('/listTokenDevice', account_auth.onlyTempSessions, account_service.listTokenDevice)
    router.post('/createTempSession', account_auth.hasToken, account_service.createTempSession)
    router.get('/listUsersAccount', account_auth.hasToken, account_service.listUsersAccount)
    return router
}