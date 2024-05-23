
import Config from "../helpers/config"
let config = Config.instance()
let data   = config.getData()
let conf   = config.getConf()
interface global_i {
    port:number,
    version:string,
    token_default:string,
    production:boolean,
    database:{
        host:string,
        user:string,
        pass:string,
        port:number,
        name:string
    }
}

const globals:global_i = {
    port:data.port,
    version:conf.version,
    token_default:data.token_default,
    production:config.isInProduction(),
    database:{
        host:data.database.host,
        user:data.database.user,
        pass:data.database.pass,
        port:data.database.port,
        name:data.database.name
    }
}

export default globals