import { query, insertOnce, execute, multiTransaction } from "../core/database/mquery"
import queryBuilder from "../core/database/queryBuilder"
import { DatabaseMap } from "../types/DatabaseMap"
import { FilterQuery } from "../types/FilterQuery"
import { Monitoramento, MonitoramentoFull } from "../types/Monitoramento"
import updateBuild from "../core/database/updateBuild"
import Logger from "../util/logger"
import { ConfigMap, ConfigMapSimple } from "../types/SearchConfig"
import { OkPacket } from "mysql"
import publishRepo from "./publish.repo"

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
    
    let hashtagsInstagram = []
    
    if(monitoramento.instagram_search_config_id && monitoramento.instagram_hashtags && monitoramento.instagram_hashtag_index_ids){
        const partsValues = monitoramento.instagram_hashtags.split(',')
        const partsIds    = monitoramento.instagram_hashtag_index_ids.split(',')
        hashtagsInstagram = partsValues.map((v:any, i:number) => {
            return { hashtag_instagram_id: parseInt(partsIds[i]), hashtag_value:v }
        })
    }

    return {
        id:monitoramento.monitoramento_id,
        titulo:monitoramento.titulo,
        descricao:monitoramento.descricao,
        ativo:monitoramento.ativo,
        cliente_id:monitoramento.client_id,
        instagram_search_config: monitoramento.instagram_search_config_id ? {
            hashtags: hashtagsInstagram
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
            excluirPalavras:monitoramento.google_excluirPalavras ? monitoramento.google_excluirPalavras.split(',') : []
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
            const queryMonitoramentos = await conn.query(`
                    SELECT
    
                        m.id            AS monitoramento_id,
                        m.client_id,
                        m.titulo,
                        m.descricao,
                        m.create_at,
                        m.data_inicio,
                        m.data_fim,
                        m.ativo,

                        gsc.id                 AS google_search_config_id,
                        gsc.dork               AS google_dork,
                        gsc.sites,
                        gsc.noInSites,                 
                        gsc.inUrl,
                        gsc.inTitle,
                        gsc.inText,
                        gsc.palavrasExatas      AS google_palavrasExatas,
                        gsc.palavrasQuePodeTer  AS google_palavrasQuePodeTer,
                        gsc.excluirPalavras     AS google_excluirPalavras,

                        tsc.id                 AS twitter_search_config_id,
                        tsc.dork               AS twitter_dork,
                        tsc.from_users,
                        tsc.not_from_users,
                        tsc.mentions,
                        tsc.hashtags           AS twitter_hashtags,
                        tsc.palavrasExatas     AS twitter_palavrasExatas,
                        tsc.palavrasQuePodeTer AS twitter_palavrasQuePodeTer,
                        tsc.excluirPalavras    AS twitter_excluirPalavras,
                        tsc.lang               AS twitter_lang,

                        ysc.id            AS youtube_search_config_id,
                        ysc.dork          AS youtube_dork,
                        ysc.videoDuration,
                        ysc.videoDefinition,
                        ysc.videoEmbeddable,
                        ysc.ytOrder,
                        ysc.publishAfter,
                        ysc.lang          AS youtube_lang,

                        isc.id            AS instagram_search_config_id,

                        GROUP_CONCAT(ish.hashtag_value ORDER BY ish.hashtag_value SEPARATOR ',') AS instagram_hashtags,
                        GROUP_CONCAT(ihi.id ORDER BY ish.hashtag_value SEPARATOR ',') AS instagram_hashtag_index_ids

                    FROM
                        monitoramento m

                    LEFT JOIN google_search_config  AS gsc
                        ON gsc.monitoramento_id = m.id
                        AND gsc.client_id        = m.client_id

                    LEFT JOIN twitter_search_config AS tsc
                        ON tsc.monitoramento_id = m.id
                        AND tsc.client_id        = m.client_id

                    LEFT JOIN youtube_search_config AS ysc
                        ON ysc.monitoramento_id = m.id
                        AND ysc.client_id        = m.client_id

                    LEFT JOIN instagram_search_config AS isc
                        ON isc.monitoramento_id = m.id
                        AND isc.client_id        = m.client_id

                    LEFT JOIN instagram_search_config_hashtags AS ish
                        ON ish.instagram_search_config_id = isc.id   

                    LEFT JOIN index_hashtags_instagram AS ihi
                        ON ihi.hashtag_instagram_id = ish.id         

                    WHERE
                        m.ativo = 1

                    GROUP BY
                        m.id,
                        m.client_id,
                        m.titulo,
                        m.descricao,
                        m.create_at,
                        m.data_inicio,
                        m.data_fim,
                        m.ativo,

                        gsc.id,
                        gsc.dork,
                        gsc.sites,
                        gsc.noInSites,
                        gsc.inUrl,
                        gsc.inTitle,
                        gsc.inText,
                        gsc.palavrasExatas,
                        gsc.palavrasQuePodeTer,
                        gsc.excluirPalavras,

                        tsc.id,
                        tsc.dork,
                        tsc.from_users,
                        tsc.not_from_users,
                        tsc.mentions,
                        tsc.hashtags,
                        tsc.palavrasExatas,
                        tsc.palavrasQuePodeTer,
                        tsc.excluirPalavras,
                        tsc.lang,

                        ysc.id,
                        ysc.dork,
                        ysc.videoDuration,
                        ysc.videoDefinition,
                        ysc.videoEmbeddable,
                        ysc.ytOrder,
                        ysc.publishAfter,
                        ysc.lang,

                        isc.id;
                
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
    
            await conn.finish() // commita e finaliza a conexão
            return monitoramentosFullAtivos
        } catch (err: any) {
            await conn.rollBack()
            Logger.error(err.message || err.toString(), "getMonitoramentosDeClientesAtivosEConfigs")
            return false
        }
    },

    desativarMonitoramento: async (client_id:number, monitoramento_id:number):Promise<boolean> => { 

        const res  = await execute(`
            UPDATE monitoramento m
            SET ativo = 0
            WHERE m.id = ?
            AND m.client_id = ?
        `, [monitoramento_id, client_id])

       return !res.error

    },

    ativarMonitoramento: async (client_id:number, monitoramento_id:number):Promise<boolean> => {

        const conn = await multiTransaction()

        try {

            const resCheck = await conn.execute(`
                    select max_monitoramentos_ativos, (
                        select count(id) from monitoramento where ativo = 1 and client_id = ?
                    ) as total_ativos
                    from client_config
                    where client_id = ?
                `, [client_id, client_id])

            if(resCheck.error){
                throw new Error(resCheck.error_message)
            }

            const rows = resCheck.rows as { max_monitoramentos_ativos:number, total_ativos:number }[]
            if(rows.length === 0){
                throw new Error("Cliente não encontrado ou sem configuração de monitoramentos ativos.")
            }

            if(rows[0].total_ativos >= rows[0].max_monitoramentos_ativos){
                throw new Error("Limite máximo de monitoramentos ativos atingido.")
            }

            const res  = await conn.execute(`
               UPDATE monitoramento SET ativo = 1 WHERE id = ? AND client_id = ?
            `, [monitoramento_id, client_id])

            if(res.error){
                throw new Error(res.error_message)
            }

            await conn.finish() // commita e finaliza a conexão
            return true
            
        } catch (error) {
            Logger.error(error, "repositories/monitoramento.ativarMonitoramento")
            await conn.rollBack()
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
            .filter(key => key !== "id" && key !== 'ativo' && mon[key] !== undefined)
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

        const res0 = await multi.execute(`select id from publish where monitoramento_id = ? and client_id = ?`, [id, client_id])

        if(res0.error){
            console.log("erro0:", res0);
            await multi.rollBack()
            return false
        }

        const idsHashtagPublish = (res0.rows as any[]).map(r => r.id)

        if(idsHashtagPublish.length > 0){
            const binds = idsHashtagPublish.map(_ => "?").join(",")
            const res0Ids = await multi.execute(`delete from publish where id in (${binds})`, idsHashtagPublish)
            
            if(res0Ids.error){
                console.log("erro0Ids:", res0Ids);
                await multi.rollBack()
                return false
            }
        }

        const res1 = await multi.execute(`delete from publish where monitoramento_id = ? and client_id = ?`, [id, client_id])

        if(res1.error){
            console.log("erro1:", res1);
            await multi.rollBack()
            return false
        }

        const res2 = await multi.execute(`select id from instagram_search_config_hashtags where instagram_search_config_id = ?`, [id])

        const ids = (res2.rows as any[]).map(r => r.id)
        
        if(ids.length > 0){
           
            const binds = ids.map(_ => "?").join(",")
            const res2Ids = await multi.execute(`delete from instagram_search_config_hashtags where id in (${binds})`, ids)
            
            if(res2Ids.error){
                console.log("erro2Ids:", res2Ids);
                await multi.rollBack()
                return false
            }

        }

        const resInstagramDeleteSearchConfig = await multi.execute(`delete from instagram_search_config where monitoramento_id = ? and client_id = ?`, [id, client_id])

        if(resInstagramDeleteSearchConfig.error){
            console.log("erroInstagramDeleteSearchConfig:", resInstagramDeleteSearchConfig);
            await multi.rollBack()
            return false
        }

        await multi.execute(`delete from twitter_search_config where monitoramento_id = ? and client_id = ?`, [id, client_id])
        await multi.execute(`delete from youtube_search_config where monitoramento_id = ? and client_id = ?`, [id, client_id])
        await multi.execute(`delete from google_search_config  where monitoramento_id = ? and client_id = ?`, [id, client_id])

        await publishRepo.deleteByMonitoramentoId(client_id, id)
        // deletar publicações

        const res3 = await multi.execute(`delete from monitoramento where id = ? and client_id = ?`, [id, client_id])

        if(res3.error){
            console.log("erro3:", res3.error_message);
            await multi.rollBack()
            return false
        }

        await multi.finish()
        return true
         
    },

    updateConfig: async (client_id:number, monitoramento_id:number, config:ConfigMap) => {

        const conn = await multiTransaction()

        try {

            let setStr = `set `
            const values = []
            
            if(config.twitter_search_config){

                const twitterCfg = config.twitter_search_config;

                for (const key of Object.keys(twitterCfg) as (keyof typeof twitterCfg)[]) {
                    if (key !== 'id') {
                        setStr += `${key} = ?, `
                        const value = twitterCfg[key];
                        values.push(value)
                    }
                }

                values.push(monitoramento_id, client_id)

                let execstr = `update twitter_search_config ${setStr} where monitoramento_id = ? where client_id = ?`

                const res = await conn.execute(execstr, values)

                if(res.error){
                    throw new Error(res.error_message)
                }
                
            }

            if(config.youtube_search_config){
                const youtubeCfg = config.youtube_search_config;

                for (const key of Object.keys(youtubeCfg) as (keyof typeof youtubeCfg)[]) {
                    if (key !== 'id') {
                        setStr += `${key} = ?, `
                        const value = youtubeCfg[key];
                        values.push(value)
                    }
                }

                values.push(monitoramento_id, client_id)

                let execstr = `update youtube_search_config ${setStr} where monitoramento_id = ? where client_id = ?`

                const res = await conn.execute(execstr, values)

                if(res.error){
                    throw new Error(res.error_message)
                }
            }

            if(config.google_search_config){
                const googleCfg = config.google_search_config;

                for (const key of Object.keys(googleCfg) as (keyof typeof googleCfg)[]) {
                    if (key !== 'id') {
                        setStr += `${key} = ?, `
                        const value = googleCfg[key];
                        values.push(value)
                    }
                }

                values.push(monitoramento_id, client_id)

                let execstr = `update google_search_config ${setStr} where monitoramento_id = ? where client_id = ?`

                const res = await conn.execute(execstr, values)

                if(res.error){
                    throw new Error(res.error_message)
                }
            }

            if(config.instagram_search_config){

                const instagramConfigId = config.instagram_search_config.id

                const res = await conn.execute(`delete from instagram_search_config_hashtags where instagram_search_config_id = ?`, [instagramConfigId])
                if(res.error){
                    throw new Error(res.error_message)
                }

                const hashtags  = config.instagram_search_config.hashtags ? config.instagram_search_config.hashtags.map((h:any) => [ instagramConfigId, h.hashtag_value]) : []
                const hashtags2 = config.instagram_search_config.hashtags ? config.instagram_search_config.hashtags.map((h:any) => [ 0, h.hashtag_value]) : []
                const bindings  = hashtags.map(_ => "(?,?)")

                const res2 = await conn.execute(`insert into instagram_search_config_hashtags (instagram_search_config_id, hashtag_value) values ${bindings}`, [hashtags])
                if(res2.error){
                    throw new Error(res2.error_message)
                }

               await conn.execute(`insert into index_hashtags_instagram (hashtag_instagram_id, hashtag_value) values ${bindings}`, [hashtags2])

            }

            await conn.finish()
            return true

        } catch (error) {
            Logger.error(error, "repositories/monitoramento.updateConfig")
            return false
        }

    },

    deleteConfig: async (client_id:number, monitoramento_id:number, config:ConfigMapSimple) => {

        try {

            const conn = await multiTransaction()

            if(config.instagram_search_config){

                const res = await conn.execute(`delete from instagram_search_config where monitoramento_id = ? and client_id = ?`, [monitoramento_id, client_id])
                if(res.error){
                    throw new Error(res.error_message)
                }

            }

            if(config.twitter_search_config){

                const res = await conn.execute(`delete from twitter_search_config where monitoramento_id = ? and client_id = ?`, [monitoramento_id, client_id])
                if(res.error){
                    throw new Error(res.error_message)
                }
                
            }

            if(config.youtube_search_config){

                const res = await conn.execute(`delete from youtube_search_config where monitoramento_id = ? and client_id = ?`, [monitoramento_id, client_id])
                if(res.error){
                    throw new Error(res.error_message)
                }

            }

            if(config.google_search_config){

                const res = await conn.execute(`delete from google_search_config where monitoramento_id = ? and client_id = ?`, [monitoramento_id, client_id])
                if(res.error){
                    throw new Error(res.error_message)
                }

            }

            await conn.finish()
            return true

        } catch (error) {
            Logger.error(error, "repositories/monitoramento.deleteConfig")
            return false
        }

    },


    addConfig: async (client_id:number, monitoramento_id:number, config:ConfigMap) => { 
        
        const conn = await multiTransaction()

        try {

            if(config.instagram_search_config){
                
                const res = await conn.insertOnce(`insert into instagram_search_config (monitoramento_id, client_id) values (?,?)`, [monitoramento_id, client_id])
                
                if(res.error){
                    throw new Error(res.error_message)
                }

                config.instagram_search_config.id = res.lastInsertId
                
                if(config.instagram_search_config.hashtags){
                    
                    const hashtags = config.instagram_search_config.hashtags.map((h:any) => [res.lastInsertId, h.hashtag_value])
                    const bindings = hashtags.map((h:any) => "(?,?)").join(",")
                    
                    const res2     = await conn.execute(`insert into instagram_search_config_hashtags (instagram_search_config_id, hashtag_value) values ${bindings}`, hashtags.flat())
                    
                    if(res2.error){
                        throw new Error(res2.error_message)
                    }

                }

            }

            if(config.twitter_search_config){

                const res = await conn.insertOnce(`
                    insert into twitter_search_config 
                        (monitoramento_id, client_id, dork, from_users, not_from_users, mentions, hashtags, palavrasExatas, palavrasQuePodeTer, excluirPalavras, lang) 
                    values (?,?,?,?,?,?,?,?,?,?,?)`, [ 
                        monitoramento_id, 
                        client_id, 
                        config.twitter_search_config.dork, 
                        config.twitter_search_config.fromUsers ? config.twitter_search_config.fromUsers.join(' ') : null,
                        config.twitter_search_config.notFromUsers ? config.twitter_search_config.notFromUsers.join(' ') : null,
                        config.twitter_search_config.mentions ? config.twitter_search_config.mentions.join(' ') : null,
                        config.twitter_search_config.hashtags ? config.twitter_search_config.hashtags.join(' ') : null,
                        config.twitter_search_config.palavrasExatas ? config.twitter_search_config.palavrasExatas.join(' ') : null,
                        config.twitter_search_config.palavrasQuePodeTer ? config.twitter_search_config.palavrasQuePodeTer.join(' ') : null,
                        config.twitter_search_config.excluirPalavras ? config.twitter_search_config.excluirPalavras.join(' ') : null,
                        config.twitter_search_config.lang
                    ])

                if(res.error){
                    throw new Error(res.error_message)
                }
                config.twitter_search_config.id = res.lastInsertId

            }

            if(config.youtube_search_config){
                
                const res = await conn.insertOnce(`
                    insert into youtube_search_config 
                        (monitoramento_id, client_id, dork, videoDuration, videoDefinition, videoEmbeddable, ytOrder, publishAfter, lang) 
                    values (?,?,?,?,?,?,?,?,?)`, [
                        monitoramento_id, 
                        client_id,
                        config.youtube_search_config.dork,
                        config.youtube_search_config.videoDuration,
                        config.youtube_search_config.videoDefinition,
                        config.youtube_search_config.videoEmbeddable ? 1 : 0,
                        config.youtube_search_config.ytOrder,
                        config.youtube_search_config.publishAfter ? new Date(config.youtube_search_config.publishAfter) : null,
                        config.youtube_search_config.lang
                    ])

                if(res.error){
                    throw new Error(res.error_message)
                }

                config.youtube_search_config.id = res.lastInsertId

            }

            if(config.google_search_config){

                const res = await conn.insertOnce(`
                    insert into google_search_config 
                        (monitoramento_id, client_id, dork, sites, noInSites, inUrl, inTitle, inText, palavrasExatas, palavrasQuePodeTer, excluirPalavras) 
                    values (?,?,?,?,?,?,?,?,?,?,?)`, [
                        monitoramento_id,
                        client_id,
                        config.google_search_config.dork,
                        config.google_search_config.sites ? config.google_search_config.sites.join(' ') : null, 
                        config.google_search_config.notInSites ? config.google_search_config.notInSites.join(' ') : null,
                        config.google_search_config.inUrl,
                        config.google_search_config.inTitle,
                        config.google_search_config.inText,
                        config.google_search_config.palavrasExatas ? config.google_search_config.palavrasExatas.join(' ') : null,
                        config.google_search_config.palavrasQuePodeTer ? config.google_search_config.palavrasQuePodeTer.join(' ') : null,
                        config.google_search_config.excluirPalavras ? config.google_search_config.excluirPalavras.join(' ') : null
                    ])

                if(res.error){
                    throw new Error(res.error_message)
                }

                config.google_search_config.id = res.lastInsertId
            
            }

            await conn.finish()
            return true

        } catch (error) {
            conn.rollBack()
            Logger.error(error, "repositories/monitoramento.addConfig")
            return false
        }

    }

}