import createClient from "ioredis";
import { UserDetail } from "../../types/User.d";

const redis = new createClient()

const quit =  () => redis.quit().then(() => process.exit(0)).catch(() => process.exit(1))
process.on('SIGINT', quit)
process.on('SIGTERM', quit)

const saveDataUser = async (dataUser:UserDetail) => {
    return await redis.set(dataUser.id.toString(), JSON.stringify(dataUser), 'EX', 3600) == 'OK'
}

const getDataUser = async (id:number):Promise<UserDetail|false> => {
    let datastr = await redis.get(id.toString())
    if(!datastr) return false 
    return JSON.parse(datastr)
}

const deleteDataUser = async (id:number) => await redis.del(id.toString());


export default {
    saveDataUser,
    getDataUser,
    deleteDataUser
}