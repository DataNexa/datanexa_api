import globals from "./app/globals";
import init from "./app/init";
import fs from 'fs'
import path from 'path'
import https from 'https'
import Config from "./util/config";

const certPath = path.resolve(__dirname, '..')

const options = {
    key: fs.readFileSync(path.join(certPath, 'localhost-key.pem')),
    cert: fs.readFileSync(path.join(certPath, 'localhost.pem'))
}

const app = async () => { 
    return await (
        !Config.instance().isInProduction() ? 
        https.createServer(options, await init(globals.version)) :
        await init(globals.version)
    )
 };

(
    async () => {
        (await app()).listen(globals.port, () => {
            console.log(`
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