type ConfigMapSimple = {
    instagram_search_config?: boolean,
    twitter_search_config?: boolean,
    google_search_config?: boolean,
    youtube_search_config?: boolean
}

type ConfigMap = {
    instagram_search_config?: {
        id:number,
        hashtags?: { hashtag_instagram_id:number, hashtag_value:string }[]
    },
    twitter_search_config?: {
        id:number,
        hashtags?: string[],
        dork?: string,
        fromUsers?: string[],
        notFromUsers?: string[],
        mentions?: string[],
        palavrasExatas?: string[],
        palavrasQuePodeTer?: string[],
        excluirPalavras?: string[],
        lang?: string
    },
    google_search_config?: {
        id:number,
        dork?: string,
        sites?: string[],
        notInSites?: string[],
        inUrl?: string,
        inTitle?: string,
        inText?: string,
        palavrasExatas?: string[],
        palavrasQuePodeTer?: string[],
        excluirPalavras?: string[],
        lang?: string
    },
    youtube_search_config?: {
        id:number,
        dork?: string,
        videoDuration?: string,
        videoDefinition?: string,
        videoEmbeddable?: boolean,
        ytOrder?: string,
        publishAfter?: Date,
        lang?: string
    }
}


export { ConfigMapSimple, ConfigMap }