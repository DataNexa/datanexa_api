import Config from "../util/config";
import { multiTransaction } from "../core/database/mquery";
import JWT from '../core/auth/JWT';

const conf = Config.instance()

async function create_master_user(){

    if(!conf.getConf().configurado){              
        const data = conf.getData()
        return await save_master_user(data.master.email, data.master.senha)
    }

    return true

}

async function save_master_user(email:string, senha:string){

    const conn  = await multiTransaction()

     try {

        const hashedPassword = await JWT.cryptPassword(senha);

        const slug = `${email.split("@")[0]}@datanexa_master`;

        const accountInsertResult = await conn.execute(
            `INSERT INTO account (nome, email, senha, confirmed) VALUES (?, ?, ?, 1)`,
            ['Master', email, hashedPassword]
        );

        const accid = (accountInsertResult.rows as any).insertId;

        await conn.execute(
            `INSERT INTO user (slug, account_id, ativo, tipo_usuario, accepted) 
             VALUES (?, ?, 1, 2, 1)`,
             [slug, accid]
        );

        await conn.finish();
        conf.setConfigured();
        return true;

    } catch (error) {
        
        await conn.rollBack();
        return false;
    }

}

export default create_master_user