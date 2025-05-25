
type Monitoramento = {
    id:number,
    titulo:string,
    descricao:string
}

type MonitoramentoFull = {
    id:number,
    titulo:string,
    descricao:string,
    ativo:boolean,
    cliente_id:number,
    instagram_search_config?:{
        hashtags:{hashtag_instagram_id:number, hashtag_value:string}[],
    },
    twitter_search_config?:{
        hashtags:string[],
        dork:string,
        fromUsers:string[],
        notFromUsers:string[],
        mentions:string[],
        palavrasExatas:string[],
        palavrasQuePodeTer:string[],
        excluirPalavras:string[],
        lang:string,
    },
    youtube_search_config?:{
        dork:string,
        videoDuration:string,
        videoDefinition:string,
        videoEmbeddable:boolean,
        ytOrder:string,
        publishAfter:string,
        lang:string,
    },
    google_search_config?:{
        dork:string,
        sites:string[],
        notInSites:string[],
        inUrl:string,
        inTitle:string,
        inText:string,
        palavrasExatas:string[],
        palavrasQuePodeTer:string[],
        excluirPalavras:string[],
    }
}

export { Monitoramento, MonitoramentoFull }