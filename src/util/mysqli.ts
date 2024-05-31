import globals from "../config/globals";
import { createPool, RowDataPacket, QueryError, QueryResult, Pool, PoolConnection, } from "mysql2/promise";

const database = globals.database

const mysqli   = () => createPool({
    host:database.host,
    user:database.user,
    password:database.pass,
    port:database.port,
    database:database.name
})



export {
    mysqli,
    RowDataPacket,
    QueryError,
    QueryResult,
    Pool,
    PoolConnection
}