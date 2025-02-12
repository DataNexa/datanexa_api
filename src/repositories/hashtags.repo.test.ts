import mensaoRepo from "./mensao.repo"
import { FilterQuery } from "../types/FilterQuery";
import clientRepo from "./client.repo";
import monitoramentoRepo from "./monitoramento.repo";
import { Mensao } from "../types/Mensao";
import { Monitoramento } from "../types/Monitoramento";
import hashtagsRepo from "./hashtags.repo";
import { Hashtag } from "../types/Hashtag";

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


describe("Testes do repositorio hashtag", () => {

    beforeAll(async () => {
        
        const cliente = await clientRepo.set({
            nome:'Cliente Test',
            id:0
        }) as Client

        parsedQuery.client_id = cliente.id

        const monitoramento:Monitoramento = await monitoramentoRepo.set(parsedQuery.client_id, {
            id:0,
            titulo: 'Titulo monitoramento',
            descricao: 'Descrição monitoramento'
        }) as Monitoramento

        monitoramento_id = monitoramento.id

        const mensao:Mensao = await mensaoRepo.set({
            id:0,
            expressao:'Expressao qualquer',
            hashtags:['hash1', 'hash2']
        }, parsedQuery.client_id, monitoramento_id) as Mensao

        mensao_id = mensao.id 

    })

    test("Listando todos os hashtags de um cliente", async () => {

        const parsed = JSON.parse(JSON.stringify(parsedQuery)) as FilterQuery
        parsed.filters['client_id'] = parsed.client_id
        
        const hashs = await hashtagsRepo.get(parsed) as Hashtag[]

        expect(hashs.map(val => val.valor)).toEqual(['hash2', 'hash1'])

    })

    test("Inserindo o hash em uma mensão existente", async () => {

        await hashtagsRepo.set("hash3", mensao_id, parsedQuery.client_id)

        const parsed = JSON.parse(JSON.stringify(parsedQuery)) as FilterQuery
        parsed.filters['client_id'] = parsed.client_id
        parsed.filters['mensao_id'] = mensao_id
        
        const hashs = await hashtagsRepo.get(parsed) as Hashtag[]

        expect(hashs.map(val => val.valor)).toEqual(['hash3', 'hash2', 'hash1'])

    })

    test("deletando todos os hashs", async () => {

        const parsed = JSON.parse(JSON.stringify(parsedQuery)) as FilterQuery
        parsed.filters['client_id'] = parsed.client_id
        parsed.filters['mensao_id'] = mensao_id
        const hashs = await hashtagsRepo.get(parsed) as Hashtag[]

        for(let hash of hashs){
            await hashtagsRepo.del(hash.id, mensao_id, parsed.client_id)
        }

        const hashs2 = await hashtagsRepo.get(parsed) as Hashtag[]

        expect(hashs2).toEqual([])

        await mensaoRepo.del(parsed.client_id, mensao_id)
        await monitoramentoRepo.del(parsed.client_id, monitoramento_id)
        await clientRepo.del(parsed.client_id)

    })

})
