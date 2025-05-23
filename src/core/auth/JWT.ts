import crypto from 'crypto'
import globals from '../../app/globals'
import * as bcrypt from 'bcrypt';
import { token, token_header } from '../../types/Token';
import { UserDetail, User } from '../../types/User';


export default { 

    generate: function(header:token_header, user:User ){
        
        const u:User = {
            type:user.type,
            vtoken:user.vtoken,
            id:user.id,
            client_id:user.client_id
        } 

        const h = Buffer.from(JSON.stringify(header)).toString('base64')
        const b = Buffer.from(JSON.stringify(u)).toString('base64');
        
        return `${h}.${b}.${crypto.createHmac(header.alg, globals.token_default).update(h+'.'+b).digest('base64')}`
    },

    verify: function(token_str:string):token | false {

        try {

            const parts  = token_str.split('.')
            const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'))
            
            const cripth = Buffer.from(
                crypto.createHmac(header.alg, globals.token_default)
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

    generateHash: function(value:string, alg:string='sha256', salt:string = ''):string{
        return crypto
        .createHash(alg)
        .update(value)
        .update(salt)
        .digest('hex');
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