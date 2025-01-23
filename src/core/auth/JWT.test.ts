
import JWT from "./JWT"

describe("JWT Testes", () => {

    test("gerar jwt e verificar o token", () => {
        const hash_id = "hash_id_test"
        const salth   = "salzinho_de_leve"
        const token = JWT.generate(
            {
                alg:'sha256', 
                type:1, 
                expire_in: (new Date()).getTime() + (3600000 * 10) // 10 horas de expiração
            },
            {
                hashid:hash_id
            },
            salth,
            1
        )
        const other = JWT.verify(token, salth)
        expect(typeof(other)).not.toBe(Boolean)
        const hash = (other as any)['data']['hashid']
        expect(hash).toBe(hash_id)
        
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