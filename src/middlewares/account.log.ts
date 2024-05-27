import { Request, Response } from 'express'
import saveLog from '../helpers/logger'

export default {

    logou: (req:Request, res:Response) => {
        saveLog('account@login', `Usuário da conta: ${res.dataBody.email} realizou processo de login com sucesso`)
    },

    recuperou:(req:Request, res:Response) => {
        if(res.dataBody.info){
            if(res.dataBody.info == 'code'){
                saveLog('account@recover', `Usuário da conta: ${res.dataBody.email} solicitou codigo de recuperação que foi encaminhado por e-mail`)
            } else 
            if(res.dataBody.info == 'success'){
                saveLog('account@recover', `Usuário da conta: ${res.dataBody.email} finalizou processo de recuperação de conta com sucesso`)
            }
        }
    },

    editou:(req:Request, res:Response) => {
        const slug  = res.user.getJSON().slug
        const infos = res.dataBody.infos
        saveLog(`account@edit`, `Usuário ${slug} alterou informações de ${infos}`)
    },

    expirouSessoes: (req:Request, res:Response) => {
        const slug  = res.user.getJSON().slug
        saveLog(`account@edit`, `Usuário ${slug} expirou todas as sessões de usuários da conta e deletou todos os tokens`)
    },

    deletouTokens: (req:Request, res:Response) => {
        const slug  = res.user.getJSON().slug
        const total_tokens = res.dataBody.total
        saveLog(`account@edit`, `Usuário ${slug} deletou um total ${total_tokens} tokens`)
    },

}
  