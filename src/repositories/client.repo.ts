import { type_user } from "../libs/User"
import { query, execute } from "../util/query"

interface client_i {
    nome:string,
    slug:string,
    ativo:number
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
    row?:client_i
}


const client_repo = {

    getSlugById: async (client_id:number) => {

        const getSlug = await query('select slug from client where id = ?', {
            binds:[client_id]
        })

        if(getSlug.error)
            return false

        let arr = getSlug.rows as {slug:string}[]

        if(arr.length == 0) return false

        return arr[0]

    },

    register: async (nome:string,slug:string,ativo:number):Promise<create_response> => {
            
        const resp = await execute(`
        insert into client(nome, slug, ativo) 
        VALUES (?,?,?)
        
        
         `, {
            binds:[nome,slug,ativo]
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
    
    list: async ( injectString:string=''):Promise<client_i[]|false> => {
            
        const resp = await query(` 
        SELECT  client.id,  client.nome,  client.slug,  client.ativo
        from client 
         
        
        ${injectString}`, {
            binds:[]
        })

        if(resp.error) return false 

        return (resp.rows as client_i[])
    },    
    
    update: async (nome:string,slug:string,ativo:number,id:number):Promise<boolean> => {
        
        const resp = await execute(`update client set  nome = ?,  slug = ?,  ativo = ?         and client.id = ? `, {
            binds:[nome,slug,ativo,id]
        })

        return !resp.error
    }

}

export { client_repo, client_i }