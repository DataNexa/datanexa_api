import userCache from "./userCache"
import { UserDetail } from "../../types/User";

const usersDB:Record<string, UserDetail> = {
    "user:1":{
        type:1,
        picture:'',
        email:'andrei@email.com',
        nome:'andrei',
        id:1,
        vtoken:0,
        client_id:1
    },
    "user:2":{
        type:1,
        picture:'',
        email:'gustavo@email.com',
        nome:'gustavo',
        id:2,
        vtoken:0,
        client_id:1
    }
}

async function getData(key:string){
    try {
        let strobj = JSON.stringify(usersDB[key])
        return strobj
    } catch(e) {
        return null
    }
}

async function saveData(key:string, value:string){
    usersDB[key] = JSON.parse(value) as UserDetail
    return "OK"
}

async function deleteData(key:string) {
    if(Object.keys(usersDB).includes(key)){
        delete usersDB[key]
        return 1
    }
    return 0
}

jest.mock("ioredis", () => {
    return jest.fn().mockImplementation(() => ({
        status:"ready",
        connect: jest.fn(),
        del: jest.fn(async (key) => await deleteData(key)),
        set: jest.fn(async (key, value) => await saveData(key, value)),
        get: jest.fn(async (key) => await getData(key)),
        quit: jest.fn(() => "OK"),
        on:jest.fn()
    }));
});

describe("teste com cache user", () => {

    jest.setTimeout(10000);
    
    test("salvar usuario em cache com sucesso", async () => {

        let user3 = {
            nome:"Ondina",
            id:3,
            email:'ondina@email.com',
            type:1,
            vtoken:0,
            client_id:1
        }

        let res = await userCache.saveDataUser(user3)

        expect(res).toBe(true)

        expect(Object.keys(usersDB).length).toBe(3)

    })

    test("resgatar usuario no redis", async () => {

        const userResgatadoCorreto = await userCache.getDataUser(1)
        expect(userResgatadoCorreto).toHaveProperty("id", 1);

    })

    test("Deletar o registro no Redis", async () => {

        expect(await userCache.deleteDataUser(1)).toBe(1)
        expect(Object.keys(usersDB).length).toBe(2)

    })

    test("tentar pegar usuário que não existe", async () => {
  
        const usuarioQueNaoExiste = await userCache.getDataUser(100)
        expect(usuarioQueNaoExiste).toBe(false)
  
    })


    test("tentar deletar registro que não existe", async () => {

        expect(await userCache.deleteDataUser(100)).toBe(0)
        expect(Object.keys(usersDB).length).toBe(2)

    })

})