

create table if not exists user (

    id bigint not null auto_increment,
    vtoken int(11) not null default 0,
    type int(2) not null,
    ativo int(1) not null default 1,
    create_at datetime not null,

    primary key(id)

) ENGINE=InnoDB;


create table if not exists user_code (
    
    id bigint not null auto_increment,
    user_id bigint not null,
    create_at datetime not null,
    expire_in datetime not null,
    code varchar(100) not null,
    used int(1) not null default 0,

    foreign key(user_id)
        references user(id),

    primary key(id)

) ENGINE=InnoDB;


create table if not exists user_device (

    id bigint not null auto_increment,
    user_id bigint not null,
    device varchar(255) not null,
    ip varchar(255) not null,
    hash_device varchar(255) not null,

    foreign key(user_id)
        references user(id),

    primary key(id)

) ENGINE=InnoDB;


create table if not exists user_refresh_token (

    id bigint not null auto_increment,
    user_device_id bigint not null,
    refresh_token varchar(255) not null,
    active int(1) not null default 1,

    foreign key(user_device_id) 
        references user_device(id),

    primary key(id)

) ENGINE=InnoDB;


create table if not exists user_detail (
   
    id bigint not null auto_increment,
    user_id bigint not null,
    user_image varchar(255) not null,
    nome varchar(255) not null,
    email varchar(255) not null,
    senha varchar(255) not null,

    unique(email),
    foreign key (user_id)
        references user(id),

    primary key(id)

) ENGINE=InnoDB;


create table if not exists client (

    id bigint not null auto_increment,
    nome varchar(255),

    primary key(id)

) ENGINE=InnoDB;


create table if not exists user_client (

    id bigint not null auto_increment,
    user_id bigint not null,
    client_id bigint not null,
    accepted int(1) not null default 0,

    foreign key(user_id) 
        references user(id),

    foreign key(client_id)
        references client(id),

    primary key(id)

) ENGINE=InnoDB;


create table if not exists monitoramento (

    id bigint not null auto_increment,
    client_id bigint not null,
    titulo varchar(255),
    descricao varchar(255),

    foreign key(client_id)
        references client(id),

    primary key(id)

) ENGINE=InnoDB;


create table if not exists mensao (

    id bigint not null auto_increment,
    client_id bigint not null,
    monitoramento_id bigint not null,
    expressao varchar(255),

    foreign key (client_id) 
        references client(id),
    foreign key (monitoramento_id)
        references monitoramento(id),
    
    primary key(id)

) ENGINE = InnoDB;


create table if not exists publish (
    
    id bigint not null auto_increment,
    data_pub datetime not null,
    texto text not null,
    plataforma ENUM('GOOGLE', 'FACEBOOK', 'INSTAGRAM', 'TWITTER', 'YOUTUBE') not null,
    client_id bigint not null,
    mensao_id bigint not null,
    monitoramento_id bigint not null,
    link varchar(255) not null,
    temImagem int(1) not null,
    temVideo int(1) not null,
    curtidas bigint not null default 0,
    visualizacoes bigint not null default 0,
    compartilhamento bigint not null default 0,
    sentimento int(1) not null,
    valoracao decimal(10,2) not null default 0,

    foreign key(mensao_id)
        references mensao(id),
    
    foreign key(client_id)
        references client(id),

    foreign key(monitoramento_id)
        references monitoramento(id),
    
    primary key(id)

) ENGINE = InnoDB; 


create table if not exists hashtag_publish (

    id bigint not null auto_increment,
    client_id bigint not null,
    publish_id bigint not null,
    valor varchar(255),

    foreign key (client_id)
        references client(id),

    foreign key (publish_id)
        references publish(id),

    primary key(id)

) ENGINE = InnoDB;


create table if not exists hashtags (

    id bigint not null auto_increment,
    mensao_id bigint not null,
    client_id bigint not null,
    valor varchar(255),

    foreign key (mensao_id)
        references mensao(id),

    foreign key (client_id)
        references client(id),

    primary key(id)

) ENGINE = InnoDB;
