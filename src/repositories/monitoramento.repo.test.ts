import monitoramentoRepo from "./monitoramento.repo";
import { FilterQuery } from "../types/FilterQuery";
import clientRepo from "./client.repo";
import { MonitoramentoFull, Monitoramento } from "../types/Monitoramento";
import { Client, ClientConfig } from "../types/Client";
import adminConfigsRepo from "./adminConfigs.repo";
import { InstagramApp } from "../types/InstagramApp";
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

const configAdmin = {
    instagram_app_id: 0,
}

describe("Testes do repositorio de Monitoramentos", () => {


    beforeAll( async () => {

        const client = await clientRepo.set({
            id:0,
            nome: "Client Test"
        }) as Client

        parsedQuery.client_id = client.id

        const instagram_app = await adminConfigsRepo.addIntagramApp({
            id:0,
            app_id: "1234567890",
            app_secret: "app_secret_test",
            redirect_uri: "https://example.com/redirect",
            access_token: "access_token_test"
        }) as InstagramApp

        configAdmin.instagram_app_id = instagram_app.id

        await clientRepo.addClientConfig(client.id, { 
            id:0,
            client_id:client.id,
            max_monitoramentos_ativos:1,
            instagram_app_id:0
        }) as ClientConfig

        const monitoramento1 = await monitoramentoRepo.set(client.id, {
            id:0,
            titulo:"Monit 1",
            descricao:"descricao 1"
        }) as Monitoramento

        await monitoramentoRepo.addConfig(client.id, monitoramento1.id, {

            instagram_search_config: { 
                id:0,
                hashtags: [
                    { hashtag_instagram_id: 1, hashtag_value: "testMonit1" },
                    { hashtag_instagram_id: 2, hashtag_value: "example1" }
                ]
            },
            twitter_search_config: {
                id:0,
                hashtags: ["hashtag1", "hashtag2"],
                dork: "dork twitter example monitoramento1",
                fromUsers: ["user1", "user2"],
                notFromUsers: ["user3"],
                mentions: ["mention1"],
                palavrasExatas: ["exact word"],
                palavrasQuePodeTer: ["optional word"],
                excluirPalavras: ["exclude word"],
                lang: "pt"
            },
            google_search_config: {
                id:0,
                dork: "google dork example monitoramento1",
                sites: ["example.com", "test.com"],
                notInSites: ["exclude.com"],
                inUrl: "inurl example",
                inTitle: "intitle example",
                inText: "intext example",
                palavrasExatas: ["exact google word"],
                palavrasQuePodeTer: ["optional google word"],
                excluirPalavras: ["exclude google word"],
                lang: "pt"
            },
            youtube_search_config: {
                id:0,
                dork: "youtube dork example monitoramento1",
                videoDuration: "any",
                videoDefinition: "any",
                videoEmbeddable: true,
                ytOrder: "date",
                publishAfter: new Date(),
                lang: "pt"
            }   

        })

        const monitoramento2 = await monitoramentoRepo.set(client.id, {
            id:0,
            titulo:"Monit 2",
            descricao:"descricao 2"
        }) as Monitoramento

        await monitoramentoRepo.addConfig(client.id, monitoramento2.id, {

            instagram_search_config: { 
                id:0,
                hashtags: [
                    { hashtag_instagram_id: 1, hashtag_value: "testMonit2" },
                    { hashtag_instagram_id: 2, hashtag_value: "example2" }
                ]
            },
            twitter_search_config: {
                id:0,
                hashtags: ["hashtag1", "hashtag2"],
                dork: "dork twitter example monitoramento2",
                fromUsers: ["user1", "user2"],
                notFromUsers: ["user3"],
                mentions: ["mention1"],
                palavrasExatas: ["exact word"],
                palavrasQuePodeTer: ["optional word"],
                excluirPalavras: ["exclude word"],
                lang: "pt"
            },
            google_search_config: {
                id:0,
                dork: "google dork example monitoramento2",
                sites: ["example.com", "test.com"],
                notInSites: ["exclude.com"],
                inUrl: "inurl example",
                inTitle: "intitle example",
                inText: "intext example",
                palavrasExatas: ["exact google word"],
                palavrasQuePodeTer: ["optional google word"],
                excluirPalavras: ["exclude google word"],
                lang: "pt"
            },
            youtube_search_config: {
                id:0,
                dork: "youtube dork example monitoramento2",
                videoDuration: "any",
                videoDefinition: "any",
                videoEmbeddable: true,
                ytOrder: "date",
                publishAfter: new Date(),
                lang: "pt"
            }   

        })

    })

    test("Ativando monitoramentos ao máximo do limite", async () => {

        const monitoramentos = await monitoramentoRepo.get(parsedQuery) as Monitoramento[]

        expect(monitoramentos.length).toBe(2)

        const monit1 = monitoramentos[0]
        const res1   = await monitoramentoRepo.ativarMonitoramento(parsedQuery.client_id, monit1.id)
        expect(res1).toBe(true)

        const monit2 = monitoramentos[1]
        const res2   = await monitoramentoRepo.ativarMonitoramento(parsedQuery.client_id, monit2.id)
        expect(res2).toBe(false)
       
    })

    test("Aumentando limite máximo de monitoramentos ativos", async () => {

        const clientConfig = await clientRepo.updateClientConfig(parsedQuery.client_id, {
            id:0,
            client_id:parsedQuery.client_id,
            max_monitoramentos_ativos:2,
            instagram_app_id: configAdmin.instagram_app_id
        })

        expect(clientConfig).toBe(true)

        const res = await monitoramentoRepo.getMonitoramentosDeClientesAtivosEConfigs()
        expect(res).not.toBe(false)

        const monitoramentosFull = res as MonitoramentoFull[]
        expect(monitoramentosFull.length).toBe(1)

        const todosOsMonitoramentos = await monitoramentoRepo.get(parsedQuery) as Monitoramento[]
        expect(todosOsMonitoramentos.length).toBe(2)

        const monitoramento2 = todosOsMonitoramentos[1]
        const res2 = await monitoramentoRepo.ativarMonitoramento(parsedQuery.client_id, monitoramento2.id)

        expect(res2).toBe(true)

    })

    test("Pegando lista de monitoramentos e configurações", async () => {

        const monitoramentosFull = 
            await monitoramentoRepo
            .getMonitoramentosDeClientesAtivosEConfigs() as MonitoramentoFull[]

        let total = 0

        monitoramentosFull.forEach(monit => {
            if(monit.cliente_id === parsedQuery.client_id){
                total++
            }
        })

        expect(total).toBe(2)

    })


    afterAll( async () => {
        
        const query = JSON.parse(JSON.stringify(parsedQuery));

        const monitoramentos =  await monitoramentoRepo.get(query)
        let status = monitoramentos !== undefined

        if(monitoramentos){
            for(const monit of monitoramentos){
                console.log("Deletando monitoramento: ", monit.id);
                if(!await monitoramentoRepo.del(parsedQuery.client_id, monit.id)){
                    console.log("Erro ao deletar monitoramento: ", monit.id);
                    status = false
                }
            }
        }
            
        expect(status).toBe(true)
        const resultClient = await clientRepo.del(query.client_id)
        expect(resultClient).toBe(true)
        const resultDeleteInstagram = await adminConfigsRepo.deleteInstagramApp(configAdmin.instagram_app_id)
        expect(resultDeleteInstagram).toBe(true)
    
    });

})