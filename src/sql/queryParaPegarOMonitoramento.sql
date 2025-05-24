SELECT
    
    m.id            AS monitoramento_id,
    m.client_id,
    m.titulo,
    m.descricao,
    m.create_at,
    m.data_inicio,
    m.data_fim,
    m.ativo,

    gsc.id                 AS google_search_config_id,
    gsc.dork               AS google_dork,
    gsc.sites,
    gsc.noInSites,                 
    gsc.inUrl,
    gsc.inTitle,
    gsc.inText,
    gsc.palavrasExatas      AS google_palavrasExatas,
    gsc.palavrasQuePodeTer  AS google_palavrasQuePodeTer,
    gsc.excluirPalavras     AS google_excluirPalavras,

    tsc.id                 AS twitter_search_config_id,
    tsc.dork               AS twitter_dork,
    tsc.from_users,
    tsc.not_from_users,
    tsc.mentions,
    tsc.hashtags           AS twitter_hashtags,
    tsc.palavrasExatas     AS twitter_palavrasExatas,
    tsc.palavrasQuePodeTer AS twitter_palavrasQuePodeTer,
    tsc.excluirPalavras    AS twitter_excluirPalavras,
    tsc.lang               AS twitter_lang,

    ysc.id            AS youtube_search_config_id,
    ysc.dork          AS youtube_dork,
    ysc.videoDuration,
    ysc.videoDefinition,
    ysc.videoEmbeddable,
    ysc.ytOrder,
    ysc.publishAfter,
    ysc.lang          AS youtube_lang,

    isc.id            AS instagram_search_config_id,

    GROUP_CONCAT(
        DISTINCT ihi.hashtag_value
        ORDER BY ihi.hashtag_value
        SEPARATOR ','
    )                   AS instagram_hashtags

FROM
     (
        SELECT m_inner.*
        FROM monitoramento m_inner
        INNER JOIN (
            SELECT client_id, MAX(create_at) AS max_create_at
            FROM monitoramento
            WHERE ativo = 1
            GROUP BY client_id
        ) latest 
         ON m_inner.client_id = latest.client_id 
         AND m_inner.create_at = latest.max_create_at
        WHERE m_inner.ativo = 1
        AND (
            (m_inner.data_inicio IS NULL OR m_inner.data_inicio <= NOW())
            AND
            (m_inner.data_fim IS NULL OR m_inner.data_fim >= NOW())
        )
    ) m

LEFT JOIN google_search_config  AS gsc
       ON gsc.monitoramento_id = m.id
      AND gsc.client_id        = m.client_id

LEFT JOIN twitter_search_config AS tsc
       ON tsc.monitoramento_id = m.id
      AND tsc.client_id        = m.client_id

LEFT JOIN youtube_search_config AS ysc
       ON ysc.monitoramento_id = m.id
      AND ysc.client_id        = m.client_id

LEFT JOIN instagram_search_config AS isc
       ON isc.monitoramento_id = m.id
      AND isc.client_id        = m.client_id

LEFT JOIN instagram_search_config_hashtags AS ish
       ON ish.instagram_search_config_id = isc.id   

LEFT JOIN indexHashtagsInstagram AS ihi
       ON ihi.hashtag_instagram_id = ish.id         

GROUP BY
    m.id,
    m.client_id,
    m.titulo,
    m.descricao,
    m.create_at,
    m.data_inicio,
    m.data_fim,
    m.ativo,

    gsc.id,
    gsc.dork,
    gsc.sites,
    gsc.noInSites,
    gsc.inUrl,
    gsc.inTitle,
    gsc.inText,
    gsc.palavrasExatas,
    gsc.palavrasQuePodeTer,
    gsc.excluirPalavras,

    tsc.id,
    tsc.dork,
    tsc.from_users,
    tsc.not_from_users,
    tsc.mentions,
    tsc.hashtags,
    tsc.palavrasExatas,
    tsc.palavrasQuePodeTer,
    tsc.excluirPalavras,
    tsc.lang,

    ysc.id,
    ysc.dork,
    ysc.videoDuration,
    ysc.videoDefinition,
    ysc.videoEmbeddable,
    ysc.ytOrder,
    ysc.publishAfter,
    ysc.lang,

    isc.id;



