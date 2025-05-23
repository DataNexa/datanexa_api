import globals from "../../app/globals";
import { createPool, RowDataPacket, QueryError, QueryResult, Pool, PoolConnection, } from "mysql2/promise";

const database = globals.database

const mysqli   = createPool({
    host:database.host,
    user:database.user,
    password:database.pass,
    port:database.port,
    database:database.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})



export {
    mysqli,
    RowDataPacket,
    QueryError,
    QueryResult,
    Pool,
    PoolConnection
}