import { Request, Response, NextFunction } from 'express'
import request from 'supertest'
import { FilterQuery } from '../types/FilterQuery'
import init from '../app/init'
import { Hashtag } from '../types/Hashtag'

const dbhashtags:{[key:number]:Hashtag} = {
    1:{
        id:1,
        valor:'hash1'
    },
    2:{
        id:2,
        valor:'hash2'
    },
    3:{
        id:3,
        valor:'hash3'
    },
    4:{
        id:4,
        valor:'hash4'
    }
}


jest.mock('../middlewares/AuthorizeMid.ts', () => {
    return {
        onlyClientUser:jest.fn((req:Request, res:Response, next:NextFunction) => {
            next()
        }),
        onlyAdminUser:jest.fn((req:Request, res:Response, next:NextFunction) => {
            next()
        }),
        onlyValidUser:jest.fn((req:Request, res:Response, next:NextFunction) => {
            next()
        }),
        onlyBotUser:jest.fn((req:Request, res:Response, next:NextFunction) => {
            next()
        }),
        isNotAnon:jest.fn((req:Request, res:Response, next:NextFunction) => {
            next()
        })
    }
})

var lastid = 4

jest.mock('../repositories/hashtags.repo', () => {

    return {

        get: jest.fn( async (filter:FilterQuery) => {
            if(filter.client_id == 100){
                return []
            }
            return Object.values(dbhashtags)
        }),

        set: jest.fn( async (valor:string, mensao_id:number, client_id:number) => {
            const nid = lastid + 1
            const hash:Hashtag = {
                id:nid,
                valor:valor
            }
            dbhashtags[nid] = hash
            return hash
        }),


        del: jest.fn( async (client_id:number, id:number) => {
            if(dbhashtags[id]){
                delete dbhashtags[id]
                return true
            }
            return false
        })

    }
})



describe("Teste do serviço de hashtags", () => {

    test("testando listagens", async () => {

        const app = await init('2.0')
        const resp = await request(app).get('/hashtags/list/1?client_id=1')

        expect(resp.status).toBe(200)
        expect(resp.body.body).toEqual(Object.values(dbhashtags))

    })

    test("criando um hashtag", async () => {

        const app = await init('2.0')
        const resp = await request(app).post('/hashtags/create').send({
            client_id: 1,
            mensao_id: 1,
            valor: 'hash5'
        })

        expect(resp.statusCode).toBe(200)
        expect(resp.body.body.id).toBe(5)

    })

    test("deletando um hashtag", async () => {

        const app = await init('2.0')
        const resp = await request(app).get('/hashtags/delete/1/5?client_id=1')

        expect(resp.statusCode).toBe(200)
        expect(Object.values(dbhashtags).length).toBe(4)

    })

})