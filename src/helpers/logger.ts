import { query, execute } from "./query";
import globals from "../config/globals";

const saveLog = async (slug_service_action:string, texto:string) => {

    const dataAtual = new Date();
    const res = await query("select id from service_actions where slug = ?", {
        binds:[slug_service_action]
    })

    if(res.length == 0 && !globals.production)
        return console.log(`serviço ${slug_service_action} inexistente`)

    const data = res[0]
    
    let id_service = Array.isArray(data) ? data[0]['id'] : data['id']
    
    const resins = await execute("insert into logs(create_at, service_action_id, resumo) values (?,?,?)",{
        binds:[dataAtual, id_service, texto]
    })

    if(!resins && !globals.production){
        console.log(`Não foi possivel registrar o log.\n texto: '${texto}' \n serviço slug: ${slug_service_action}`);
    }

}

export default saveLog