select 
    perguntas_pesquisa.id       as pesquisa_id,
    opcoes_pergunta_pesquisa.id as opcao_id, 
    perguntas_pesquisa.pergunta, 
    opcoes_pergunta_pesquisa.valor, 
    (   
        select 
            count(*) 
        from  respostas_pergunta 
        where opcao_pergunta_id = opcao_id
    ) as total_votos
from 
    opcoes_pergunta_pesquisa
    join perguntas_pesquisa on perguntas_pesquisa.id = opcoes_pergunta_pesquisa.pergunta_pesquisa_id 
    join pesquisas          on pesquisas.id          = perguntas_pesquisa.pesquisa_id
where 
    pesquisas.id = 6 and client_id = 1;


select 
    perguntas_perfil_pesquisa.id       as pesquisa_id,
    opcoes_pergunta_perfil_pesquisa.id as opcao_id, 
    perguntas_perfil_pesquisa.pergunta, 
    opcoes_pergunta_perfil_pesquisa.valor, 
    (   
        select 
            count(*) 
        from  respostas_perfil_pesquisa 
        where opcao_pergunta_perfil_id = opcao_id
    ) as total_votos
from 
    opcoes_pergunta_perfil_pesquisa
    join perguntas_perfil_pesquisa on perguntas_perfil_pesquisa.id = opcoes_pergunta_perfil_pesquisa.pergunta_perfil_pesquisa_id 
    join pesquisas                 on pesquisas.id                 = perguntas_perfil_pesquisa.pesquisa_id
where 
    pesquisas.id = 6 and client_id = 1;