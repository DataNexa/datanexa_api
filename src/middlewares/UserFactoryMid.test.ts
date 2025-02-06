import init from "../app/init"
import request from "supertest"
import JWT from "../core/auth/JWT"

jest.mock("../core/auth/UserFactory", () => {
    const AnonUser = {
        type:0,
        id:0,
        vtoken:0
    }

    return {
        factory: jest.fn( async () => {
            return {
                token:"",
                user: {
                    type:1,
                    vtoken:1,
                    id:1
                }
            }
        }),
        AnonUser: AnonUser
    }
})


describe("Teste do Middleware de Autenticação gerando um User", () => {

    test("Gerando usuário anônimo quando Bearer Token não é enviado", async () => {

        const app = await init('2.0')
        const requestO = await request(app).get('/tests/default')

        expect(requestO.body.user).toEqual({
            vtoken:0,
            id:0,
            type:0
        })

    })

    test("Gerando um usuário anônimo enviando o authorization de forma errada", async () => {


        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 10) // 10 horas de expiração
            },
            {
                id:1,
                vtoken:1,
                type:1
            }
        )

        const app = await init('2.0')
        const requestO = await request(app).get('/tests/default').set('Authorization', `${token}`)
        
        expect(requestO.body.user).toEqual({
            type:0,
            id:0,
            vtoken:0
        })

    })

    test("Gerando um usuário final", async () => {

        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 24) // 24 horas de expiração
            },
            {
                id:1,
                vtoken:1,
                type:1
            }
        )

        const app = await init('2.0')
        const requestO = await request(app).get('/tests/default').set('Authorization', `Bearer ${token}`)
        
        expect(requestO.body.user).toEqual({
            type:1,
            id:1,
            vtoken:1
        })

        expect(requestO.body.body.token).toBe("")

    })

})