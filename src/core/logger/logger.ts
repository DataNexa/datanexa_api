import { query, execute } from "../core/database/query";
import globals from "../config/globals";

const saveLog = async (slug_service_action:string, texto:string, user_id?:number) => {

    const dataAtual = new Date();
    const res = await query("select id from service_actions where slug = ?", {
        binds:[slug_service_action]
    })

    if((res.rows as any[]).length == 0){
        if(!globals.production)
            console.log(`LOGGER: serviço ${slug_service_action} inexistente`)
        return 
    }      
    
    const data = (res.rows as any)[0]
    
    const id_service = (data as any).id
    const binds      = [dataAtual, id_service, texto]
    if(user_id && user_id > 0) binds.push(user_id)
    
    let str_ins = "insert into logs"
    str_ins += user_id && user_id > 0 ? "(create_at, service_action_id, resumo, user_id)" : "(create_at, service_action_id, resumo)"
    str_ins += user_id && user_id > 0 ? " values (?,?,?,?)" : " values (?,?,?)"
    
    const resins = await execute(str_ins,{
        binds:binds
    })

    if(!resins && !globals.production){
        console.log(`Não foi possivel registrar o log.\n texto: '${texto}' \n serviço slug: ${slug_service_action}`);
    }

}

export default saveLog