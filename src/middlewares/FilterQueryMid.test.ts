import request from 'supertest'
import init from '../app/init'

import { Request, Response, NextFunction } from 'express'
import UserFactory from '../core/auth/UserFactory'

jest.mock('./UserFactoryMid', () => {
    return (req:Request, res:Response, next:NextFunction) => {
        res.user = UserFactory.AnonUser
        req.body.token = ''
        next()
    }
})

describe("Teste do middleware FilterQuery", () => {

    test("Testando rota com filter: /tests/default?filter(a)=a&filter(b)=b", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?filter(nome)=andrei&filter(sobrenome)=coelho')

        expect(requestO.body.body.parsedQuery.filters).toEqual({
            nome:"andrei",
            sobrenome:"coelho"
        })

    })

    test("Testando rota com limit: /tests/default?limit=10", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?limit=10')

        expect(requestO.body.body.parsedQuery.limit).toBe(10)

    })

    test("Testando rota com limit > 50: /tests/default?limit=100000000", async () => {
        
        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?limit=100000000')

        expect(typeof requestO.body.body.parsedQuery.limit).toBe('number');
        expect(requestO.body.body.parsedQuery.limit).toBe(50)

    })

    test("Testando rota com limit == 0: /tests/default?limit=", async () => {
        
        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?limit=')

        expect(typeof requestO.body.body.parsedQuery.limit).toBe('number');
        expect(requestO.body.body.parsedQuery.limit).toBe(10)

    })

    test("Testando rota com offset: /tests/default?offset=", async () => {
        
        const app = await init('2.0')
        const request1 = await request(app)
        .get('/tests/default?offset=')

        expect(typeof request1.body.body.parsedQuery.offset).toBe('number');
        expect(request1.body.body.parsedQuery.offset).toBe(0)

        const request2 = await request(app)
        .get('/tests/default?offset=100')

        expect(request2.body.body.parsedQuery.offset).toBe(100)

    })

    test("Testando rota com offset > 50: /tests/defaultt?offset=100000000", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?offset=100000000')

        expect(typeof requestO.body.body.parsedQuery.offset).toBe('number');
        expect(requestO.body.body.parsedQuery.offset).toBe(100000000)

    })

    
    test("Testando rota com search: /tests/default?search=+palavra+composta+obrigatoria -esta+nao pode+ter+esta", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?search=%2Bpalavra%2Bcomposta%2Bobrigatoria -esta%2Bnao pode%2Bter%2Besta')

        expect(requestO.body.body.parsedQuery.search).toHaveProperty('obrigatorias')
        expect(requestO.body.body.parsedQuery.search).toHaveProperty('podeTer')
        expect(requestO.body.body.parsedQuery.search).toHaveProperty('naoPodemTer')

        expect(requestO.body.body.parsedQuery.search).toEqual(
            {
                obrigatorias: [ 'palavra composta obrigatoria' ],
                podeTer: [ 'pode ter esta' ],
                naoPodemTer: [ 'esta nao' ]
            }
        )

    })


    test("Testando rota com sort: /tests/default?sort=categoria1,categoria2", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?sort=categoria1,categoria2')

        expect(requestO.body.body.parsedQuery.sort)
        .toEqual(['categoria1', 'categoria2'])

    })

    test("Testando rota com parâmetros ignorados: /tests/default?ignoreme=a,b", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/tests/default?ignoreme=a,b')

        expect(requestO.body.body.parsedQuery.ignoredParams)
        .toEqual(['ignoreme'])

    })

    test("Testando rota com client_id: /tests/default?client_id=???", async () => {

        const app = await init('2.0')
        
        const request1 = await request(app)
        .get('/tests/default?client_id=a,b')

        const request2 = await request(app)
        .get('/tests/default?client_id=1')

        const request3 = await request(app)
        .get('/tests/default?client_id=1o')

        const request4 = await request(app)
        .get('/tests/default?client_id=12')

        expect(request1.body.body.parsedQuery.client_id)
        .toEqual(0)

        expect(request2.body.body.parsedQuery.client_id)
        .toEqual(1)

        expect(request3.body.body.parsedQuery.client_id)
        .toEqual(1)

        expect(request4.body.body.parsedQuery.client_id)
        .toEqual(12)

    })


    test("Testando rota com parâmetro de fields: /tests/default?fields=a,b", async () => {

        const app = await init('2.0')

        const request1 = await request(app)
        .get('/tests/default?fields=a,b')

        const request2 = await request(app)
        .get('/tests/default?fields=a ,   b')

        const request3 = await request(app)
        .get('/tests/default?fields=palavra composta , palavra2, palavra3')

        expect(request1.body.body.parsedQuery.fields)
        .toEqual(['a','b'])

        expect(request2.body.body.parsedQuery.fields)
        .toEqual(['a','b'])

        expect(request3.body.body.parsedQuery.fields)
        .toEqual(['palavra composta','palavra2', 'palavra3'])

    })


})
