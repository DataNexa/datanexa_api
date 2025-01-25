
import JWT from "./JWT"

describe("JWT Testes", () => {

    test("gerar jwt e verificar o token", () => {
        const id = 1
        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 10) // 10 horas de expiração
            },
            {
                id:1,
                vtoken:0,
                type:1
            },
        )
        const other = JWT.verify(token)
        expect(typeof(other)).not.toBe(Boolean)
        const id_test = (other as any)['data']['id']
        expect(id_test).toBe(id)
        
    })

    test("testando função de encripção de password", async () => {

        const pass = "my_easy_pass"
        const pc = await JWT.cryptPassword(pass)
        const res = await JWT.comparePassword(pass, pc)

        expect(res).toBe(true)

        const pass_diff = "my_hard_pass"
        const res2 = await JWT.comparePassword(pass_diff, pc)

        expect(res2).toBe(false)

    })

})