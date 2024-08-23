
insert into services 
    (nome, ativo, is_public, slug)
    values
    ('Campanhas', 1, 1, 'campanhas'),           
    ('Usuários', 1, 1, 'user'),                 
    ('Monitoramentos', 1, 1, 'monitoramento'), 
    ('Pesquisas', 1, 1, 'pesquisas'),         
    ('Contatos', 1, 1, 'contatos');          


insert into service_actions
    (service_id, slug, nome, descricao, ativo)
    values 

    (1, 'campanhas@list', 'Listar Campanhas', 'lista todas as campanhas e tarefas', 1),
    (1, 'campanhas@create', 'Criar Campanhas', 'Cria uma nova campanha', 1),
    (1, 'campanhas@update', 'Editar Campanhas', 'Edita campanhas ativas', 1),
    (1, 'campanhas@delete', 'Deletar Campanhas', 'Exclui campanhas ativas', 1),
    (1, 'campanhas@tarefas_create', 'Criar Tarefas', 'Cria uma nova tarefa', 1),
    (1, 'campanhas@tarefas_update', 'Editar Tarefas', 'Altera o status de uma tarefa', 1),
    

    (2, 'usuarios@list', 'Listar Usuários', 'lista todos os usuários e seus respectivos estados', 1),
    (2, 'usuarios@create', 'Criar Usuários', 'Cria um usuário a partir de um e-mail', 1),
    (2, 'usuarios@block', 'Bloquear Usuários', 'Bloqueia um usuário', 1),
    (2, 'usuarios@reactivate', 'Reativar Usuários', 'Reativa um usuário', 1),
    (2, 'usuarios@update', 'Edita Permissões', 'Edita permissões de um usuário', 1),

 
    (3, 'monitoramento@list', 'Listar Monitoramentos', 'lista todos os monitoramentos criados e a fila de prioridade', 1),
    (3, 'monitoramento@create', 'Criar Monitoramento', 'Cria um novo monitoramento', 1),
    (3, 'monitoramento@update', 'Editar Monitoramentos', 'Edita dados do monitoramento e o gerenciamento da fila de prioridade', 1),
    (3, 'monitoramento@relatorio', 'Imprimir Relatórios', 'Imprime relatorios de um monitoramento', 1),
    

    (4, 'pesquisas@list', 'Listar Pesquisas', 'Lista todas as pesquisas e seus respectivos estados', 1),
    (4, 'pesquisas@create', 'Criar Pesquisas', 'Cria uma pesquisa e seu questionário', 1),
    (4, 'pesquisas@update', 'Editar Pesquisas', 'Edita dados de toda a pesquisa enquanto ainda é rascunho e altera seu estado', 1),
    (4, 'pesquisas@delete', 'Excluir Pesquisas', 'Exclui uma pesquisa enquanto ainda é rascunho', 1),
    (4, 'pesquisas@responder', 'Responder Questionario', 'Usuário pode inserir respostas no questionários', 1),
    (4, 'pesquisas@relatorio', 'Imprimir Relatórios', 'Imprime relatorios de uma pesquisa', 1),


    (5, 'contatos@list', 'Listar Contatos', 'Lista grupos e contatos', 1),
    (5, 'contatos@create_group', 'Criar Grupo', 'Cria um novo grupo', 1),
    (5, 'contatos@update_group', 'Editar Grupo', 'Edita dados de um grupo', 1),
    (5, 'contatos@delete_group', 'Deletar Grupo', 'Deleta grupo de contatos', 1),
    (5, 'contatos@create_contato', 'Adicionar Contato', 'Adiciona um novo contato ao grupo', 1),
    (5, 'contatos@update_contato', 'Editar Contato', 'Edita dados de um contato', 1),
    (5, 'contatos@delete_contato', 'Deletar Contato', 'Deleta um contato', 1);
