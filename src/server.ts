import globals from "./app/globals";
import init from "./app/init";

(
    async () => {
        (await init(globals.version)).listen(globals.port, () => {
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