SELECT
    m.id AS monitoramento_id,
    m.client_id,
    m.titulo,
    m.descricao,
    m.create_at,
    m.data_inicio,
    m.data_fim,
    m.ativo,
    
    gsc.id AS google_search_config_id,
    gsc.dork AS google_dork,
    gsc.sites,
    gsc.noInSites,
    gsc.inUrl,
    gsc.inTitle,
    gsc.inText,
    gsc.palavrasExatas AS google_palavrasExatas,
    gsc.palavrasQuePodeTer AS google_palavrasQuePodeTer,
    gsc.excluirPalavras AS google_excluirPalavras,
    
    tsc.id AS twitter_search_config_id,
    tsc.dork AS twitter_dork,
    tsc.from_users,
    tsc.not_from_users,
    tsc.mentions,
    tsc.hashtags AS twitter_hashtags,
    tsc.palavrasExatas AS twitter_palavrasExatas,
    tsc.palavrasQuePodeTer AS twitter_palavrasQuePodeTer,
    tsc.excluirPalavras AS twitter_excluirPalavras,
    tsc.lang AS twitter_lang,
    
    ysc.id AS youtube_search_config_id,
    ysc.dork AS youtube_dork,
    ysc.videoDuration,
    ysc.videoDefinition,
    ysc.videoEmbeddable,
    ysc.ytOrder,
    ysc.publishAfter,
    ysc.lang AS youtube_lang,
    
    isc.id AS instagram_search_config_id,
    
    GROUP_CONCAT(ish.hashtag_value ORDER BY ish.hashtag_value SEPARATOR ',') AS instagram_hashtags

FROM (
    SELECT m.*
    FROM monitoramento m
    JOIN (
        SELECT client_id, MIN(id) AS id
        FROM monitoramento
        WHERE ativo = 0
          AND (data_inicio IS NULL OR data_inicio <= NOW())
          AND (data_fim IS NULL OR data_fim >= NOW())
        GROUP BY client_id
    ) x ON x.id = m.id
) m
LEFT JOIN google_search_config gsc
    ON gsc.monitoramento_id = m.id AND gsc.client_id = m.client_id
LEFT JOIN twitter_search_config tsc
    ON tsc.monitoramento_id = m.id AND tsc.client_id = m.client_id
LEFT JOIN youtube_search_config ysc
    ON ysc.monitoramento_id = m.id AND ysc.client_id = m.client_id
LEFT JOIN instagram_search_config isc
    ON isc.monitoramento_id = m.id AND isc.client_id = m.client_id
LEFT JOIN instagram_search_config_hashtags ish
    ON ish.instagram_search_config_id = isc.id

GROUP BY
    m.id,
    m.client_id,
    m.titulo,
    m.descricao,
    m.create_at,
    m.data_inicio,
    m.data_fim,
    m.ativo,
    gsc.id,
    gsc.dork,
    gsc.sites,
    gsc.noInSites,
    gsc.inUrl,
    gsc.inTitle,
    gsc.inText,
    gsc.palavrasExatas,
    gsc.palavrasQuePodeTer,
    gsc.excluirPalavras,
    tsc.id,
    tsc.dork,
    tsc.from_users,
    tsc.not_from_users,
    tsc.mentions,
    tsc.hashtags,
    tsc.palavrasExatas,
    tsc.palavrasQuePodeTer,
    tsc.excluirPalavras,
    tsc.lang,
    ysc.id,
    ysc.dork,
    ysc.videoDuration,
    ysc.videoDefinition,
    ysc.videoEmbeddable,
    ysc.ytOrder,
    ysc.publishAfter,
    ysc.lang,
    isc.id;