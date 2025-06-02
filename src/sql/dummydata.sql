/* ==============================================================
   0. GARANTIR app do Instagram PARA FK
   ============================================================== */
INSERT IGNORE INTO instagram_app (id, app_id, app_secret, redirect_uri, access_token, used)
VALUES (1, 'app_id_test', 'app_secret_test', 'https://example.com/redirect', 'access_token_test', 1);

/* ==============================================================
   1. CLIENTE DE TESTES + CONFIG
   ============================================================== */
INSERT IGNORE INTO client (id, nome, ativo, create_at)
VALUES (99, 'Cliente Teste Interno', 1, NOW());

INSERT IGNORE INTO client_config (client_id, max_monitoramentos_ativos, instagram_app_id)
VALUES (99, 2, 1);

/* ==============================================================
   2. MONITORAMENTO 1 – Teste SERPRO  (escassez de dados)
   ============================================================== */
INSERT INTO monitoramento (client_id, titulo, descricao, ativo, data_inicio, create_at)
VALUES (99, 'Teste SERPRO', 'Testar baixa atividade nas redes', 1, NOW(), NOW());
SET @m_serpro := LAST_INSERT_ID();

/* Google */
INSERT INTO google_search_config (client_id, monitoramento_id, dork, sites)
VALUES (99, @m_serpro, 'site:serpro.gov.br "festa"', 'serpro.gov.br');

/* Twitter */
INSERT INTO twitter_search_config (client_id, monitoramento_id, from_users, palavrasExatas)
VALUES (99, @m_serpro, 'serpro_gov', 'festa');

/* YouTube */
INSERT INTO youtube_search_config (client_id, monitoramento_id, dork, palavrasExatas)
VALUES (99, @m_serpro, 'serpro entrevista', 'festa');

/* Instagram + hashtag */
INSERT INTO instagram_search_config (client_id, monitoramento_id)
VALUES (99, @m_serpro);
SET @isc_serpro := LAST_INSERT_ID();

INSERT INTO instagram_search_config_hashtags (instagram_search_config_id, hashtag_value)
VALUES (@isc_serpro, 'serproeventos');

/* ==============================================================
   3. MONITORAMENTO 2 – Teste #Bolsonaro2022  (dados repetidos)
   ============================================================== */
INSERT INTO monitoramento (client_id, titulo, descricao, ativo, data_inicio, create_at)
VALUES (99, 'Teste #Bolsonaro2022', 'Testar repetição de dados', 1, NOW(), NOW());
SET @m_bolso := LAST_INSERT_ID();

/* Google */
INSERT INTO google_search_config (client_id, monitoramento_id, dork, palavrasExatas)
VALUES (99, @m_bolso, '"#Bolsonaro2022"', '#Bolsonaro2022');

/* Twitter */
INSERT INTO twitter_search_config (client_id, monitoramento_id, hashtags, palavrasExatas)
VALUES (99, @m_bolso, '#Bolsonaro2022', '#Bolsonaro2022');

/* YouTube */
INSERT INTO youtube_search_config (client_id, monitoramento_id, palavrasExatas)
VALUES (99, @m_bolso, '#Bolsonaro2022');

/* Instagram + hashtag */
INSERT INTO instagram_search_config (client_id, monitoramento_id)
VALUES (99, @m_bolso);
SET @isc_bolso := LAST_INSERT_ID();

INSERT INTO instagram_search_config_hashtags (instagram_search_config_id, hashtag_value)
VALUES (@isc_bolso, 'Bolsonaro2022');

/* ==============================================================
   4. MONITORAMENTO 3 – Greve dos Correios  (oscilações)
   ============================================================== */
INSERT INTO monitoramento (client_id, titulo, descricao, ativo, data_inicio, create_at)
VALUES (99, 'Greve dos Correios', 'Oscilação temática natural', 1, NOW(), NOW());
SET @m_correios := LAST_INSERT_ID();

/* Google */
INSERT INTO google_search_config (client_id, monitoramento_id, inTitle)
VALUES (99, @m_correios, 'greve dos correios');

/* Twitter */
INSERT INTO twitter_search_config (client_id, monitoramento_id, palavrasQuePodeTer)
VALUES (99, @m_correios, 'greve, correios');

/* YouTube */
INSERT INTO youtube_search_config (client_id, monitoramento_id, dork)
VALUES (99, @m_correios, 'greve correios 2023');

/* Instagram + hashtag */
INSERT INTO instagram_search_config (client_id, monitoramento_id)
VALUES (99, @m_correios);
SET @isc_correios := LAST_INSERT_ID();

INSERT INTO instagram_search_config_hashtags (instagram_search_config_id, hashtag_value)
VALUES (@isc_correios, 'grevedoscorreios');

/* ==============================================================
   5. MONITORAMENTO 4 – Debate Eleições 2018  (ruído antigo)
   ============================================================== */
INSERT INTO monitoramento (client_id, titulo, descricao, ativo, data_inicio, create_at)
VALUES (99, 'Debate Eleições 2018', 'Ruído de evento antigo', 1, NOW(), NOW());
SET @m_debate := LAST_INSERT_ID();

/* Google */
INSERT INTO google_search_config (client_id, monitoramento_id, inText)
VALUES (99, @m_debate, '"debate eleições 2018"');

/* Twitter */
INSERT INTO twitter_search_config (client_id, monitoramento_id, palavrasExatas)
VALUES (99, @m_debate, '"debate eleições 2018"');

/* YouTube */
INSERT INTO youtube_search_config (client_id, monitoramento_id, palavrasExatas, publishAfter)
VALUES (99, @m_debate, '"debate eleições 2018"', '2018-10-01 00:00:00');

/* Instagram + hashtag */
INSERT INTO instagram_search_config (client_id, monitoramento_id)
VALUES (99, @m_debate);
SET @isc_debate := LAST_INSERT_ID();

INSERT INTO instagram_search_config_hashtags (instagram_search_config_id, hashtag_value)
VALUES (@isc_debate, 'debate2018');

/* ==============================================================
   6. FINALIZAÇÃO
   ============================================================== */
COMMIT;