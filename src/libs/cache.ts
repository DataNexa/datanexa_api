import { Redis } from "ioredis";
import { data_user_full_i } from "./session_manager";
const redis = new Redis()

const quit =  () => redis.quit().then(() => process.exit(0)).catch(() => process.exit(1))
process.on('SIGINT', quit)
process.on('SIGTERM', quit)

const saveDataUser = async (dataUser:data_user_full_i) => {
    return await redis.set(dataUser.user_id.toString(), JSON.stringify(dataUser), 'EX', 3600) == 'OK'
}

const getDataUser = async (user_id:number):Promise<data_user_full_i|false> => {
    let datastr = await redis.get(user_id.toString())
    if(!datastr) return false 
    return JSON.parse(datastr)
}

const deleteDataUser = async (user_id:number) => await redis.del(user_id.toString());


export default {
    saveDataUser,
    getDataUser,
    deleteDataUser
}