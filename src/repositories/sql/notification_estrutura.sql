
create table if not exists token_push_notifications_device (

    id bigint(255) not null auto_increment,
    token_device_account_id bigint(255) not null,
    token varchar(255) not null,
    ativo varchar(255) not null default(1),

    foreign key(token_device_account_id) 
        references token_device_account(id),

    primary key(id)

) ENGINE=InnoDB;

create table if not exists notification_messages (
    
    id bigint(255) not null auto_increment,
    token_push_notifications_device_id bigint(255) not null,
    user_id bigint(255) not null,
    enviado_em datetime not null,
    titulo varchar(255) not null,
    msg varchar(255),
    lido tinyint(1) not null default(0),
    enviado tinyint(1) not null default(1),

    foreign key(token_push_notifications_device_id) 
        references token_push_notifications_device(id),
    
    foreign key(user_id) 
        references user(id),

    primary key(id)

) ENGINE=InnoDB;

