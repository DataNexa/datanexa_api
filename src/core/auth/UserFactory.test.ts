
import UserFactory from "./UserFactory";
import JWT from "./JWT";
import { User, UserDetail } from "../../types/User";

const mockcacheuser:Record<string, User|UserDetail> = {

    "user:1":{
        vtoken:2,
        id:1,
        type:1
    },

    "user:2":{
        vtoken:2,
        id:2,
        type:1,
        nome:"Andrei",
        email:"andrei@email.com",
        client_id:1
    }

} 


const mockdatabaseuser:Record<string, User|UserDetail> = {
    "user:3":{
        vtoken:2,
        id:3,
        type:2
    }
}


jest.mock('../cache/userCache', () => {

    return {
        getDataUser:jest.fn((id:number) => {
            if(!Object.keys(mockcacheuser).includes("user:"+id))
                return false
            return mockcacheuser["user:"+id]
        }),

        saveDataUser:jest.fn((user:User) => {
            return true
        })

    }

})

jest.mock('../database/userDB', () => {

    return {
        getUser:jest.fn((id:number) => {
            if(!Object.keys(mockdatabaseuser).includes("user:"+id))
                return false
            return mockdatabaseuser["user:"+id]
        })
    }

})



describe("UserFacory testes", () => {

    test("Retorna usuário anonimo quando não há token", async () => {
        
        const user = (await UserFactory.factory()).user
        expect(user.id).toBe(0)
        expect(user.type).toBe(0)
        expect(user.vtoken).toBe(0) 

    })

    test("Retorna usuário anonimo quanto há alguma anomalia no token", async () => {

        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 10) // 10 horas de expiração
            },
            {
                id:1,
                vtoken:0,
                type:1
            },
        )

        const user = (await UserFactory.factory(token.substring(1))).user // token alterado

        expect(user.id).toBe(0)
        expect(user.type).toBe(0)
        expect(user.vtoken).toBe(0) 
        
    })


    test("Retorna usuário anonimo quando o token for expirado", async () => {

        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() - (3600000 * 1) // expirou há uma hora atrás
            },
            {
                id:1,
                vtoken:0,
                type:1
            },
        )

        const user = (await UserFactory.factory(token)).user

        expect(user.id).toBe(0)
        expect(user.type).toBe(0)
        expect(user.vtoken).toBe(0) 

    })


    test("Retorna usuário anonimo quando o vtoken está diferente no registro do usuário em cache", async () => {

        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 2) // expira em 2 horas 
            },
            {
                id:1,
                vtoken:1, // o vtoken no cache é 2
                type:1
            },
        )

        const user = (await UserFactory.factory(token)).user

        expect(user.id).toBe(0)
        expect(user.type).toBe(0)
        expect(user.vtoken).toBe(0) 

    })
    

    test("Retorna usuário anonimo quando o vtoken está diferente no registro do usuário no banco", async () => {

        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 2) // expira em 2 horas 
            },
            {
                id:3,
                vtoken:1, // o vtoken no banco é 2
                type:1
            },
        )

        const user = (await UserFactory.factory(token)).user

        expect(user.id).toBe(0)
        expect(user.type).toBe(0)
        expect(user.vtoken).toBe(0) 

    })

    test("Recupera o usuário e mantém o token", async () => {
        
        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 2) // expira em  2 horas
            },
            {
                id:3,
                vtoken:2,
                type:1
            },
        )

        const data = await UserFactory.factory(token)

        expect(data.token).toBe("")
        expect(data.user.id).toBe(3)

    })

    test("Recupera usuário e Gera um novo token antes de expirar", async () => {
        
       const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 0.5) // expira em 30 minutos 
            },
            {
                id:3,
                vtoken:2,
                type:1
            },
        )

        const data = await UserFactory.factory(token)

        expect(data.token).not.toBe(token)
        expect(data.user.id).toBe(3)

    })


    test("Recupera um usuário detalhado", async () => {

        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 2) // expira em 2 horas
            },
            {
                id:2,
                vtoken:2,
                type:1
            },
        )

        const user = await UserFactory.factory(token)
        expect(user.user).toHaveProperty("nome")
        expect(user.user).toHaveProperty("email")
        expect(user.user).toHaveProperty("client_id")        

        const userDet = user.user as UserDetail
        expect(userDet.client_id).toBe(1)

    })

})