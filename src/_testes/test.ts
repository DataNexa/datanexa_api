import { insertPesquisas, insertDummyResponses } from "./insert_fake_data";

const init = async () => {
    insertPesquisas()
    //insertDummyResponses()
}

init()