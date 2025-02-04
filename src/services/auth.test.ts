
import request from 'supertest'
import auth from './auth'
import { UserDetail, User } from '../types/User'
import JWT from '../core/auth/JWT'
import init from '../app/init'

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
        type:1,
        id:2,
        vtoken:1,
        email:'gustavo@email.com',
        nome:'gustavo',
        client_id:1
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

jest.mock("../repositories/user.repo", () => {
    return {
        getUserByEmailAndPass:jest.fn(async (email:string, senha:string, device:string, ip:string) => {
            for(const u of usersDataBase){
                if(u.email == email){ 
                    return {
                        user:u,
                        hash:`hash${u.id}`
                    }
                }
            }
            return undefined
        }),
        getUserByEmail:jest.fn(async (email:string) => {
            for(const u of usersDataBase){
                if(u.email == email){
                    return u
                }
            }
            return undefined
        }),
        getUserByHash:jest.fn(async (hash:string) => {
            for(const u of usersDataBase){
                if(`hash${u.id}` == hash){
                    return u
                }
            }
            return undefined
        }),
        saveUserAdmin:jest.fn(async (nome:string, email:string, senha:string) => {
            if(email == 'email@admin.com'){
                return {
                    type:2,
                    id:3,
                    vtoken:0,
                    email:'email@admin.com',
                    nome:'andrei',
                    client_id:0
                }
            }
            return false
        }),

        saveUserClient: jest.fn(async (client_id:number, nome:string, email:string, senha:string ) => {
            if(client_id != 1){
                return false
            }
            return {
                id:3,
                vtoken:0,
                client_id:client_id,
                nome:nome,
                email:email,
                type:1
            }
        }),

        deleteUser: jest.fn(async (user_id:number ) => {
            for(const u of usersDataBase){
                if(u.id == user_id){
                    return true
                }
            }
            return false
        }),

        getUserById: jest.fn(async (user_id:number ) => {
            for(const u of usersDataBase){
                if(u.id == user_id){
                    return u
                }
            }
            return undefined
        }),

        saveCodeUser: jest.fn(async (code:string, user_id:number) => {
            for(const u of usersDataBase){
                if(u.id == user_id){
                    return true
                }
            }
            return false
        }),

        consumeCode: jest.fn(async (code:string, user_id:number) => {
            for(const u of usersDataBase){
                if(u.id == user_id){
                    return true
                }
            }
            return false
        }),

        updatePass: jest.fn(async (user_id:number, newpass:string) => {
            for(const u of usersDataBase){
                if(u.id == user_id){
                    return true
                }
            }
            return false
        }),

    }
})

jest.mock("../core/auth/UserFactory", () => {

    const AnonUser = {
        type:0,
        id:0,
        vtoken:0
    }

    const usersInCache:UserDetail[] = [
        {
            type:1,
            id:1,
            vtoken:1,
            email:'andrei@email.com',
            nome:'andrei',
            client_id:1
        },
        {
            type:1,
            id:2,
            vtoken:1,
            email:'gustavo@email.com',
            nome:'gustavo',
            client_id:1
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

    return {
        factory:jest.fn(async (token:string) => {
            const id = parseInt(token)
            for(const u of usersInCache){
                if(u.id == id){
                    return {
                        token:token,
                        user:u
                    }
                }
            }
            return {
                token:'',
                user:AnonUser
            }
        }), 
        AnonUser:AnonUser, 
        generateUserToken: jest.fn(async (user:User, expire_horas:number = 10) => {
            return JWT.generate(
                {
                    alg:'sha256', 
                    type:1, 
                    expire_in: (new Date()).getTime() + (3600000 * expire_horas)
                },
                user
            )
        })
    }

})

describe("Teste do serviço auth.js", () => {
    
    test('Teste com a rota de login com email que não existe', async () => {

        const app = await init("2.0");

        const res = await request(app)
        .post('/auth/login') 
        .send({
            email: 'email@quenaoexiste.com',
            senha: 'senhaQualquer123'
        })
        expect(res.statusCode).toBe(404); 
        //expect(res.body).toHaveProperty('token'); 

    }),

    test('Teste com a rota de login com email que existe', async () => {

        const app = await init("2.0");

        const res = await request(app)
        .post('/auth/login') 
        .send({
            email: 'andrei@email.com',
            senha: 'senhaQualquer@123'
        })
        
        expect(res.statusCode).toBe(200); 
        //expect(res.body).toHaveProperty('token'); 

    })


})