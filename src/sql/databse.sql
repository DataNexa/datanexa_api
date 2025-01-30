CREATE DATABASE datanexa2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

create user 'api_datanexa2'@'%' identified with mysql_native_password by 'q=O4(:2q2{j!oA0w';

grant all privileges on datanexa2.* to 'api_datanexa2'@'%';

-- sudo mysql datanexa2 < src/sql/tabelas.sql