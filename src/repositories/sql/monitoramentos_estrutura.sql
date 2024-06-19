
create table if not exists monitoramento (

    id bigint(255) not null auto_increment,
    client_id bigint(255) not null,
    titulo varchar(255) not null,

    objetivo varchar(255),
    ativo tinyint(1) not null default 1,
    creatat datetime not null,
    pesquisa varchar(255) not null,
    alvo varchar(255) not null,

    foreign key(client_id)
        references client(id),

    primary key(id)

)ENGINE=InnoDB;


create table if not exists hashtags (

    id bigint(255) not null auto_increment,
    monitoramento_id bigint(255) not null,
    tag varchar(255) not null,

    foreign key(monitoramento_id)
        references monitoramento(id),

    primary key(id)

)ENGINE=InnoDB;


create table if not exists publicacoes (

    id bigint(255) not null auto_increment,
    monitoramento_id bigint(255) not null,
    titulo varchar(255) not null,
    texto text not null,
    avaliacao tinyint(1) not null, 
    /* 0 negativo, 1 neutro, 2 positivo */
    link varchar(255) not null,
    local_pub varchar(255) not null, /* web, facebook, instagram, twitter, youtube */
    curtidas int(11) not null default(0),
    compartilhamento int(11) not null default(0),
    visualizacoes int(11) not null default(0),
    data_pub datetime not null,

    foreign key(monitoramento_id)
        references monitoramento(id),

    primary key(id)

)ENGINE=InnoDB;