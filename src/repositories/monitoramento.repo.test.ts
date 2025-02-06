import monitoramentoRepo from "./monitoramento.repo";
import { FilterQuery } from "../types/FilterQuery";
import clientRepo from "./client.repo";
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

describe("Testes do repositorio de Monitoramentos", () => {


    beforeAll( async () => {
        const client = await clientRepo.set({
            id:0,
            nome: "Client Test"
        }) as Client

        parsedQuery.client_id = client.id

        await monitoramentoRepo.set(client.id, {
            id:0,
            titulo:"Monit 1",
            descricao:"descricao 1"
        })

        await monitoramentoRepo.set(client.id, {
            id:0,
            titulo:"Monit 2",
            descricao:"descricao 3"
        })
    });
    

    test("Criando monitoramentos com set", async () => {

        const monit= await monitoramentoRepo.set(parsedQuery.client_id, {
            id:0,
            titulo:"Monit 3",
            descricao:"descricao 3"
        })


        expect(monit).not.toBe(false)
        expect((typeof(monit as Monitoramento).id)).toBe('number')
        
    })

    test("Editando monitoramento e verificando no banco de dados", async () => {

        const monit = await monitoramentoRepo.set(parsedQuery.client_id, {
            id:0,
            titulo:"Monit 4",
            descricao:"descricao 4"
        }) as Monitoramento

        monit.descricao = "outra descricao"

        expect(await monitoramentoRepo.update(monit)).toBe(true)
        
        const query = JSON.parse(JSON.stringify(parsedQuery));

        query.filters['id'] = monit.id 
        
        const monittest = (await monitoramentoRepo.get(query) as Monitoramento[])[0] as Monitoramento

        expect(monittest).toEqual(monit)
        

    })

    test("Testando o list", async () => {

        const query = JSON.parse(JSON.stringify(parsedQuery));
       
        query.sort = ['descricao']
        query.desc = false
        query.fields = ['descricao']
        const monitoramentos = await monitoramentoRepo.get(query) as Monitoramento[]

        expect(monitoramentos[0].id).toBeLessThan(monitoramentos[1].id)
   
    })


    afterAll( async () => {
        
        const query = JSON.parse(JSON.stringify(parsedQuery));

        const monitoramentos =  await monitoramentoRepo.get(query)
        let status = monitoramentos !== undefined

        if(monitoramentos)
            for(const monit of monitoramentos){
                if(!await monitoramentoRepo.del(monit.id)){
                    status = false
                }
            }

        expect(status).toBe(true)

        await clientRepo.del(query.client_id)
        
    });

})