
import { multiTransaction } from "../util/query"
import Data from "../util/data"

export default async () => {

    const conn  = await multiTransaction()

    const total = await conn.query("select count(*) as total from monitoramento")

    if((total.rows as any[])[0].total != 0){
        console.log("Já foi concluido.");
        return await conn.finish()
    }

    const client_id = 1

    const mon_c = 2 
    const pub_c = 10

    const types = [ 'web', 'facebook', 'instagram', 'twitter', 'youtube' ]
    const hoje = (new Data(new Date())).toEn(true)

    for (let i = 0; i < mon_c; i++) {
        
        const prioridade = i+1
        const monitoramentoIn = await conn.execute(
            `insert into monitoramento 
                (client_id, titulo, descricao, ativo, creatat, pesquisa, alvo, prioridade ) values 
                (${client_id}, 'titulo do monitoramento ${i}', 'descrição ${i}', 1, '${hoje}', 'pesquisa ${i}', 'alvo ${i}', ${prioridade})`
        )

        if(monitoramentoIn.error){
            console.log("Erro monitoramento: ",monitoramentoIn.error_code);
            return await conn.rollBack()
        }

        const monitoramento_id = (monitoramentoIn.rows as any).insertId

        for(const type of types){
            
            for (let x = 0; x < pub_c; x++) {

                const avaliacao = Math.floor(Math.random() * (2 - 0 + 1)) + 0;
                const curtidas  = Math.floor(Math.random() * (1000 - 0 + 1)) + 0;
                const comparilh = Math.floor(Math.random() * (1000 - 0 + 1)) + 0;
                const visualiz  = Math.floor(Math.random() * (1000 - 10 + 1)) + 10;

                const insertPublish = await conn.execute(`
                    insert into publicacoes 
                    (monitoramento_id, titulo, texto, avaliacao, link, local_pub, curtidas, compartilhamento, visualizacoes, data_pub)
                    values
                    (${monitoramento_id}, 'titulo pub ${x}', 'texto pub ${x}', ${avaliacao}, 'http:${type}.test/?id=${x}&id_monitoramento=${monitoramento_id}', '${type}', ${curtidas}, ${comparilh}, ${visualiz}, '${hoje}')
                `)

                if(insertPublish.error){
                    console.log("Erro ao inserir publicacao: ", insertPublish.error_code);
                    return await conn.rollBack()
                }
                
            }

        }

    }

    conn.finish()

}