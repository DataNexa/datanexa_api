import userCache from "./userCache"
import createClient from 'ioredis'

const cli = new createClient()

const setSpy = jest.spyOn(cli, "set")
const getSpy = jest.spyOn(cli, "get")
const delSpy = jest.spyOn(cli, "del")

afterAll(async () => {
    // Fecha a conexão com o Redis no final de todos os testes
    await cli.quit()
    userCache.quit()
})

afterEach(() => {
    jest.clearAllMocks()
})


describe("teste com cache user", () => {

    jest.setTimeout(10000);
    
    test("salvar usuario em cache com sucesso", async () => {

        setSpy.mockImplementation(async (key, value) => {
            return "OK"
        })

        let user = {
            nome:"Andrei",
            id:1,
            hashid:'hash',
            email:'andrei@email.com',
            type:1
        }

        let res = await userCache.saveDataUser(user)

        expect(res).toBe(true)

    })

    test("resgatar usuario no redis", async () => {

        let mockUser = {
            nome:"Andrei",
            id:1,
            hashid:'hash',
            email:'andrei@email.com',
            type:1
        }

        getSpy.mockImplementation(async (key) => {
            if(key == "user:1"){
                return JSON.stringify(mockUser)
            } else {
                return null
            }
        })

        const userResgatadoCorreto = await userCache.getDataUser(1)
        expect(typeof(userResgatadoCorreto)).toBe("object")
        expect(userResgatadoCorreto).toHaveProperty("id", 1);
        expect(userResgatadoCorreto).toMatchObject(mockUser);


        const usuarioQueNaoExiste = await userCache.getDataUser(2)
        expect(usuarioQueNaoExiste).toBe(false)

    })

    test("Deletar o registro no Redis", async () => {
        
        delSpy.mockResolvedValue(1)

        expect(await userCache.deleteDataUser(1)).toBe(1)

    })

})