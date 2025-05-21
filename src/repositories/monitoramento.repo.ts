import { query, insertOnce, execute, multiTransaction } from "../core/database/mquery"
import queryBuilder from "../core/database/queryBuilder"
import { DatabaseMap } from "../types/DatabaseMap"
import { FilterQuery } from "../types/FilterQuery"
import { Monitoramento, MonitoramentoFull } from "../types/Monitoramento"
import updateBuild from "../core/database/updateBuild"
import Logger from "../util/logger"

const fields:{[key:string]:string} = {
    id:'monitoramento.id',
    titulo:'monitoramento.titulo',
    descricao:'monitoramento.descricao'
}

const mapDatabase:DatabaseMap = {
    table:'monitoramento',
    fields:fields,
    join:['>client'],
    fieldsSerch:{
        titulo:'monitoramento.titulo',
        descricao:'monitoramento.descricao'
    }
}

const defaultMonitoramento:Monitoramento = {
    id:0,
    titulo:'',
    descricao:''
}

const defaultMonitoramentoFull:MonitoramentoFull = { 
    id:0,
    titulo:'',
    descricao:'',
    ativo:true,
    cliente_id:0
}


const createMonitoramentoFull = (monitoramento:any):MonitoramentoFull => {
    return {
        id:monitoramento.monitoramento_id,
        titulo:monitoramento.titulo,
        descricao:monitoramento.descricao,
        ativo:monitoramento.ativo,
        cliente_id:monitoramento.client_id,
        instagram_search_config: monitoramento.instagram_search_config_id ? {
            hashtags:monitoramento.instagram_hashtags ? monitoramento.instagram_hashtags.split(',').map((h:any) => {
                const [id, value] = h.split('#')
                return {hashtag_instagram_id:id, hashtag_value:value}
            }) : []
        } : undefined,
        twitter_search_config: monitoramento.twitter_search_config_id ? {
            hashtags:monitoramento.twitter_hashtags ? monitoramento.twitter_hashtags.split(',') : [],
            dork:monitoramento.twitter_dork,
            fromUsers:monitoramento.from_users ? monitoramento.from_users.split(',') : [],
            notFromUsers:monitoramento.not_from_users ? monitoramento.not_from_users.split(',') : [],
            mentions:monitoramento.mentions ? monitoramento.mentions.split(',') : [],
            palavrasExatas:monitoramento.twitter_palavrasExatas ? monitoramento.twitter_palavrasExatas.split(',') : [],
            palavrasQuePodeTer:monitoramento.twitter_palavrasQuePodeTer ? monitoramento.twitter_palavrasQuePodeTer.split(',') : [],
            excluirPalavras:monitoramento.twitter_excluirPalavras ? monitoramento.twitter_excluirPalavras.split(',') : [],
            lang:monitoramento.twitter_lang
        }: undefined,
        youtube_search_config: monitoramento.youtube_search_config_id ? {
            dork:monitoramento.youtube_dork,
            fromUsers:monitoramento.from_users ? monitoramento.from_users.split(',') : [],
            videoDuration:monitoramento.videoDuration,
            videoDefinition:monitoramento.videoDefinition,
            videoEmbeddable:monitoramento.videoEmbeddable,
            ytOrder:monitoramento.ytOrder,
            publishAfter:monitoramento.publishAfter,
            lang:monitoramento.youtube_lang
        } : undefined,
        google_search_config: monitoramento.google_search_config_id ? {
            dork:monitoramento.google_dork,
            sites:monitoramento.sites ? monitoramento.sites.split(',') : [],
            notInSites:monitoramento.noInSites ? monitoramento.noInSites.split(',') : [],
            inUrl:monitoramento.inUrl,
            inTitle:monitoramento.inTitle,
            inText:monitoramento.inText,
            palavrasExatas:monitoramento.google_palavrasExatas ? monitoramento.google_palavrasExatas.split(',') : [],
            palavrasQuePodeTer:monitoramento.google_palavrasQuePodeTer ? monitoramento.google_palavrasQuePodeTer.split(',') : [],
            excluirPalavras:monitoramento.google_excluirPalavras ? monitoramento.google_excluirPalavras.split(',') : [],
            lang:monitoramento.google_lang
        } : undefined
    }
}


