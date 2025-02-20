import publishRepo from "./publish.repo"
import { FilterQuery } from "../types/FilterQuery";

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

describe("Testes de publicações", () => {

    test("Teste no get", async () => {

        publishRepo.get(parsedQuery)

    })

})