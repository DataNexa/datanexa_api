import { mysqli, PoolConnection } from "./mysqli"
import globals from "../../config/globals"
import { QueryResponse, QueryResponseLastId } from "../../types/QueryResponse";



class MultiTransaction {

    private conn:PoolConnection | null = null;
    private transaction_num:number = 0
    private isBegin:boolean = false

    constructor(conn:PoolConnection | null){
        this.conn = conn
    }

    getTransactionNumber(){
        return this.transaction_num
    }

    async begin(){
        if(!this.conn || this.isBegin){
            return false
        }
        await this.conn.beginTransaction()
        this.isBegin = true
        return true
    }
    
    async execute(query:string, binds:[] = []):Promise<QueryResponse>{
        try {
            if(!this.conn) return {
                error:true,
                error_code:1,
                error_message:'Not Connected',
                rows:[]
            }
            const [result] = await this.conn.execute(query, binds)
            return {
                error_message:'',
                error_code:1,
                error:false,
                rows:result
            }
        } catch (error) {
            await this.rollBack()
            
            return {
                error:true,
                error_code:(error as any).errno,
                error_message:(error as any).sqlMessage,
                rows:[]
            }
            
        }

    }

    async query(query:string, binds:[] = []):Promise<QueryResponse>{
        try {
            if(!this.conn) return {
                error_message:'Not Connected',
                error:true,
                error_code:1,
                rows:[]
            }
            const [result] = await this.conn.query(query, binds)
            return {
                error_message:'',
                error_code:0,
                error:false,
                rows:result
            }
        } catch (error) {
            await this.rollBack()
            return {
                error:true,
                error_code:(error as any).errno,
                error_message:(error as any).sqlMessage,
                rows:[]
            }
            
        }
    }

    async insertOnce(query: string, binds: []): Promise<QueryResponseLastId> {
        try {
            if (!this.conn) {
                return {
                    error: true,
                    error_code: 1,
                    error_message: 'Not Connected',
                    rows: [],
                    lastInsertId:0
                };
            }
    
            const [result, metadata] = await this.conn.execute(query, binds);
    
            return {
                error_message: '',
                error_code: 0,
                error: false,
                rows: result,
                lastInsertId: (metadata as any).insertId // Retorna o lastInsertId
            };
        } catch (error) {
            await this.rollBack();
            return {
                error: true,
                error_code: (error as any).errno,
                error_message: (error as any).sqlMessage,
                rows: [],
                lastInsertId:0
            };
        }
    }

    public async rollBack(){
        if(!this.conn) return
        await this.conn.rollback()
        this.conn.release();
        this.conn = null
    }

    async finish() {
        if (!this.conn) return;
        try {
            await this.conn.commit();
        } finally {
            this.conn.release();
            this.conn = null;
        }
    }

}

const multiTransaction = async ():Promise<MultiTransaction> => {
    
    const conn = await mysqli.getConnection()
    
    const mult = new MultiTransaction(conn)
    await mult.begin()
    return mult
}


const insertOnce = async (query:string, binds:[] = []):Promise<QueryResponseLastId> => {
    try {

        let [result, metadata] = await mysqli.execute(query, binds)

        return {
            error:false,
            rows:result,
            error_code:0,
            error_message:'',
            lastInsertId: (metadata as any).insertId 
        }
   
    } catch (e) {

        if(!globals.production)
            console.log(e)
        
        return {
            error_code: (e as any).errno,
            error_message: (e as any).sqlMessage,
            rows:[],
            error:true,
            lastInsertId:0
        }
    }


}

const query = async (query:string, binds:[] = []):Promise<QueryResponse> => { 
    try {

        let [result] = await mysqli.query(query, binds)

        return {
            error:false,
            rows:result,
            error_code:0,
            error_message:''
        }
   
    } catch (e) {

        if(!globals.production)
            console.log(e)
        
        return {
            error_code: (e as any).errno,
            error_message: (e as any).sqlMessage,
            rows:[],
            error:true
        }
    }
}


const execute = async (query:string, binds:[] = []):Promise<QueryResponse> => { 
    try {
        const [result] = await mysqli.execute(query, binds)
        return {
            error:false,
            rows:result,
            error_code:0,
            error_message:0
        }
    } catch (e) {

        if(!globals.production)
            console.log(e)
        
        return {
            error:true,
            rows:[],
            error_code:(e as any).errno,
            error_message:(e as any).sqlMessage
        }
    }
}



export { query , execute, multiTransaction, MultiTransaction } 