export default {

    async getMonitoramentosDeClientesAtivosEConfigs(): Promise<MonitoramentoFull[] | false> {

        /**
         * - pegar todos os clientes ativos
         * - Pegar os monitoramentos ativos de clientes ativos
         *      - Se o monitoramento estiver ativo e a data de fim estiver preenchida mas a data atual for maior que a data de fim,
         *        o monitoramento deve ser desativado
         *      - senão, adicionar o id do cliente em monitoramento_clients_ids
         * - Se algum cliente não tiver monitoramento ativo, verificar se há algum monitoramento desativado com a data inicio menor
         *   que a data atual e data fim maior que a data atual
         *      - Se houver, o monitoramento deve ser ativado e adicionado à lista
         * - retornar a lista
         */
    
        const conn = await multiTransaction()
    
        try {
            /* -----------------------------------------------------------------
             * CLIENTES ATIVOS
             * ----------------------------------------------------------------- */
            const queryClientesAtivos = await conn.query(`SELECT id FROM client WHERE ativo = 1`)
            if (queryClientesAtivos.error) throw new Error(queryClientesAtivos.error_message)
    
            const clientes_ativos: number[] = (queryClientesAtivos.rows as { id: number }[]).map(r => r.id)
            const monitoramento_clients_ids: number[] = []
    
            /* -----------------------------------------------------------------
             * MONITORAMENTOS ATIVOS
             * ----------------------------------------------------------------- */
            const queryMonitoramentos = await conn.query(/* sql */`
                SELECT
                    m.id AS monitoramento_id,
                    m.client_id,
                    m.titulo,
                    m.descricao,
                    m.create_at,
                    m.data_inicio,
                    m.data_fim,
                    m.ativo,
    
                    gsc.id  AS google_search_config_id,
                    gsc.dork                AS google_dork,
                    gsc.sites,
                    gsc.noInSites,
                    gsc.inUrl,
                    gsc.inTitle,
                    gsc.inText,
                    gsc.palavrasExatas      AS google_palavrasExatas,
                    gsc.palavrasQuePodeTer  AS google_palavrasQuePodeTer,
                    gsc.excluirPalavras     AS google_excluirPalavras,
    
                    tsc.id  AS twitter_search_config_id,
                    tsc.dork                 AS twitter_dork,
                    tsc.from_users,
                    tsc.not_from_users,
                    tsc.mentions,
                    tsc.hashtags            AS twitter_hashtags,
                    tsc.palavrasExatas      AS twitter_palavrasExatas,
                    tsc.palavrasQuePodeTer  AS twitter_palavrasQuePodeTer,
                    tsc.excluirPalavras     AS twitter_excluirPalavras,
                    tsc.lang                AS twitter_lang,
    
                    ysc.id  AS youtube_search_config_id,
                    ysc.dork,
                    ysc.videoDuration,
                    ysc.videoDefinition,
                    ysc.videoEmbeddable,
                    ysc.ytOrder,
                    ysc.publishAfter,
                    ysc.lang                AS youtube_lang,
    
                    isc.id  AS instagram_search_config_id,
                    GROUP_CONCAT(CONCAT(ish.hashtag_instagram_id, '', ish.hashtag_value) ORDER BY ish.hashtag_value SEPARATOR ',') AS instagram_hashtags
    
                FROM (
                    SELECT m_inner.*
                    FROM monitoramento m_inner
                    INNER JOIN (
                        SELECT client_id, MAX(create_at) AS max_create_at
                        FROM monitoramento
                        WHERE ativo = 1
                        GROUP BY client_id
                    ) latest ON m_inner.client_id = latest.client_id AND m_inner.create_at = latest.max_create_at
                    WHERE m_inner.ativo = 1
                      AND (
                            (m_inner.data_inicio IS NULL OR m_inner.data_inicio <= NOW())
                        AND (m_inner.data_fim    IS NULL OR m_inner.data_fim    >= NOW())
                      )
                ) m
                LEFT JOIN google_search_config            gsc ON gsc.monitoramento_id = m.id AND gsc.client_id = m.client_id
                LEFT JOIN twitter_search_config           tsc ON tsc.monitoramento_id = m.id AND tsc.client_id = m.client_id
                LEFT JOIN youtube_search_config           ysc ON ysc.monitoramento_id = m.id AND ysc.client_id = m.client_id
                LEFT JOIN instagram_search_config         isc ON isc.monitoramento_id = m.id AND isc.client_id = m.client_id
                LEFT JOIN instagram_search_config_hashtags ish ON ish.instagram_search_config_id = isc.id
                GROUP BY m.id, m.client_id
            `)
            if (queryMonitoramentos.error) throw new Error(queryMonitoramentos.error_message)
    
            const monitoramentos = queryMonitoramentos.rows as any[]
            const monitoramentosFullAtivos: MonitoramentoFull[] = []
            const monitoramentosParaDesativar: any[] = []
            const hoje = new Date()
    
            for (const monitoramento of monitoramentos) {
                if (monitoramento.data_fim && new Date(monitoramento.data_fim) < hoje) {
                    monitoramento.ativo = false
                    monitoramentosParaDesativar.push(monitoramento)
                    continue
                }
    
                if (clientes_ativos.includes(monitoramento.client_id)) {
                    monitoramento_clients_ids.push(monitoramento.client_id)
                }
    
                monitoramentosFullAtivos.push(createMonitoramentoFull(monitoramento))
            }
    
            /* -----------------------------------------------------------------
             * DESATIVAR MONITORAMENTOS EXPIRADOS
             * ----------------------------------------------------------------- */
            if (monitoramentosParaDesativar.length > 0) {
                const ids = monitoramentosParaDesativar.map(m => m.monitoramento_id)
                const res = await conn.execute(`UPDATE monitoramento SET ativo = 0 WHERE id IN (?)`, [ids])
                if (res.error) throw new Error(res.error_message)
            }
    
            /* -----------------------------------------------------------------
             * MONITORAMENTOS DESATIVADOS QUE PASSARAM A VALER
             * ----------------------------------------------------------------- */
            const listForNotIn = monitoramento_clients_ids.length > 0 ? monitoramento_clients_ids : [0]
    
            const queryMonitoramentosDesativados = await conn.query(/* sql */`
                SELECT
                    m.id         AS monitoramento_id,
                    m.client_id,
                    m.titulo,
                    m.descricao,
                    m.create_at,
                    m.data_inicio,
                    m.data_fim,
                    m.ativo,
    
                    gsc.id AS google_search_config_id,
                    gsc.dork                AS google_dork,
                    gsc.sites,
                    gsc.noInSites,
                    gsc.inUrl,
                    gsc.inTitle,
                    gsc.inText,
                    gsc.palavrasExatas      AS google_palavrasExatas,
                    gsc.palavrasQuePodeTer  AS google_palavrasQuePodeTer,
                    gsc.excluirPalavras     AS google_excluirPalavras,
    
                    tsc.id AS twitter_search_config_id,
                    tsc.dork                 AS twitter_dork,
                    tsc.from_users,
                    tsc.not_from_users,
                    tsc.mentions,
                    tsc.hashtags            AS twitter_hashtags,
                    tsc.palavrasExatas      AS twitter_palavrasExatas,
                    tsc.palavrasQuePodeTer  AS twitter_palavrasQuePodeTer,
                    tsc.excluirPalavras     AS twitter_excluirPalavras,
                    tsc.lang                AS twitter_lang,
    
                    ysc.id AS youtube_search_config_id,
                    ysc.dork,
                    ysc.videoDuration,
                    ysc.videoDefinition,
                    ysc.videoEmbeddable,
                    ysc.ytOrder,
                    ysc.publishAfter,
                    ysc.lang                AS youtube_lang,
    
                    isc.id AS instagram_search_config_id,
                    GROUP_CONCAT(ish.hashtag_value ORDER BY ish.hashtag_value SEPARATOR ',') AS instagram_hashtags
    
                FROM (
                    SELECT m.*
                    FROM monitoramento m
                    JOIN (
                        SELECT client_id, MIN(id) AS id
                        FROM monitoramento
                        WHERE ativo = 0
                          AND (data_inicio IS NULL OR data_inicio <= NOW())
                          AND (data_fim    IS NULL OR data_fim    >= NOW())
                          AND client_id NOT IN (?)
                        GROUP BY client_id
                    ) x ON x.id = m.id
                ) m
                LEFT JOIN google_search_config            gsc ON gsc.monitoramento_id = m.id AND gsc.client_id = m.client_id
                LEFT JOIN twitter_search_config           tsc ON tsc.monitoramento_id = m.id AND tsc.client_id = m.client_id
                LEFT JOIN youtube_search_config           ysc ON ysc.monitoramento_id = m.id AND ysc.client_id = m.client_id
                LEFT JOIN instagram_search_config         isc ON isc.monitoramento_id = m.id AND isc.client_id = m.client_id
                LEFT JOIN instagram_search_config_hashtags ish ON ish.instagram_search_config_id = isc.id
                GROUP BY m.id, m.client_id
            `, [listForNotIn])
            if (queryMonitoramentosDesativados.error) throw new Error(queryMonitoramentosDesativados.error_message)
    
            const ativarMonitoramentos: any[] = []
            for (const monitoramento of queryMonitoramentosDesativados.rows as any[]) {
                if (monitoramento.client_id && !monitoramento_clients_ids.includes(monitoramento.client_id)) {
                    monitoramento_clients_ids.push(monitoramento.client_id)
                    monitoramentosFullAtivos.push(createMonitoramentoFull(monitoramento))
                    ativarMonitoramentos.push(monitoramento)
                }
            }
    
            if (ativarMonitoramentos.length > 0) {
                const ids = ativarMonitoramentos.map(m => m.monitoramento_id)
                const res = await conn.execute(`UPDATE monitoramento SET ativo = 1 WHERE id IN (?)`, [ids])
                if (res.error) throw new Error(res.error_message)
            }
    
            await conn.finish() // commita e finaliza a conexão
            return monitoramentosFullAtivos
        } catch (err: any) {
            await conn.rollBack()
            Logger.error(err.message || err.toString(), "getMonitoramentosDeClientesAtivosEConfigs")
            return false
        }
    },


    get: async (filter:FilterQuery):Promise<Monitoramento[]|undefined> => {

        const dataQuery = queryBuilder(mapDatabase, filter)

        if(!dataQuery) return undefined

        const res = await query(dataQuery.query, dataQuery.values)

        if(res.error){
            return undefined
        }

        const monitoramentos = (res.rows as any[]).map(data => ({
            ...defaultMonitoramento,
            ...data
          })) as Monitoramento[]
        
        return monitoramentos

    },

    update: async (client_id:number, monitoramento:Monitoramento) => {

        let execstr = updateBuild(monitoramento, "monitoramento", ["id", "client_id"]);

        const mon = monitoramento as { [key: string]: any };

        const values = Object.keys(monitoramento)
            .filter(key => key !== "id" && mon[key] !== undefined)
            .map(key => mon[key]);

            
        values.push(monitoramento.id, client_id);

        let res = await execute(execstr, values);
        return !res.error;

    },

    set: async (client_id:number, monitoramento:Monitoramento):Promise<false|Monitoramento> => {

        const res = await insertOnce(`insert into monitoramento (client_id, titulo, descricao) values (?,?,?)`, [client_id, monitoramento.titulo, monitoramento.descricao])
        
        if(res.error){
            return false
        }

        monitoramento.id = res.lastInsertId
        return monitoramento

    },


    del: async (client_id:number, id:number) => {
        
        const multi = await multiTransaction()

        const res1 = await multi.execute(`delete from publish where monitoramento_id = ? and client_id = ?`, [id, client_id])

        if(res1.error){
            console.log("erro1:", res1);
            await multi.rollBack()
            return false
        }

        const res2 = await multi.execute(`delete from mensao where monitoramento_id = ? and client_id = ?`, [id, client_id])

        if(res2.error){
            console.log("erro2:", res2);
            await multi.rollBack()
            return false
        }

        const res3 = await multi.execute(`delete from monitoramento where id = ? and client_id = ?`, [id, client_id])

        if(res3.error){
            console.log("erro3:", res3);
            await multi.rollBack()
            return false
        }

        await multi.finish()
        return true
         
    }


}