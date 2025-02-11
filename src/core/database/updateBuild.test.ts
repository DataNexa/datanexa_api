import updateBuild from "./updateBuild"


describe("Função auxiliar na construção de consultas UPDATE", () => {

    test("Tetando consulta com um objeto complexo", () => {

        let test = updateBuild({
            id:1, // tem que ser ignorado
            nome:'Andrei',
            sobrenome:'Coelho'
        }, 'user', ['nome', 'client_id'])

        expect(test).toBe('update user set nome = ?, sobrenome = ? where nome = ? and client_id = ?;')
        

    })

})