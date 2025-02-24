import { Request, Response, NextFunction } from 'express'
import request from 'supertest'
import { FilterQuery } from '../types/FilterQuery'
import { Mensao } from '../types/Mensao'
import init from '../app/init'

const dbmensoes:{[key:number]:Mensao} = {
    1:{
        id:1,
        expressao:'expressao1',
        hashtags:['hash1a', 'hash1b']
    },
    2:{
        id:2,
        expressao:'expressao2',
        hashtags:['hash2a', 'hash2b', 'hash2c']
    },
    3:{
        id:3,
        expressao:'expressao3',
        hashtags:['hash3a', 'hash3b']
    }
}

var lastid = 3



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

jest.mock('../repositories/mensao.repo', () => {
    return {

        get: jest.fn( async (filter:FilterQuery) => {
            if(filter.client_id == 100){
                return []
            }
            if(filter.filters['id']){
                const id = Number(filter.filters['id'])
                return dbmensoes[id] ? [dbmensoes[id]] : []
            }
            return Object.values(dbmensoes)
        }),

        set: jest.fn( async (mensao:Mensao, client_id:number, monitoramento_id:number) => {
            const nid = lastid + 1
            mensao.id = nid
            dbmensoes[nid] = mensao
            lastid = nid
            return mensao
        }),

        update: jest.fn( async (mensao:Mensao, client_id:number) => {
            if(!dbmensoes[mensao.id]){
                return false
            }
            dbmensoes[mensao.id] = mensao
            return true
        }),

        del: jest.fn( async (client_id:number, id:number) => {
            if(dbmensoes[id]){
                delete dbmensoes[id]
                return true
            }
            return false
        })

    }
})



describe("Testes no serviço de mensões", () => {

    test("testes usando o read", async() => {

        const app = await init('2.0')

        const req = await request(app).get('/mensoes/read/1?client_id=1')

        expect(req.statusCode).toBe(200)
        expect(req.body.body).toEqual(dbmensoes[1])

    })

    test("testes usando o read sem o parametro id", async() => {

        const app = await init('2.0')

        const req = await request(app).get('/mensoes/read/a?client_id=1')

        expect(req.statusCode).toBe(400)

    })

    test("testes usando o read com o parametro id de um registro inexistente", async() => {

        const app = await init('2.0')

        const req = await request(app).get('/mensoes/read/100?client_id=1')

        expect(req.statusCode).toBe(404)

    })

    test("testes listando tudo", async () => {

        const app = await init('2.0')

        const req = await request(app).get('/mensoes/list?client_id=1')

        expect(req.statusCode).toBe(200)
        expect(req.body.body.length).toBe(3)
        
    })

    test("tentando listar com cliente que não existe", async () => {

        const app = await init('2.0')

        const req = await request(app).get('/mensoes/list?client_id=100')

        expect(req.statusCode).toBe(200)
        expect(req.body.body).toEqual([])
        
    })

    test("testes com create", async () => {

        const app = await init('2.0')
        const req = await request(app).post('/mensoes/create').send({
            monitoramento_id:1,
            expressao:'expressao 4',
            hashtags:['hashtag4a', 'hashtag4b', 'hashtag4c'],
            client_id:1
        })

        expect(req.statusCode).toBe(200)
        expect(Object.values(dbmensoes).length).toBe(4)

    })
    
    test("testes com update", async () => {

        const app = await init('2.0')
        const old = JSON.parse(JSON.stringify(dbmensoes[4])) as Mensao
        const req = await request(app).post('/mensoes/update').send({
            id:4,
            expressao: 'expressao4-alterada',
            monitoramento_id:1,
            client_id:1
        })

        expect(req.statusCode).toBe(200)

        expect(dbmensoes[4].expressao).not.toBe(old.expressao)
        expect(dbmensoes[4].expressao).toBe('expressao4-alterada')
        
    })

    test("testes com delete", async () => {

        const app = await init('2.0')
        const req = await request(app).get('/mensoes/delete/4?client_id=1')

        expect(req.statusCode).toBe(200)
        expect(Object.values(dbmensoes).length).toBe(3)

    })

})
