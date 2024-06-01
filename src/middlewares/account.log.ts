import { Request, Response } from 'express'
import saveLog from '../util/logger'

export default {

    enviadoCodigoRecuperacao: (req:Request, res:Response) => {
        saveLog('account@sendMeCodeRecover', `Enviado código de recuperação para a conta: '${req.params.email}' com sucesso`)
    },

    criouConta: (req:Request, res:Response) => {
        saveLog('account@login', `Nova conta com o e-mail '${req.params.email}' criada com sucesso`)
    },

    logou: (req:Request, res:Response) => {
        saveLog('account@login', `Usuário da conta: '${req.params.email}' realizou processo de login com sucesso`)
    },

    recuperou:(req:Request, res:Response) => {
        if(res.dataBody.info){
            if(res.dataBody.info == 'code'){
                saveLog('account@recover', `Usuário da conta: '${res.dataBody.email}' solicitou codigo de recuperação que foi encaminhado por e-mail`)
            } else 
            if(res.dataBody.info == 'success'){
                saveLog('account@recover', `Usuário da conta: '${res.dataBody.email}' finalizou processo de recuperação de conta com sucesso`)
            }
        }
    },

    editou:(req:Request, res:Response) => {
        const infos = res.dataBody
        saveLog(`account@edit`, `Usuário da conta id: '${res.user.getAccountId()}' alterou informações de ${infos}`)
    },

    expirouSessoes: (req:Request, res:Response) => {
        saveLog(`account@expireAllSessions`, `da conta id: '${res.user.getAccountId()}' expirou todas as sessões de usuários da conta e deletou todos os tokens`)
    },

    deletouTokens: (req:Request, res:Response) => {
        const total_tokens = res.dataBody
        saveLog(`account@deleteTokenDevice`, `da conta id: '${res.user.getAccountId()}' deletou um total ${total_tokens} tokens`)
    },

}
  