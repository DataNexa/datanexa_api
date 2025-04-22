import { Response } from 'express'
import Config from '../../util/config'

const isIntProduction = Config.instance().isInProduction()

const getCookieConfig = (diasDuracao: number):{httpOnly:boolean, sameSite:'lax'|'none', secure:boolean, path:string, maxAge:number } => { 
    return { 
        httpOnly: isIntProduction,
        sameSite: isIntProduction ? 'lax' : 'none',
        secure: isIntProduction,
        path: '/',
        maxAge: 3600000 * 24 * diasDuracao,
    }
}

const setCookie = (res: Response, name: string, value: string, diasDuracao?:number) => {
    res.cookie(name, value, getCookieConfig(diasDuracao ? diasDuracao : 365))
}

const expireCookie = (res: Response, name: string) => {
    res.cookie(name, '', getCookieConfig(0))
}


export default { setCookie, expireCookie }