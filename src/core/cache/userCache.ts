import CacheRedis from "./CacheRedis";
import { UserDetail } from "../../types/User.d";


const saveDataUser = async (dataUser:UserDetail) => {
    try {
        const redis = CacheRedis.getInstance()
        const redisClient = redis.getClient();
        return await redisClient.set("user:"+dataUser.id.toString(), JSON.stringify(dataUser), 'EX', 3600) == 'OK'
    } catch (err) {
        console.error("Erro ao usar o Redis:", err);
        return false
    }
}

const getDataUser = async (id:number):Promise<UserDetail|false> => {
    try {
        const redis = CacheRedis.getInstance()
        const redisClient = redis.getClient();
        let datastr = await redisClient.get("user:"+id.toString())
        if(!datastr) return false 
        return JSON.parse(datastr)
    } catch (err) {
        console.error("Erro ao usar o Redis:", err);
        return false
    }
}

const deleteDataUser = async (id:number) => {
    const redis = CacheRedis.getInstance()
    const redisClient = redis.getClient();
    return await redisClient.del("user:"+id.toString());
}

const quit = async () => await CacheRedis.getInstance().quit()

export default {
    quit,
    saveDataUser,
    getDataUser,
    deleteDataUser
}