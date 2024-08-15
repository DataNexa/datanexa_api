import { Router } from "express";
import account_service from "../services/account.service";
import account_auth from "../middlewares/account.auth";
import account_log from '../middlewares/account.log'
import { sleeper } from "../middlewares/sleeper";
const router = Router()

export default () => {
    router.post('/createAccount', sleeper(3000), account_service.createAccount, account_log.criouConta)
    router.post('/login', sleeper(3000), account_service.login, account_log.logou)
    router.post('/sendMeCodeRecover', sleeper(3000), account_service.sendMeCodeRecover, account_log.enviadoCodigoRecuperacao)
    router.post('/recover', sleeper(3000), account_service.recover, account_log.recuperou)
    router.post('/confirmEmail', account_service.confirmEmail)
    router.post('/edit', sleeper(3000), account_auth.onlyTempSessions, account_service.edit, account_log.editou)
    router.post('/expireSessions', account_auth.hasToken, account_service.expireAllSessions, account_log.expirouSessoes)
    router.post('/detelarTokenDevice', account_auth.onlyTempSessions, account_service.deleteTokenDevice, account_log.deletouTokens)
    router.get('/listTokenDevice', account_auth.onlyTempSessions, account_service.listTokenDevice)
    router.post('/createTempSession', account_auth.hasToken, account_service.createTempSession)
    router.post('/createSessionTemp', account_auth.hasToken, account_service.createSessionTemp)
    router.get('/listUsersAccount', account_auth.hasToken, account_service.listUsersAccount)
    router.get('/getAccountData', account_auth.hasToken, account_service.getAccountData)
    return router
}