import { QueryResult } from "mysql2"

interface QueryResponse {
    error:boolean,
    rows:QueryResult | any[],
    error_code:any,
    error_message:any
}

interface QueryResponseLastId extends QueryResponse {
    lastInsertId:number
}

export { QueryResponse, QueryResponseLastId }