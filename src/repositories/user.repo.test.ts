import { UserDetail } from "../types/User"
import userRepo from "./user.repo"

describe("Testes de gerenciamento de usuários no banco de dados com o user.repo.ts", () => {
    

    test("Criar usuário admin e deleta-lo", async () => {

        await userRepo.deleteUser(48)

        const user = await userRepo.saveUserAdmin("andrei", "andrei@test.com", "senhaforte@123")

        expect((typeof user)).toBe("object")

        if(user){
            expect(user.client_id).toBe(0)
            const status = await userRepo.deleteUser(user.id)
            expect(status).toBe(true)
        } else {
            expect(true).toBe(false)
        }

    })


    test("Criar usuário temporário e usar email e senha para resgata-lo", async () => {

        const senhaForte = "senhaforte@123"

        const user = await userRepo.saveUserAdmin("andrei", "andrei@test.com", senhaForte)
        const userDet = user as UserDetail
        const nUser = await userRepo.getUserByEmailAndPass(userDet.email, senhaForte) as UserDetail

        expect(nUser).toHaveProperty("email")
        expect(nUser).toHaveProperty("nome")
        expect(nUser.id).toBe(userDet.id)
        expect((nUser as any )['senha']).toBe("")
        const status = await userRepo.deleteUser(nUser.id)
        expect(status).toBe(true)

    })


    test("Criar usuário temporário e resgatálo no banco de dados", async () => {

        
        const user = await userRepo.saveUserAdmin("andrei", "andrei@test2.com", "senhaforte@123")
        const userDet = user as UserDetail 

        const userGet = await userRepo.getUserById(userDet.id)
        const userFim = userDet as UserDetail

        expect(userFim).toEqual(userGet)

        const status = await userRepo.deleteUser(userDet.id)
        expect(status).toBe(true)

    })

    test("Tentar logar com senha incorreta", async () => {

        const senha = "minhasenha"
        const senhaerrada = "minhasenhaerrada"

        const user  = await userRepo.saveUserAdmin("andrei", "andrei@test.com", senha) as UserDetail
        const nUser = await userRepo.getUserByEmailAndPass("andrei@test.com", senhaerrada) as UserDetail

        expect(nUser).toBe(undefined)

        const status = await userRepo.deleteUser(user.id)
        expect(status).toBe(true)

    })


    test("Tentar registrar usuários com o mesmo e-mail", async () => {

        const email = "andrei@test.com"

        const user1  = await userRepo.saveUserAdmin("andrei", email, "senha") as UserDetail
        expect(user1.email).toBe(email)

        const user2 = await userRepo.saveUserAdmin("andrei coelho", email, "outrasenha")
        expect(user2).toBe(false)

        const status = await userRepo.deleteUser(user1.id)
        expect(status).toBe(true)

    })


}) 