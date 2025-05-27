
type Client = {
    id:number,
    nome:string
}


type ClientConfig = {
    id:number,
    client_id:number,
    max_monitoramentos_ativos:number,
    instagram_app_id:number,
}

export { Client, ClientConfig }