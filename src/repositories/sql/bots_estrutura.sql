create table if not exists bots (

    id bigint(255)  not null auto_increment,
    slug varchar(250)  not null unique,
    vtoken int not null default 0,
    locale varchar(255) not null,

    primary key(id)

)ENGINE=InnoDB;