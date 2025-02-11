import queryBuilder from "./queryBuilder"
import { FilterQuery } from "../../types/FilterQuery";
import { DatabaseMap } from "../../types/DatabaseMap";

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

describe("Testes na criação de querys com QueryBUilder", () => {

    test("criando uma consulta complexa com joins", () => {

        const parsedCopy = JSON.parse(JSON.stringify(parsedQuery)) as FilterQuery
        parsedCopy.fields = ["titulo"]
        parsedCopy.offset = 10
        parsedCopy.limit = 20
        parsedCopy.desc = false 
        parsedCopy.sort = ["descricao"]

        const mapDatabase:DatabaseMap = { 
            table:"monitoramentos", 
            fields:{
                id:"monitoramentos.id",
                titulo:"monitoramentos.titulo",
                descricao:"monitoramentos.descricao"
            },
            join:[">client"],
            otherFields:['client.id as client_id', 'user.id as user_id']
        }

        const query = queryBuilder(mapDatabase, parsedCopy)

        expect(query.query).toBe('SELECT monitoramentos.id as id, monitoramentos.titulo as titulo , client.id as client_id, user.id as user_id FROM monitoramentos JOIN client ON client.id = monitoramentos.client_id  ORDER BY monitoramentos.descricao ASC LIMIT 10, 20')
        expect(query.values).toEqual([])

    })


    test("criando uma consulta complexa com joins e busca", () => {

        const parsedCopy = JSON.parse(JSON.stringify(parsedQuery)) as FilterQuery
        parsedCopy.fields = ["titulo"]
        parsedCopy.offset = 10
        parsedCopy.limit = 20
        parsedCopy.desc = false 
        parsedCopy.sort = ["descricao"]
        parsedCopy.filters= {
            "id":1,
            "titulo":"olamundo"
        }

        parsedCopy.search = {
            obrigatorias:["palavra 1"],
            podeTer:["palavra2", "palavra3"],
            naoPodemTer:["palavra4", "palavra5"]
        }

        const mapDatabase:DatabaseMap = { 
            table:"monitoramentos", 
            fields:{
                id:"monitoramentos.id",
                titulo:"monitoramentos.titulo",
                descricao:"monitoramentos.descricao"
            },
            fieldsSerch:{
                titulo:"monitoramentos.titulo",
                descricao:"monitoramentos.descricao"
            },
            join:["client"],
            otherFields:['client.id as client_id', 'user.id as user_id']
        }

        const query = queryBuilder(mapDatabase, parsedCopy)
        
        expect(query.query).toBe('SELECT monitoramentos.id as id, monitoramentos.titulo as titulo , client.id as client_id, user.id as user_id FROM monitoramentos JOIN client ON client.monitoramentos_id = monitoramentos.id  WHERE monitoramentos.id = ? AND monitoramentos.titulo = ?  AND WHERE (monitoramentos.titulo LIKE ? OR monitoramentos.descricao LIKE ?) AND ((monitoramentos.titulo LIKE ? OR monitoramentos.descricao LIKE ?) OR (monitoramentos.titulo LIKE ? OR monitoramentos.descricao LIKE ?)) AND (monitoramentos.titulo NOT LIKE ? AND monitoramentos.descricao NOT LIKE ?) AND (monitoramentos.titulo NOT LIKE ? AND monitoramentos.descricao NOT LIKE ?)ORDER BY monitoramentos.descricao ASC LIMIT 10, 20')
        expect(query.values).toEqual([
            1,             'olamundo',
            '%palavra 1%', '%palavra 1%',
            '%palavra2%',  '%palavra2%',
            '%palavra3%',  '%palavra3%',
            '%palavra4%',  '%palavra4%',
            '%palavra5%',  '%palavra5%'
          ])
    })

})