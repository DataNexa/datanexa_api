
import CacheRedis from "./CacheRedis";

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    status:"ready",
    connect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(() => "valorx"),
    quit: jest.fn(() => "OK"),
    on:jest.fn()
  }));
});


describe("Testes na classe CacheRedis",  () => {

    test("Verificando conexão e erros", () => {
        const cache = CacheRedis.getInstance()
        expect(cache.haveError()).toBe(false)    
        expect(cache.isConnected()).toBe(true)  
    })

    test("Resgatando o cliente Redis e usando o get", () => {
        const cache = CacheRedis.getInstance()
        const valor = cache.getClient().get("key")
        expect(valor).toBe("valorx")
    })

    test("Verificando status e quitando o Redis manualmente", async ()  => {
        const cache = CacheRedis.getInstance()
        await cache.quit()
        expect(cache.isConnected()).toBe(false)
    })

})