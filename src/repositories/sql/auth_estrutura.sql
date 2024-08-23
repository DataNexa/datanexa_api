create table if not exists client (
    id bigint(255)  not null auto_increment,
    nome varchar(255) not null,
    slug varchar(250)  not null unique,
    ativo tinyint(1) default 1,

    primary key(id)
)ENGINE=InnoDB;

create table if not exists account (
    id bigint(255) not null auto_increment,
    nome varchar(100) not null,
    email varchar(250) not null unique,
    senha varchar(255),
    confirmed tinyint(1) not null default 0,
    temporary tinyint(1) not null default 0,

    primary key(id)
)ENGINE=InnoDB;

create table if not exists user (
    id bigint(255) not null auto_increment,
    slug varchar(250) not null unique,
    account_id bigint(255) not null,
    ativo tinyint(1) default 1,
    tipo_usuario tinyint(1) not null,
    accepted tinyint(1) default 0,

    foreign key(account_id) 
        references account(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists user_client(
    id bigint(255) not null auto_increment,
    user_id bigint(255) not null,
    client_id bigint(255) not null,

    foreign key(user_id)
        references user(id),

    foreign key(client_id)
        references client(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists session_temp (
    id bigint(255) not null auto_increment,
    account_id bigint(255) not null,
    session_value varchar(255) not null,
    expire_in datetime not null,
    used tinyint(1) default 0,

    foreign key(account_id)
        references account(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists token_account (
    id bigint(255) not null auto_increment,
    account_id bigint(255) not null unique,
    vtoken int not null default 1,

    foreign key(account_id)
        references account(id),

    primary key(id)
)ENGINE=InnoDB;

create table if not exists token_device_account (
    id bigint(255) not null auto_increment,
    token_account_id bigint(255) not null,
    hash_salt varchar(250) not null unique,
    refresh_token varchar(250) not null unique,
    device varchar(250),

    foreign key(token_account_id)
        references token_account(id),

    primary key(id)
)ENGINE=InnoDB;


create table if not exists recover (
    id bigint(255) not null auto_increment,
    account_id bigint(255) not null,
    codigo varchar(100) not null,
    expire_in datetime not null,
    expired tinyint(1) default 0,

    foreign key(account_id)
        references account(id),

    primary key(id)
) ENGINE=InnoDB;

create table if not exists services (
    id bigint(255) not null auto_increment,
    nome varchar(255) not null,
    ativo tinyint(1) default 1,
    is_public tinyint(1) default 0,
    slug varchar(255) not null,

    primary key(id)
) ENGINE=InnoDB;

create table if not exists service_actions (
    id bigint(255) not null auto_increment,
    service_id bigint(255) not null,
    slug varchar(255) not null unique,
    nome varchar(255) not null,
    descricao varchar(255) not null,
    ativo tinyint(1) default 1,
    list tinyint(1) not null default 0,

    foreign key(service_id)
        references services(id),

    primary key(id)
) ENGINE=InnoDB;

create table if not exists logs (
    id bigint(255) not null auto_increment,
    user_id bigint(255),
    create_at datetime default current_timestamp,
    service_action_id bigint(255) not null,
    resumo varchar(255) not null,
    
    foreign key(user_id)
        references user(id),

    foreign key(service_action_id)
        references service_actions(id),

    primary key(id)
) ENGINE=InnoDB;

create table if not exists user_permission (
    id bigint(255) not null auto_increment,
    user_id bigint(255) not null,
    service_action_id bigint(255) not null,

    foreign key(user_id)
        references user(id),
    
    foreign key(service_action_id)
        references service_actions(id),

    primary key(id)
)ENGINE=InnoDB;