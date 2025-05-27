import globals from "./app/globals";
import init from "./app/init";
import fs from 'fs'
import path from 'path'
import https from 'https'
import Config from "./util/config";
import Logger from "./util/logger";
import install from "./app/install";

const certPath = path.resolve(__dirname, '..')

const options = {
    key: fs.readFileSync(path.join(certPath, 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(certPath, 'localhost.pem'))
}

const app = async () => { 
   try {
        await install.install()
        return await (
            !Config.instance().isInProduction() ? 
            https.createServer(options, await init(globals.version)) :
            await init(globals.version)
        )
    } catch (error) {
        Logger.error(error, 'server')
        return null
    }
    
 };

(
    async () => {
        const server = await app()
        if(!server){
            Logger.error('Erro ao tentar iniciar servidor', 'server')
            return
        }
        (server).listen(globals.port, () => {
            Logger.info(`
            * ██████╗░░█████╗░████████╗░█████╗░███╗░░██╗███████╗██╗░░██╗░█████╗░ *
            * ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗████╗░██║██╔════╝╚██╗██╔╝██╔══██╗ *
            * ██║░░██║███████║░░░██║░░░███████║██╔██╗██║█████╗░░░╚███╔╝░███████║ *
            * ██║░░██║██╔══██║░░░██║░░░██╔══██║██║╚████║██╔══╝░░░██╔██╗░██╔══██║ *
            * ██████╔╝██║░░██║░░░██║░░░██║░░██║██║░╚███║███████╗██╔╝╚██╗██║░░██║ *
            * ╚═════╝░╚═╝░░╚═╝░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚══╝╚══════╝╚═╝░░╚═╝╚═╝░░╚═╝ *
            version: ${globals.version}
            port: ${globals.port}
            `)
        })
    }
)()

/***********************************************************************
 *                          Desenvolvido por:                          *
 *                                                                     *
 *                       ┏━━━┓━━┳━━━━┓━━━┓━━┓━┓                        *
 *                       ┃ ┏┓┃ ┃┃┃ ┓┓┃┃━┓┃ ┳┛ ┃                        *
 *                       ┃ ┣┃┃ ┃┃┃ ┻┛┃┃━┓┃ ┻┓ ┃                        *
 *                       ┗━┛┗┛━┻━┛━━━┛━ ┗┗━━┛━┛                        *
 *                                                                     *
 *                       andreifcoelho@gmail.com                       *
 *                       github.com/andrei-coelho                      *
 ***********************************************************************/