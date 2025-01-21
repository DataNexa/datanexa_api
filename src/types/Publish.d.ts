
enum Midia {
    WEB, INSTAGRAM, FACEBOOK, TWITTER, YOUTUBE
}

interface Publish {
    midia:Midia,
    link:String,
    texto:String,
    temImagem:Boolean,
    temVideo:Boolean,
    dataPublish:Date,
    avaliacao?:number,
    engajamento?:engajamento
}

interface PublishClient extends Publish {
    publish_id:number,
    monitoramento_id:number,
    cliente_id:number,
    expressao_id:number
}

type engajamento = {
    curtidas:number,
    compartilhamento:number,
    visualizacoes:number
}
