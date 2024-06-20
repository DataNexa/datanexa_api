

create table if not exists pesquisas (
    id bigint(255) not null auto_increment,
    client_id bigint(255) not null,
    titulo varchar(255) not null,
    descricao varchar(255) not null,
    ativo tinyint(1),
    createAt datetime not null,
    duration datetime,
    --- 0 'inativo', 1 'rascunho', 2 'publico', 3 'consolidado'

    foreign key(client_id)
        references client(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists perguntas_pesquisa (
    id bigint(255) not null auto_increment,
    pesquisa_id bigint(255) not null,
    pergunta varchar(255) not null,

    foreign key(pesquisa_id)
        references pesquisas(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists perguntas_perfil_pesquisa (
    id bigint(255) not null auto_increment,
    pesquisa_id bigint(255) not null,
    pergunta varchar(255) not null,

    foreign key(pesquisa_id)
        references pesquisas(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists respostas_pesquisa (
    id bigint(255) not null auto_increment,
    pesquisa_id bigint(255) not null,
    nome varchar(255) not null,
    sobrenome varchar(255),

    foreign key(pesquisa_id) 
        references pesquisas(id),
    
    primary key(id)
)ENGINE=InnoDB;

create table if not exists opcoes_pergunta_perfil_pesquisa (
    id bigint(255) not null auto_increment,
    pergunta_perfil_pesquisa_id bigint(255) not null,
    valor varchar(255) not null,

    foreign key(pergunta_perfil_pesquisa_id)
        references perguntas_perfil_pesquisa(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists opcoes_pergunta_pesquisa (
    id bigint(255) not null auto_increment,
    pergunta_pesquisa_id bigint(255) not null,
    valor varchar(255) not null,

    foreign key(pergunta_pesquisa_id)
        references perguntas_pesquisa(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists respostas_perfil_pesquisa (
    id bigint(255) not null auto_increment,
    resposta_id bigint(255) not null,
    opcao_pergunta_perfil_id bigint(255) not null,

    foreign key(resposta_id)
        references respostas_pesquisa(id),

    foreign key(opcao_pergunta_perfil_id)
        references opcoes_pergunta_perfil_pesquisa(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists respostas_pergunta (
    id bigint(255) not null auto_increment,
    resposta_id bigint(255) not null,
    opcao_pergunta_id bigint(255) not null,

    foreign key(resposta_id)
        references respostas_pesquisa(id),

    foreign key(opcao_pergunta_id)
        references opcoes_pergunta_pesquisa(id),

    primary key(id)
)ENGINE=InnoDB;


