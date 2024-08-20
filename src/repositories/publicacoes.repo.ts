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

    add: async (monitoramento_id:number, titulo:string, texto:string, avaliacao:number, link:string, local_pub:string, data_pub:string) => {

        const resp = await execute(`
            insert into 
                publicacoes 
                   (monitoramento_id, titulo, texto, avaliacao, link, local_pub, data_pub, curtidas, compartilhamento, visualizacoes )
            values (?,?,?,?,?,?,?,0,0,0)
        `, {
            binds:[ monitoramento_id, titulo, texto, avaliacao, link, local_pub, data_pub ]
        })

        return resp.error

    },
        
    
    list: async (monitoramento_id:number,client_id:number, injectString:string=''):Promise<publicacoes_i[]|false> => {
            
        const resp = await query(` 
            SELECT  
                publicacoes.id,  
                publicacoes.monitoramento_id,  
                publicacoes.titulo,  
                publicacoes.texto,  
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
            ORDER BY id DESC
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