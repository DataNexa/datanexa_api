import { execute, query, multiTransaction } from "../util/query"

interface tarefas_i {
    tarefa_id:number,
    tarefa:string,
    descricao:string,
    status:number,
    createAt:string,
    dataLimite:string
}

interface campanhas_i {
    id:number,
    nome:string,
    descricao:string,
    ativo:number
    tarefas?:tarefas_i[]
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
    row?:campanhas_i
}

const campanhas_repo = {
        
    
    list: async (client_id:number, injectString:string=''):Promise<campanhas_i[]|false> => {

        const resp = await query(` 
            SELECT  
                campanhas.id, campanhas.nome,  campanhas.descricao,  campanhas.ativo,
                tarefas.id as tarefa_id, tarefas.tarefa, tarefas.descricao, tarefas.status, tarefas.createAt, tarefas.dataLimite
            from campanhas 
                left join tarefas on tarefas.campanha_id = campanhas.id 
                join client  on campanhas.client_id = client.id 
    
            WHERE  client.id = ? and campanhas.ativo = 1
        ${injectString}`, {
            binds:[client_id]
        })

        if(resp.error) return false 

        const campanhas:campanhas_i[] = []
        let lastId = 0

        let campanha_atual:campanhas_i = {
            id:0,
            nome:'',
            descricao:'',
            ativo:0,
            tarefas:[]
        }

        for(const row of resp.rows as any[]){
            if(row.id != lastId){
                if(lastId > 0)
                    campanhas.push(campanha_atual)
                lastId = row.id
                campanha_atual = {
                    id:row.id,
                    nome:row.nome,
                    descricao:row.descricao,
                    ativo:row.ativo,
                    tarefas:[]
                }
            }
            if(row.tarefa_id){
                let tarefa:tarefas_i = {
                    tarefa_id:row.tarefa_id,
                    tarefa:row.tarefa,
                    descricao:row.descricao,
                    status:row.status,
                    createAt:row.createAt,
                    dataLimite:row.dataLimite
                }
                campanha_atual.tarefas?.push(tarefa)
            }
            
        }

        campanhas.push(campanha_atual)

        return campanhas

    },    
    
    unique: async (client_id:number,id:number):Promise<unique_response> =>  {
        
        const resp = await query(` 
        SELECT  
            campanhas.id,  
            campanhas.client_id,  
            campanhas.nome,  
            campanhas.descricao,  
            campanhas.ativo
        from campanhas 
             join client on campanhas.client_id = client.id 
 
         WHERE  client.id = ? 
            and campanhas.id = ? `, {
            binds:[client_id,id]
        })

        if(resp.error) return {
            error:true,
            code:500,
            message:'Erro no servidor'
        } 

        const rows = (resp.rows as campanhas_i[])

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

    },    
    
    create: async (client_id:number,nome:string,descricao:string,ativo:number):Promise<create_response> => {
            
        const resp = await execute(`
        insert into campanhas(client_id, nome, descricao, ativo) 
        VALUES (?,?,?,?)
         `, {
            binds:[client_id,nome,descricao,ativo]
        })

        if(resp.error && resp.error_code == 1062) return {
            code:500,
            error:true,
            message:'Registro Duplicado',
            insertId:0
        } 

        if(resp.error && resp.error_code == 1366) return {
            code:400,
            error:true,
            message:'Campo enviado mal formatado',
            insertId:0
        } 

        if(resp.error) return {
            code:500,
            error:true,
            message:'Erro no servidor',
            insertId:0
        }

        return {
            code:200,
            error:false,
            message:'',
            insertId: (resp.rows as any).insertId
        }

    },    
    
    update: async (client_id:number,nome:string,descricao:string,ativo:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update campanhas      join client on campanhas.client_id = client.id 
        set  campanhas.client_id = ?,  campanhas.nome = ?,  campanhas.descricao = ?,  campanhas.ativo = ?
         WHERE  client.id = ?  and campanhas.id = ? `, {
            binds:[client_id,nome,descricao,ativo,client_id,id]
        })

        return !resp.error
    },    
    
    delete: async (client_id:number,id:number):Promise<boolean> => {
        
        const conn = await multiTransaction()

        const exe1 = await conn.execute(`
            delete from tarefas where campanha_id = ?
        `, {
            binds:[id]
        })

        if(exe1.error){
            await conn.rollBack()
            return false
        }

        const resp = await conn.execute(`
         delete campanhas 
           from campanhas 
               join client on campanhas.client_id = client.id 
 
        WHERE  client.id = ?   and campanhas.id = ? `, {
            binds:[client_id,id]
        })

        if(resp.error){
            await conn.rollBack()
            return false
        }

        await conn.finish()
        return true

    }

    
}

export { campanhas_repo, campanhas_i }