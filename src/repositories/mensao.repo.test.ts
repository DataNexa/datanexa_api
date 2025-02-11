import mensaoRepo from "./mensao.repo"
import { FilterQuery } from "../types/FilterQuery";
import clientRepo from "./client.repo";
import monitoramentoRepo from "./monitoramento.repo";
import { Mensao } from "../types/Mensao";
import { Monitoramento } from "../types/Monitoramento";

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

describe("Testes no repositorio de mensoes", () => {

    beforeAll( async () => {
        const client = await clientRepo.set({
            id:0,
            nome: "Client Test"
        }) as Client

        parsedQuery.client_id = client.id

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

    });

    test("teste com select de mensões", async () => {

        const parsed = JSON.parse(JSON.stringify(parsedQuery))
        parsed.filters['monitoramento_id'] = monitoramento_id

        let mensao = await mensaoRepo.get(parsed) as Mensao[]

        expect(mensao[0].id).toBe(mensao_id)

    })

})