import request from 'supertest'
import { FilterQuery } from '../types/FilterQuery'
import { Monitoramento } from '../types/Monitoramento'
import init from '../app/init'
import { Request, Response, NextFunction } from 'express'

const dataDB:{[key:number]:Monitoramento} = {
    1:{
        id:1,
        titulo:'Titulo 1',
        descricao:'descricao 1'
    },
    2:{
        id:2,
        titulo:'Titulo 2',
        descricao:'descricao 2'
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

jest.mock('../repositories/monitoramento.repo', () => {
    return {
        get:jest.fn(async (filterQ:FilterQuery) => {
            if(filterQ.filters['id']){
                return dataDB[Number(filterQ.filters['id'])] ? [dataDB[Number(filterQ.filters['id'])]] : []
            } 
            return Object.values(dataDB)
        }),
        update:jest.fn(async (client_id:number, monitoramento:Monitoramento) => {
            if(dataDB[monitoramento.id]){
                dataDB[monitoramento.id] = monitoramento
                return true
            } 
            return false
        }),
        set:jest.fn(async (client_id:number, monitoramento:Monitoramento) => {
            const nId = Object.keys(dataDB).length + 1
            monitoramento.id = nId
            dataDB[nId] = monitoramento
            return monitoramento
        }),
        del:jest.fn(async (client_id:number, id:number) => {
            if(!dataDB[id]) return false 
            delete(dataDB[id])
            return true
        })
    }
})


describe("Testes do serviço de monitoramento", () => {

    test("Testando a função read do serviço", async () => {

        const app = await init("2.0")
        const res = await request(app).get('/monitoramentos/read/1?client_id=1')

        expect(res.statusCode).toBe(200)
        expect(res.body.body).toEqual({
            id:1,
            titulo:'Titulo 1',
            descricao:'descricao 1'
        })

    })

    test("Testando a função read do serviço com erro 404", async () => {

        const app = await init("2.0")
        const res = await request(app).get('/monitoramentos/read/100?client_id=1')

        expect(res.statusCode).toBe(404)

    })

    test("Testando a função list do serviço", async () => {

        const app = await init("2.0")
        const res = await request(app).get('/monitoramentos/list?client_id=1')

        expect(res.statusCode).toBe(200)
        expect(res.body.body.length).toBe(2)

    })

    test("Testando a função update do serviço", async () => {

        const app = await init("2.0")
        const res = await request(app).post('/monitoramentos/update?client_id=1').send({
            titulo:'Titulo 1 A',
            descricao:'descricao 1 A',
            id:1
        })

        expect(res.statusCode).toBe(200)
        expect(dataDB[1].titulo).toBe('Titulo 1 A')

    })

    test("Testando a função create do serviço", async () => {

        const monit:Monitoramento = {
            titulo:'Titulo 3',
            descricao:'descricao 3',
            id:0 // id é injetado pela função
        }

        const app = await init("2.0")
        const res = await request(app).post('/monitoramentos/create?client_id=1').send(monit)

        expect(res.statusCode).toBe(200)
        expect(res.body.body.id).toBe(3)

    })

    test("Testando a função delete do serviço", async () => {

        const app = await init("2.0")
        const res = await request(app).get('/monitoramentos/delete/1?client_id=1')

        expect(res.statusCode).toBe(200)
        expect(Object.keys(dataDB).length).toBe(2)

    })

    test("Testando a função delete do serviço com erro", async () => {

        const app = await init("2.0")
        const res = await request(app).get('/monitoramentos/delete/a?client_id=1')

        expect(res.statusCode).toBe(400)

    })


})


