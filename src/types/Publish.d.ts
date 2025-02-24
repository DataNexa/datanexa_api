
enum Plataforma {
    GOOGLE = 1, FACEBOOK = 2, INSTAGRAM = 3, TWITTER = 4, YOUTUBE = 5
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

export { Publish, PublishClient, Plataforma }