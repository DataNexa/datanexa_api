import { execute, insertOnce } from "../core/database/mquery"
import { InstagramApp } from "../types/InstagramApp"

export default {

    addIntagramApp: async (instagram_app:InstagramApp):Promise<false|InstagramApp> => {
        const res = await insertOnce(
            `insert into instagram_app (app_id, app_secret, redirect_uri, access_token) values (?, ?, ?, ?)`,
            [instagram_app.app_id, instagram_app.app_secret, instagram_app.redirect_uri, instagram_app.access_token]
        )

        if(res.error) return false

        instagram_app.id = res.lastInsertId
        
        return instagram_app
    },

    setUsedInstagramApp: async (id:number, used:boolean) => {
        return !(await execute(`update instagram_app set used = ? where id = ?`, [used, id])).error
    },

    deleteInstagramApp: async (id:number) => {
        // se retornar false é porque algum está usando o app
        return !(await execute(`delete from instagram_app where id = ?`, [id])).error
    }

}