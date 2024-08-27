import { execute, query, multiTransaction } from "../util/query"

interface publicacoes_i {
    id:number,
    monitoramento_id:number,
    titulo:string,
    texto:string,
    avaliacao:number,
    link:string,
    local_pub:string,
    curtidas:number,
    compartilhamento:number,
    visualizacoes:number,
    data_pub:string
}

interface create_response {
    error:boolean,
    message:string,
    insertId:number,
    code:number
}

interface unique_response {
    error:boolean,
    message:string,
    code:number,
    row?:publicacoes_i
}

const publicacoes_repo = {

    filter_by_date: async (monitoramento_id:number, client_id:number, dataini:string, datafim:string) => {

        const q = await query(`
            SELECT  
                publicacoes.id,  
                publicacoes.monitoramento_id,  
                SUBSTRING(publicacoes.titulo, 1, 50) AS titulo,  
                SUBSTRING(publicacoes.texto, 1, 200) AS texto, 
                publicacoes.avaliacao,  
                publicacoes.link,  
                publicacoes.local_pub,  
                publicacoes.curtidas,  
                publicacoes.compartilhamento,  
                publicacoes.visualizacoes,  
                publicacoes.data_pub
            FROM publicacoes 
                JOIN monitoramento on publicacoes.monitoramento_id = monitoramento.id 
                JOIN client on monitoramento.client_id = client.id 
            WHERE monitoramento.id = ? 
                AND client.id = ? 
                AND publicacoes.data_pub BETWEEN ? AND ?
            ORDER BY id DESC;
        `, {
            binds:[monitoramento_id,client_id, dataini, datafim]
        })

        if(q.error){
            return []
        }

        return (q.rows as publicacoes_i[])

    },

    filter_links: async (monitoramento_id:number, links:string[]):Promise<string[]> => {

        if(links.length == 0) return []

        const placeholders = links.map(() => '?').join(', ');
        const q = `SELECT link FROM publicacoes WHERE link IN (${placeholders}) and monitoramento_id = ${monitoramento_id}`;

        const resp = await query(q, {
            binds:links
        })

        if(resp.error){
            return []
        }

        const links_listados  = (resp.rows as { link:string }[]).map(row => row.link)
        const links_filtrados = links.filter( link => !links_listados.includes(link)) 

        return links_filtrados

    },

    add: async (monitoramento_id:number, titulo:string, texto:string, avaliacao:number, link:string, local_pub:string, data_pub:string) => {

        const resp = await execute(`
            insert into 
                publicacoes 
                   (monitoramento_id, titulo, texto, avaliacao, link, local_pub, data_pub, curtidas, compartilhamento, visualizacoes )
            values (?,?,?,?,?,?,?,0,0,0)
        `, {
            binds:[ monitoramento_id, titulo, texto, avaliacao, link, local_pub, data_pub ]
        })

        return !resp.error

    },
        
    
    list: async (monitoramento_id:number,client_id:number, injectString:string=''):Promise<publicacoes_i[]|false> => {
            
        const resp = await query(` 
            SELECT  
                publicacoes.id,  
                publicacoes.monitoramento_id,  
                SUBSTRING(publicacoes.titulo, 1, 50) AS titulo,  
                SUBSTRING(publicacoes.texto, 1, 200) AS texto, 
                publicacoes.avaliacao,  
                publicacoes.link,  
                publicacoes.local_pub,  
                publicacoes.curtidas,  
                publicacoes.compartilhamento,  
                publicacoes.visualizacoes,  
                publicacoes.data_pub
            FROM publicacoes 
                JOIN monitoramento on publicacoes.monitoramento_id = monitoramento.id 
                JOIN client on monitoramento.client_id = client.id 
            WHERE monitoramento.id = ? and client.id = ? 
            ORDER BY id DESC LIMIT 300
        ${injectString}`, {
            binds:[monitoramento_id,client_id]
        })

        if(resp.error) return false 

        return (resp.rows as publicacoes_i[])
    },    
    
    unique: async (monitoramento_id:number,client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
            SELECT   publicacoes.id,  publicacoes.monitoramento_id,  publicacoes.titulo,  publicacoes.texto,  publicacoes.avaliacao,  publicacoes.link,  publicacoes.local_pub,  publicacoes.curtidas,  publicacoes.compartilhamento,  publicacoes.visualizacoes,  publicacoes.data_pub
                from publicacoes 
                join monitoramento on publicacoes.monitoramento_id = monitoramento.id 
                join client        on monitoramento.client_id = client.id 
    
              WHERE monitoramento.id = ? 
                and client.id        = ? 
                and publicacoes.id   = ? 
        `, {
            binds:[monitoramento_id,client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as publicacoes_i[])

        if(rows.length == 0) return {
            error:true,
            code:404,
            message:'Registro não encontrado'
        }  

        return {
            error:false,
            code:200,
            message:'',
            row: rows[0]
        }  

    }
}

export { publicacoes_repo, publicacoes_i }