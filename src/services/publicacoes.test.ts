import request from 'supertest'

import { FilterQuery } from '../types/FilterQuery'
import init from '../app/init'
import { Request, Response, NextFunction } from 'express'
import { PublishClient } from '../types/Publish'

const dataPub = new Date()

const dataDB:{[key:number]:PublishClient} = {
    1:{
        monitoramento_id:1,
        cliente_id:1,
        mensao_id:1,
        id:1,
        plataforma:1,
        link:'noticias.com/uma-noticia-id-1',
        texto:'texto da noticia',
        temImagem:true,
        temVideo:false,
        dataPublish:dataPub,
        sentimento:1,
        valoracao:0,
        engajamento:{
            curtidas:0,
            compartilhamento:0,
            visualizacoes:0
        },
    },
    2:{
        monitoramento_id:1,
        cliente_id:1,
        mensao_id:1,
        id:2,
        plataforma:2,
        link:'facebook.com/uri-publicacao-id-2',
        texto:'texto da publicacao',
        temImagem:true,
        temVideo:true,
        dataPublish:dataPub,
        sentimento:2,
        valoracao:200,
        engajamento:{
            curtidas:10000,
            compartilhamento:2000,
            visualizacoes:30000
        },
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

jest.mock('../repositories/publish.repo', () => {
    return {
        get:jest.fn(async (filterQ:FilterQuery) => {
            if(filterQ.filters['id']){
                return dataDB[Number(filterQ.filters['id'])] ? [dataDB[Number(filterQ.filters['id'])]] : []
            } 
            return Object.values(dataDB)
        }),
        update:jest.fn(async (pub:PublishClient) => {
            if(dataDB[pub.id]){
                const data = dataDB[pub.id]
                data.valoracao = pub.valoracao
                data.sentimento = pub.sentimento
                data.engajamento = pub.engajamento
                return true
            } 
            return false
        }),
        set:jest.fn(async (pub:PublishClient) => {
            const nId = Object.keys(dataDB).length + 1
            pub.id = nId
            dataDB[nId] = pub
            return pub
        }),
        setMany:jest.fn(async (pubs:PublishClient[]) => {
            var nId = Object.keys(dataDB).length + 1
            for(const pub of pubs){
                pub.id = nId
                dataDB[nId] = pub
                nId++
            }
            return true
        }),
        del:jest.fn(async (client_id:number, id?:number) => {     
            if(!id || !dataDB[id]) return false 
            delete(dataDB[id])
            return true
        })
    }

})


describe("Teste do serviços de publicações", () => {

    test("listar usando read", async () => {

        const app = await init('2.0')
        const res = await request(app).get('/publicacoes/read/1?client_id=1')

        expect(res.statusCode).toBe(200)
        expect(JSON.stringify(res.body.body)).toEqual(JSON.stringify({
            monitoramento_id:1,
            cliente_id:1,
            mensao_id:1,
            id:1,
            plataforma:1,
            link:'noticias.com/uma-noticia-id-1',
            texto:'texto da noticia',
            temImagem:true,
            temVideo:false,
            dataPublish:dataPub,
            sentimento:1,
            valoracao:0,
            engajamento:{
                curtidas:0,
                compartilhamento:0,
                visualizacoes:0
            },
        }))

    })

    test("listar usando o list", async () => {

        const app = await init('2.0')
        const res = await request(app).get('/publicacoes/list?client_id=1')

        expect(res.statusCode).toBe(200)
        expect(res.body.body.length).toBe(2)

    })

    test("inserir um registro", async () => {   

        const pub = {
            id:0,
            monitoramento_id:1,
            client_id:1,
            mensao_id:1,
            plataforma:1,
            link:`link novo a`,
            texto:`texto novo a`,
            temImagem:true,
            temVideo:false,
            dataPublish:new Date(),
            sentimento:1,
            valoracao:0,
            curtidas:0,
            compartilhamento:0,
            visualizacoes:0
        }
        
        const app = await init('2.0')
        const res = await request(app).post('/publicacoes/create?client_id=1').send(pub)

        expect(res.statusCode).toBe(200)

    })



    test("inserir varios registros", async () => {

        const pubs = [
            {
                monitoramento_id:1,
                client_id:1,
                mensao_id:1,
                plataforma:1,
                link:`link novo b`,
                texto:`texto novo b`,
                temImagem:true,
                temVideo:false,
                dataPublish:'2025-09-12',
                sentimento:1,
                valoracao:0,
                curtidas:0,
                compartilhamento:0,
                visualizacoes:0
            },
            {
                monitoramento_id:1,
                client_id:1,
                mensao_id:1,
                plataforma:1,
                link:`link novo c`,
                texto:`texto novo c`,
                temImagem:true,
                temVideo:false,
                dataPublish:'2025-09-12',
                sentimento:1,
                valoracao:0,
                curtidas:0,
                compartilhamento:0,
                visualizacoes:0
            },
            {
                monitoramento_id:1,
                client_id:1,
                mensao_id:1,
                plataforma:1,
                link:`link novo d`,
                texto:`texto novo d`,
                temImagem:true,
                temVideo:false,
                dataPublish:'2025-09-12',
                sentimento:1,
                valoracao:0,
                curtidas:0,
                compartilhamento:0,
                visualizacoes:0
            }
        ]
        
        const app = await init('2.0')
        const res = await request(app).post('/publicacoes/createMany').send(pubs)

        expect(res.statusCode).toBe(200)

    })

    test("alterar um registro", async () => {

        const lastId = Object.keys(dataDB).length

        const pub = dataDB[lastId]

        pub.texto = "Texto completamente alterado"

        const app = await init('2.0')
        const res = await request(app).post('/publicacoes/update').send({
            id:pub.id,
            sentimento:pub.sentimento,
            valoracao:pub.valoracao,
            compartilhamento:pub.engajamento?.compartilhamento,
            visualizacoes:pub.engajamento?.visualizacoes,
            curtidas:pub.engajamento?.curtidas
        })
        
        expect(res.statusCode).toBe(200)

    })

    test("deletar um registro", async () => {

        const lastId = Object.keys(dataDB).length

        const app = await init('2.0')
        const res = await request(app).get(`/publicacoes/delete/1?client_id=1`)

        
        expect(res.statusCode).toBe(200)

    })

})

