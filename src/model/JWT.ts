import crypto from 'crypto'
import globals from '../config/globals'

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

    newToken: function(token_account_hash:string, token_account_device:string){
        const now = new Date().toString();
        return crypto.createHmac('sha256', now+token_account_hash+token_account_device)
    }   

}