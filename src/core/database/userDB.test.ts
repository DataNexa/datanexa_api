
import userDB from "./userDB";
import { User, UserDetail } from "../../types/User";

const mockdbuser:(User | UserDetail)[] = [
    {
        id:1,
        nome:"Andrei",
        email:"andrei@email.com",
        type:2,
        client_id:0,
        vtoken:1
    },
    {
        id:2,
        type:3,
        vtoken:1
    },
    {
        id:1,
        nome:"Andrei",
        email:"andrei@email.com",
        type:1,
        client_id:1,
        vtoken:1
    },
]


const control = {
    "saveUser": true,
    "getUser": true
}

jest.mock('./mquery', () => {

    const qfn = jest.fn(async (query:string) => {

        if(!control.getUser){
            return {
                error:true,
                rows:[],
                error_code:1030,
                error_message:'Erro ao tentar restagar dado'
            }
        }

        const regex = new RegExp("where[\\s\\n]+user\\.id[\\s\n]+\\=[\\s\\n]+(\\d+)", "gi")
        const res   = query.matchAll(regex)
        const id    = (res.next().value as any[])[1]

        for(const row of mockdbuser){
            if(row.id == id){
                return {
                    error:false,
                    rows:[row],
                    error_code:0,
                    error_message:''
                }
            }
        }

        return {
            error:false,
            rows:[],
            error_code:0,
            error_message:''
        }

    })

    const ifn = jest.fn(async () => {
        if(control.saveUser){
            return {
                error:false,
                error_code:0,
                error_message:'',
                rows:[],
                lastInsertId:3
            }
        } else {
            return {
                error:true,
                error_code:1000,
                error_message:'Erro ao tentar salvar dado',
                rows:[]
            }
        }
    })

    return {
        query:qfn,
        insertOnce:ifn,
        multiTransaction:jest.fn(async () => {
            return {
                query:qfn,
                insertOnce:ifn,
                rollBack:jest.fn(async () => {}),
                finish:jest.fn(async () => {})
            }
        })
    }

})


describe("Teste do modulo userDB", () => {

    test("Pegando usuários com getUser", async () => {

        const user1 = await userDB.getUser(1)
        
        expect(user1).toHaveProperty("nome")
        expect(user1.type).toBe(2)

        const user2 = await userDB.getUser(2)
        
        expect(user2).not.toHaveProperty("nome")
        expect(user2.type).toBe(3)

    })

    test("Retornando usuário anônimo", async () => {

        const userQueNaoExite = await userDB.getUser(100)
        
        expect(userQueNaoExite.type).toBe(0)
        expect(userQueNaoExite.id).toBe(0)
        expect(userQueNaoExite.vtoken).toBe(0)


    })

    test("Retornando usuario anonimo com erro no banco", async () => {

        control.getUser = false 
        
        const user = await userDB.getUser(1)
        expect(user.id).toBe(0)

    })

    test("Salvando usuario simples", async () => {

        const userSaved = await userDB.saveUserBOT({
            type:3,
            vtoken:1,
            id:0
        })

        expect(userSaved).not.toBe(false)
        expect(userSaved).toHaveProperty("id")

    })

    test("Salvando usuario completo", async () => {

        const userSaved = await userDB.saveUserDetail({
            type:1,
            vtoken:1,
            id:0,
            nome:"Ondina",
            email:"ondina@email.com",
            client_id:1
        })

        expect(userSaved).not.toBe(false)
        expect(userSaved).toHaveProperty("id")
        expect((userSaved as UserDetail).id).toBe(3)    

    })

    test("Erro ao tentar salvar usuário", async () => {

        control.saveUser = false 

        const userSaved = await userDB.saveUserDetail({
            type:1,
            vtoken:1,
            id:0,
            nome:"Ondina",
            email:"ondina@email.com",
            client_id:1
        })

        expect(userSaved).toBe(false)

    })

})