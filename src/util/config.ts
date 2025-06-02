import {readFileSync, writeFileSync} from 'fs';
import { join } from 'path'
import * as dotenv from 'dotenv';

dotenv.config()

class Config {
    
    private static config:Config;
    private conf:{ version:string, production:boolean, ssl:boolean, configurado:boolean }
    private conf_str:string;
    private pipeline_user:string;
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
            email?:string,
            senha?:string
        },
        smtp_user:{
            endpoint?:string,
            iam?:string,
            user?:string,
            pass?:string
        },
        key_push:string
    } = {
        token_default:"",
        port:4000,
        database:{
            host:"",
            user:"",
            pass:"",
            port:3306,
            name:""
        },
        master:{},
        smtp_user:{},
        key_push:''
    }
    
    public static path = process.env.PATH || process.cwd();

    private constructor(){

        let res:Buffer   = readFileSync(join(__dirname, `../../config.json`))
        this.conf_str    = res.toString()
        this.conf        = JSON.parse(this.conf_str);
        
        this.data.database.host = process.env.DATABASE_HOST ?? ""
        this.data.database.user = process.env.DATABASE_USER ?? ""
        this.data.database.pass = process.env.DATABASE_PASS ?? ""
        this.data.database.name = process.env.DATABASE_NAME ?? ""

        this.data.database.port = parseInt(process.env.DATABASE_PORT ?? "3306")

        this.data.token_default = process.env.TOKEN_DEFAULT ?? ""
        this.data.port = parseInt(process.env.PORT ?? "4000")

        this.data.master.email  = process.env.MASTER_EMAIL
        this.data.master.senha  = process.env.MASTER_PASSWORD

        this.data.smtp_user.endpoint = process.env.SMTP_USER_ENDPOINT
        this.data.smtp_user.user     = process.env.SMTP_USER_EMAIL
        this.data.smtp_user.pass     = process.env.SMTP_USER_PASSWORD

        this.pipeline_user = process.env.PIPELINE_AIRFLOW_DEFAULT_USER ?? ""

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

    public isSSL(){
        return this.conf.ssl
    }

    public getPipelineUser(){
        return this.pipeline_user
    }

    public setConfigured(){
        this.conf.configurado = true
        writeFileSync(join(__dirname, `../../config.json`), JSON.stringify(this.conf))
    }
}

export default Config