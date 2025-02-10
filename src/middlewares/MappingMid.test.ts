import JWT from "../core/auth/JWT"
import { User, UserDetail } from "../types/User"
import init from "../app/init"
import request from 'supertest'


const usersDataBase:UserDetail[] = [
    {
        type:1,
        id:1,
        vtoken:1,
        email:'andrei@email.com',
        nome:'andrei',
        client_id:1
    },
    {
        type:2,
        id:2,
        vtoken:2,
        email:'gustavo@email.com',
        nome:'gustavo',
        client_id:0
    },
    {
        type:1,
        id:3,
        vtoken:1,
        email:'luiz@email.com',
        nome:'luiz',
        client_id:1
    }
]


jest.mock("../core/auth/UserFactory", () => {
   
    const AnonUser = {
        type:0,
        id:0,
        vtoken:0
    }

    return {
        factory: jest.fn( async (token_str:string) => {
            const userTest = JWT.verify(token_str)
            for(const u of usersDataBase){
                if(userTest && userTest.data.id == u.id)
                return {
                    token:token_str,
                    user: u
                }
            }
            return {
                token: '',
                user: AnonUser
            }
            
        }),
        AnonUser: AnonUser,
        generateUserToken: jest.fn(async (user:User, expire_horas:number = 10) => {
            return JWT.generate(
                {
                    alg:'sha256', 
                    type:user.type, 
                    expire_in: (new Date()).getTime() + (3600000 * expire_horas)
                },
                user
            )
        })
    }
})


describe("teste do middleware authorized que verifica se o usuário tem permissão para acessar o serviço", () => {


    test("Testando se o usuário é do tipo client", async () => {

        const token_client = JWT.generate(
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

        const token_admin = JWT.generate(
            {
                alg:'sha256', 
                type:2, 
                expire_in: (new Date()).getTime() + (3600000 * 10) // 10 horas de expiração
            },
            {
                id:2,
                vtoken:2,
                type:2
            }
        )
 
        const app = await init('2.0')
        const request1 = await request(app).get('/tests/mustHaveClientId?client_id=1').set('Authorization', `Bearer ${token_client}`)

        expect(request1.statusCode).toBe(200)

    })

})