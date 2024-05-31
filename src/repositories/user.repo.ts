import { execute, query } from "../util/query"

interface user_basic_response { slug:string }

const user_repo = {
    
    list:async (account_id:number):Promise<user_basic_response[]|false> => {

        const resList = await query('select slug from user where account_id = ? and ativo = 1',{
            binds:[account_id]
        })

        return resList.error ? false : (resList.rows as user_basic_response[])        

    }

}

export { user_repo }