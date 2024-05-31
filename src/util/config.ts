import {readFileSync} from 'fs';
import { join } from 'path'

class Config {
    
    private static config:Config;
    private conf:{version:string, production:boolean}
    private data:{
        port:number,
        token_default:string,
        database:{
            host:string,
            user:string,
            pass:string,
            port:number,
            name:string
        }
    }
    
    public static path = process.env.PATH || process.cwd();

    private constructor(){
        let res:Buffer   = readFileSync(join(__dirname, `../../config.json`))
        this.conf        = JSON.parse(res.toString());
        let ext:string   = `../../config.${(this.conf.production?"prod":"dev")}.json`
        let dat:Buffer   = readFileSync(join(__dirname, ext))
        this.data        = JSON.parse(dat.toString());
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
}

export default Config