import JWT from "../core/auth/JWT"


export default {

    encriptPass: async (pass:string):Promise<string> => {
        return await JWT.cryptPassword(pass)
    },

    passIsStronger: (pass:string):boolean => {
        const expressao = new RegExp("^(?=.*[A-Za-z])(?=.*\\d).{8,}$")
        return expressao.test(pass)
    },

    comparePass: async (pass:string, tokenpass:string):Promise<boolean> => {
        return await JWT.comparePassword(pass, tokenpass)
    }

}