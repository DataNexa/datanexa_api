import { FilterQuery } from "../types/FilterQuery";
import { PublishClient } from "../types/Publish";
import { DatabaseMap } from "../types/DatabaseMap";
import queryBuilder from "../core/database/queryBuilder";
import { execute, insertOnce, multiTransaction, query } from "../core/database/mquery";
import updateBuild from "../core/database/updateBuild";

const fields:{[key:string]:string} = {
    id:'publish.id',
    texto:'publish.texto',
    plataforma:'publish.plataforma',
    dataPublish:'publish.data_pub',
    link:'publish.link',
    temImagem:'publish.temImagem',
    temVideo:'publish.temVideo',
    curtidas:'publish.curtidas',
    visualizacoes:'publish.visualizacoes',
    compartilhamento:'publish.compartilhamento',
    sentimento:'publish.sentimento',
    valoracao:'publish.valoracao',
    client_id:'publish.client_id',
    mensao_id:'publish.mensao_id',
    monitoramento_id:'publish.monitoramento_id'
}

const defaultPublish:PublishClient = {
    monitoramento_id:0,
    cliente_id:0,
    mensao_id:0,
    id:0,
    plataforma:1,
    link:'',
    texto:'',
    sentimento:0,
    temImagem:false,
    temVideo:false,
    dataPublish:new Date(),
    valoracao:0.0,
    engajamento:undefined
}

const mapDatabase:DatabaseMap = {
    table:'publish',
    fields:fields,
    join:['>client'],
    fieldsSerch:{
        texto:'publish.texto'
    }
}


export default {

    get:async(filter:FilterQuery):Promise<PublishClient[]|undefined> => {

        const dataQuery = queryBuilder(mapDatabase, filter)
        
        if(!dataQuery) return undefined

        const res = await query(dataQuery.query, dataQuery.values)
        
        if(res.error) return undefined

        const publicacoes = (res.rows as any[]).map(data => ({
            ...defaultPublish,
            ...data
          })) as PublishClient[]

        return publicacoes
        
    },

    set: async (pub:PublishClient):Promise<PublishClient|false> => {

        const res = await insertOnce(`insert into publish (
                monitoramento_id,
                mensao_id,
                client_id,
                plataforma,
                link,
                texto,
                temImagem,
                temVideo,
                data_pub,
                curtidas,
                visualizacoes,
                compartilhamento,
                sentimento,
                valoracao
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                pub.monitoramento_id,
                pub.mensao_id,
                pub.cliente_id,
                pub.plataforma, 
                pub.link, 
                pub.texto, 
                pub.temImagem ? 1 : 0,
                pub.temVideo ? 1 : 0,
                pub.dataPublish,
                pub.engajamento ? pub.engajamento.curtidas : 0,
                pub.engajamento ? pub.engajamento.visualizacoes : 0,
                pub.engajamento ? pub.engajamento.compartilhamento : 0,
                pub.sentimento,
                pub.valoracao
            ])

        if(res.error) {
            return false
        }

        pub.id = res.lastInsertId

        return pub

    },

    update: async (pub:PublishClient):Promise<boolean> => {

        type PubNorm = {
            sentimento:number,
            valoracao:number,
            curtidas:number,
            compartilhamento:number,
            visualizacoes:number
        }

        let pubNormalize:PubNorm = {
            sentimento:pub.sentimento,
            valoracao:pub.valoracao,
            curtidas:pub.engajamento ? pub.engajamento.curtidas : 0,
            compartilhamento:pub.engajamento ? pub.engajamento.compartilhamento : 0,
            visualizacoes:pub.engajamento ? pub.engajamento.visualizacoes : 0,
        } 

        var q = updateBuild(pubNormalize, 'publish', ['id'])

        var arr = Object.values(pubNormalize)
        arr.push(pub.id)
        
        return !(await execute(q, arr)).error

    },

    setMany: async (pubs:PublishClient[]):Promise<boolean> => {

        var q = `insert into publish (
                monitoramento_id,
                mensao_id,
                client_id,
                plataforma,
                link,
                texto,
                temImagem,
                temVideo,
                data_pub,
                curtidas,
                visualizacoes,
                compartilhamento,
                sentimento,
                valoracao
            ) values ${pubs.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ')}`

        const binds = pubs.flatMap(pub => [
            pub.monitoramento_id,
            pub.mensao_id,
            pub.cliente_id,
            pub.plataforma, 
            pub.link, 
            pub.texto, 
            pub.temImagem ? 1 : 0,
            pub.temVideo ? 1 : 0,
            pub.dataPublish,
            pub.engajamento ? pub.engajamento.curtidas : 0,
            pub.engajamento ? pub.engajamento.visualizacoes : 0,
            pub.engajamento ? pub.engajamento.compartilhamento : 0,
            pub.sentimento,
            pub.valoracao
        ]);

        return !(await execute(q, binds)).error

    },

    deleteByMonitoramentoId: async (client_id:number, monitoramento_id:number):Promise<boolean> => {
        
        const conn = await multiTransaction()

        try {
            const res0 = await conn.query(`select id from publish where client_id = ${client_id} and monitoramento_id = ${monitoramento_id}`)

            if(res0.error) 
                throw new Error(`Erro ao buscar publicações: ${res0.error}`)

            const ids = (res0.rows as any[]).map(row => row.id).join(',')
            const res1 = await conn.execute(`delete from hashtag where client_id = ${client_id} and publish_id in (${ids})`)

            if(res1.error) 
                throw new Error(`Erro ao deletar hashtags: ${res1.error}`)

            const res2 = await conn.execute(`delete from publish where client_id = ${client_id} and monitoramento_id = ${monitoramento_id}`)
            if(res2.error) 
                throw new Error(`Erro ao deletar publicações: ${res2.error}`)

            await conn.finish()
            return true

        } catch (error) {
            await conn.rollBack()
            return false
        }
       
    },

    del: async (client_id:number, id?:number):Promise<boolean> => {

        var q = id ? `delete from publish where client_id = ${client_id} and id = ${id}` :
            `delete from publish where client_id = ${client_id}`
        return !(await execute(q)).error

    }

}