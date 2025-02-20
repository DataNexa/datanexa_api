
enum Plataforma {
    GOOGLE, FACEBOOK, INSTAGRAM, TWITTER, YOUTUBE
}

interface Publish {
    id:number,
    plataforma:Plataforma,
    link:String,
    texto:String,
    temImagem:Boolean,
    temVideo:Boolean,
    dataPublish:Date,
    sentimento:number,
    valoracao:number,
    engajamento?:engajamento,
}

interface PublishClient extends Publish {
    monitoramento_id:number,
    cliente_id:number,
    mensao_id:number
}

type engajamento = {
    curtidas:number,
    compartilhamento:number,
    visualizacoes:number
}

export { Publish, PublishClient }