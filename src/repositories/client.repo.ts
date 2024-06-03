import { type_user } from "../model/User"
import { query } from "../util/query"

export default {

    getSlugById: async (client_id:number) => {

        const getSlug = await query('select slug from client where id = ?', {
            binds:[client_id]
        })

        if(getSlug.error)
            return false

        let arr = getSlug.rows as {slug:string}[]

        if(arr.length == 0) return false

        return arr[0]

    },

    register: async () => {
        
    }

}