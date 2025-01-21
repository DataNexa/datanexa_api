
interface Monitoramento {
    hashid:string,
    titulo:string,
    descricao:string,
    mensoes:Mensao[]
}

interface Mensao {
    hashid:string,
    busca:Search,
    hashtags:string[]
}

interface MonitoramentoDetail extends Monitoramento {

}

interface MensaoDetail extends Mensao {

}

export { Monitoramento, Mensao, MonitoramentoDetail, MensaoDetail }