import createClient from "ioredis";

class CacheRedis {

    private static instance: CacheRedis;
    private redisClient: createClient;
    private connected: boolean = false;
    private error:boolean = false;
    private errorObj:Error | null = null;
    
    private constructor() {
        this.redisClient = new createClient();

        const quit = () => {
            this.quit().then(() => process.exit(0)).catch(() => process.exit(1));
        };
        process.on("SIGINT", quit);
        process.on("SIGTERM", quit);

        this.error = false 
        this.connected = true 
        this.errorObj = new Error("not error")

        this.redisClient.on("connect", () => this.connected = true);
        this.redisClient.on("error", (err) => {
            this.error = true 
            this.errorObj = err
        });
    }

    public static getInstance(): CacheRedis {
        if (!CacheRedis.instance) {
            CacheRedis.instance = new CacheRedis();
        }
        return CacheRedis.instance;
    }

    public getClient(): createClient {
        if (this.error || !this.connected) {
            throw new Error("Redis não está disponível.");
        }
        return this.redisClient;
    }


    public isConnected():boolean {
        return this.connected
    }

    public haveError():boolean {
        return this.error
    }

    public getError():Error | null {
        return this.errorObj
    }

    public async quit(): Promise<void> {
        if (this.redisClient.status === "ready") {
            await this.redisClient.quit();
            this.connected = false;
        } else {
            console.log("Conexão com o Redis já finalizada ou não iniciada.");
        }
    }
}

export default CacheRedis;