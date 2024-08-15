
import { multiTransaction, query } from "../util/query"


export default {

    create: async (slug:string, locale:string) => {

        const conn = await multiTransaction()

        const resp = await conn.execute('insert into bots(slug, locale) values (?,?)', {
            binds:[slug, locale]
        })

        if(resp.error){
            await conn.rollBack()
            return resp
        }

        await conn.finish()
        return resp

    },

    getBot: async (slug:string, vtoken?:number) => {

        let fields = 'id, slug, locale, vtoken '
       
        let where = ` slug = '${slug}' `
        where += vtoken ? ` and vtoken = '${vtoken}'` : ''

        return await query(`select ${fields} from bots where ${where}`)

    }

}