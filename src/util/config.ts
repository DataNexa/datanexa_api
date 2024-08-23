import {readFileSync, writeFileSync} from 'fs';
import { join } from 'path'

class Config {
    
    private static config:Config;
    private conf:{version:string, production:boolean, configurado:boolean}
    private conf_str:string;
    private data:{
        port:number,
        token_default:string,
        database:{
            host:string,
            user:string,
            pass:string,
            port:number,
            name:string
        },
        master:{
            email:string,
            senha:string
        },
        smtp_user:{
            endpoint:string,
            iam:string,
            user:string,
            pass:string
        }
    }
    
    public static path = process.env.PATH || process.cwd();

    private constructor(){
        let res:Buffer   = readFileSync(join(__dirname, `../../config.json`))
        this.conf_str    = res.toString()
        this.conf        = JSON.parse(this.conf_str);
        let ext:string   = `../../config.${(this.conf.production?"prod":"dev")}.json`
        let dat:Buffer   = readFileSync(join(__dirname, ext))
        this.data        = JSON.parse(dat.toString());
        if(this.conf.configurado){
            this.data.master.email = ""
            this.data.master.senha = ""
        }
    }

    public static instance(){
        if(Config.config == null){
            Config.config = new Config()
        }
        return Config.config;
    }

    public getConf(){
        return this.conf
    }

    public getData(){
        return this.data
    }

    public isInProduction(){
        return this.conf.production
    }

    public setConfigured(){
        this.conf.configurado = true
        writeFileSync(join(__dirname, `../../config.json`), JSON.stringify(this.conf))
    }
}

export default Config