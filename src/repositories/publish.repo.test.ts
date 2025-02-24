import publishRepo from "./publish.repo"
import { FilterQuery } from "../types/FilterQuery";
import clientRepo from "./client.repo";
import monitoramentoRepo from "./monitoramento.repo";
import mensaoRepo from "./mensao.repo";
import { Mensao } from "../types/Mensao";
import { Monitoramento } from "../types/Monitoramento";
import { PublishClient } from "../types/Publish";

const parsedQuery: FilterQuery = {
    filters: {},
    fields:[],
    sort: [],
    ignoredParams: [],
    limit:10,
    offset:0,
    search:'',
    client_id:0,
    desc:true
};

var monitoramento_id = 0
var mensao_id = 0
var client_id = 0
const publishs:PublishClient[] = [] 
var publishAlterados:PublishClient[] = []

describe("Testes de publicações", () => {

    beforeAll( async () => {

        const client = await clientRepo.set({
            id:0,
            nome: "Client Test"
        }) as Client

        parsedQuery.client_id = client.id
        client_id = client.id

        const monit = await monitoramentoRepo.set(client.id, {
            id:0,
            titulo:"Monit 1",
            descricao:"descricao 1"
        }) as Monitoramento

        monitoramento_id = monit.id
        let mensao = await mensaoRepo.set({
            id:0,
            expressao:'uma expressao qualquer',
            hashtags:['hashtag1', 'hashtag2']
        }, client.id, monit.id) as Mensao

        mensao_id = mensao.id    

        for (let i = 0; i < 10; i++) {
            publishs.push({
                monitoramento_id:monitoramento_id,
                cliente_id:client_id,
                mensao_id:mensao_id,
                id:0,
                plataforma:1,
                link:`link ${i}`,
                texto:`texto ${i}`,
                temImagem:true,
                temVideo:false,
                dataPublish:new Date(),
                sentimento:1,
                valoracao:200.50,
                engajamento:{
                    compartilhamento:11,
                    curtidas:12,
                    visualizacoes:13
                }
            })
        }
        
        await publishRepo.setMany(publishs)

    })

    test("Teste ao resgatar publicações", async () => {

        const res = await publishRepo.get(parsedQuery) as PublishClient[]
        publishAlterados = res

        console.log(res);
        
        expect(res.length).toBe(10)
        expect(res[9].link).toBe('link 0')

    })

    test("Fazendo update em registros", async () => {

        const pub = publishAlterados[9]
        pub.valoracao = 1000.00
        pub.engajamento = {
            curtidas: 20000,
            visualizacoes: 50000,
            compartilhamento: 2000
        } 
        pub.sentimento = 3

        const status = await publishRepo.update(pub)
        expect(status).toBe(true)

    })


    test("Inserindo registro sem engajamento", async () => {

        const pub = {
            monitoramento_id:monitoramento_id,
            cliente_id:client_id,
            mensao_id:mensao_id,
            id:0,
            plataforma:1,
            link:`link novo`,
            texto:`texto novo`,
            temImagem:true,
            temVideo:false,
            dataPublish:new Date(),
            sentimento:1,
            valoracao:0
        }

        await publishRepo.set(pub)

        expect(pub.id).not.toBe(0)
        

    })

    test("Inserindo multiplos registros sem engajamento", async () => {

        const pubs = [
            {
                monitoramento_id:monitoramento_id,
                cliente_id:client_id,
                mensao_id:mensao_id,
                id:0,
                plataforma:1,
                link:`link novo`,
                texto:`texto novo`,
                temImagem:true,
                temVideo:false,
                dataPublish:new Date(),
                sentimento:1,
                valoracao:0
            },
            {
                monitoramento_id:monitoramento_id,
                cliente_id:client_id,
                mensao_id:mensao_id,
                id:0,
                plataforma:1,
                link:`link novo`,
                texto:`texto novo`,
                temImagem:true,
                temVideo:false,
                dataPublish:new Date(),
                sentimento:1,
                valoracao:0
            },
            {
                monitoramento_id:monitoramento_id,
                cliente_id:client_id,
                mensao_id:mensao_id,
                id:0,
                plataforma:1,
                link:`link novo`,
                texto:`texto novo`,
                temImagem:true,
                temVideo:false,
                dataPublish:new Date(),
                sentimento:1,
                valoracao:0
            }
        ]

        const status = await publishRepo.setMany(pubs)

        expect(status).toBe(true)
        

    })

    afterAll( async () => {
        
        const query = JSON.parse(JSON.stringify(parsedQuery));

        await publishRepo.del(parsedQuery.client_id)

        await mensaoRepo.del(parsedQuery.client_id, mensao_id)

        await monitoramentoRepo.del(parsedQuery.client_id, monitoramento_id)

        await clientRepo.del(query.client_id)
        
    });

})