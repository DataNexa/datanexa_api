import crypto from 'crypto'
import globals from '../config/globals'
import * as bcrypt from 'bcrypt';

interface header {
    alg:string,
    type:number,
    expire_in:number
}

export default {

    generate: function(header:header, body:Object, hash_salt:string = "", vtoken:number = 0){
        
        const h = Buffer.from(JSON.stringify(header)).toString('base64')
        const b = Buffer.from(JSON.stringify(body)).toString('base64');

        return `${h}.${b}.${crypto.createHmac(header.alg, globals.token_default+hash_salt+vtoken.toString()).update(h+'.'+b).digest('base64')}`
    },

    verify: function(hash:string, hash_salt:string = "", vtoken:number = 0){

        try {

            const parts  = hash.split('.')
            const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'))
            
            const cripth = Buffer.from(
                crypto.createHmac(header.alg, globals.token_default+hash_salt+vtoken.toString())
                .update(parts[0]+'.'+parts[1])
                .digest('base64'), 'base64'
            ).toString('ascii')
    
            return (
                cripth
                == Buffer.from(parts[2], 'base64').toString('ascii')
                ?  {
                    header:header,
                    data:JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
                }
                :  false 
            )
    
        } catch(e){
            return false
        }

    },

    newToken: function(value:string, alg:string='sha256', salt:string = ''):string{
        const hash = crypto.createHash(alg)
        hash.update(value+salt)
        return hash.digest('hex')
    },

    cryptPassword: (password: string):Promise<string> =>{
        return bcrypt.genSalt(10)
        .then((salt => bcrypt.hash(password, salt)))
        .then(hash => hash)
    },  
    
    comparePassword: (password: string, hashPassword: string):Promise<boolean> => {
        return bcrypt.compare(password, hashPassword)
        .then(resp => resp)
    },

    generateRandomCode: (length: number = 6): string => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        
        return result;
    }
        

}