create table if not exists campanhas (
    id bigint(255) not null auto_increment,
    client_id bigint(255) not null,
    nome varchar(255) not null,
    descricao varchar(255),
    ativo tinyint(1) default 1,

    foreign key(client_id)
        references client(id),

    primary key(id)
);

create table if not exists tarefas (
    id bigint(255) not null auto_increment,
    campanha_id bigint(255) not null,
    tarefa varchar(255) not null,
    status tinyint(1) default 0,

    foreign key(campanha_id)
        references campanhas(id),

    primary key(id)
);