import request from 'supertest'
import init from '../app/init'

import { Request, Response, NextFunction } from 'express'
import UserFactory from '../core/auth/UserFactory'

jest.mock('./AuthMid', () => {
    return (req:Request, res:Response, next:NextFunction) => {
        res.user = UserFactory.AnonUser
        req.body.token = ''
        next()
    }
})

describe("Teste do middleware FilterQuery", () => {

    test("Testando rota com filter: /test?filter(a)=a&filter(b)=b", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?filter(nome)=andrei&filter(sobrenome)=coelho')

        expect(requestO.body.body.parsedQuery.filters).toEqual({
            nome:"andrei",
            sobrenome:"coelho"
        })

    })

    test("Testando rota com limit: /test?limit=10", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?limit=10')

        expect(requestO.body.body.parsedQuery.limit).toBe(10)

    })

    test("Testando rota com limit > 50: /test?limit=100000000", async () => {
        
        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?limit=100000000')

        expect(typeof requestO.body.body.parsedQuery.limit).toBe('number');
        expect(requestO.body.body.parsedQuery.limit).toBe(50)

    })

    test("Testando rota com limit == 0: /test?limit=", async () => {
        
        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?limit=')

        expect(typeof requestO.body.body.parsedQuery.limit).toBe('number');
        expect(requestO.body.body.parsedQuery.limit).toBe(10)

    })

    test("Testando rota com offset: /test?offset=", async () => {
        
        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?offset=')

        expect(typeof requestO.body.body.parsedQuery.offset).toBe('number');
        expect(requestO.body.body.parsedQuery.offset).toBe(0)

    })

    test("Testando rota com offset > 50: /test?offset=100000000", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?offset=100000000')

        expect(typeof requestO.body.body.parsedQuery.offset).toBe('number');
        expect(requestO.body.body.parsedQuery.offset).toBe(100000000)

    })

    
    test("Testando rota com search: test?search=+palavra+composta+obrigatoria -esta+nao pode+ter+esta", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?search=%2Bpalavra%2Bcomposta%2Bobrigatoria -esta%2Bnao pode%2Bter%2Besta')

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


    test("Testando rota com sort: /test?sort=categoria1,categoria2", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?sort=categoria1,categoria2')

        expect(requestO.body.body.parsedQuery.sort)
        .toEqual(['categoria1', 'categoria2'])

    })

    test("Testando rota com parâmetros ignorados: /test?ignoreme=a,b", async () => {

        const app = await init('2.0')
        const requestO = await request(app)
        .get('/test?ignoreme=a,b')

        expect(requestO.body.body.parsedQuery.ignoredParams)
        .toEqual(['ignoreme'])

    })



})
