import globals from "../config/globals";
import { createPool } from "mysql";

const database = globals.database

const mysqli   = createPool({
    host:database.host,
    user:database.user,
    password:database.pass,
    port:database.port,
    database:database.name
})

export default () => mysqli