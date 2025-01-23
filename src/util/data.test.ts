
import { dateToBr, dateToEn } from "./data"

describe("teste de datas", () => {

    test("do inglês para br - 2002-10-01 -> 01/10/2002", () => {
        expect(dateToBr('2002-10-01')).toBe('01/10/2002')
    })

    test("do inglês para br forçando o time - 2002-10-01 -> 01/10/2002 00:00:00", () => {
        expect(dateToBr('2002-10-01', true)).toBe('01/10/2002 00:00:00')
    })

    test("do inglês para br com espaços", () => {
        expect(dateToBr('   2002-10-01 ', true)).toBe('01/10/2002 00:00:00')
    })

    test("data errada - 2002-42-40 -> undefined", () => {
        expect(dateToBr('2002-42-40')).toBe(undefined)
    })

    test("data errada - 2002-22 -> undefined", () => {
        expect(dateToBr('2002-22')).toBe(undefined)
    })

    test("data incompleta com apenas o mês retorna com o primeiro dia - 2002-10 -> 01/10/2002", () => {
        expect(dateToBr('2002-10')).toBe('01/10/2002')
    })

    test("data com ano incompleto - 10-10-10 -> 10/10/2010", () => {
        expect(dateToBr('10-10-10')).toBe('10/10/2010')
    })

})