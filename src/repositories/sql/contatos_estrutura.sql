
create table if not exists grupos (

    id bigint(255) not null auto_increment,
    client_id bigint(255) not null,
    titulo varchar(255) not null,
    descricao varchar(255),
    link_whatsapp varchar(255),
    ativo tinyint(1) not null default(1),

    foreign key(client_id)
        references client(id),
    
    primary key(id)

)ENGINE=InnoDB;


create table if not exists contatos (

    id bigint(255) not null auto_increment,
    grupo_id bigint(255) not null,
    apelido varchar(255),
    nome varchar(255) not null,
    whatsapp varchar(255) not null,
    email varchar(255),
    instagram varchar(255),
    twitter varchar(255),
    facebook varchar(255),

    foreign key(grupo_id)
        references grupos(id),

    primary key(id)

)ENGINE=InnoDB;