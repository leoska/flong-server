CREATE DATABASE `flong`;

CREATE USER 'flong-nodejs'@localhost IDENTIFIED BY '6d27U6C';
GRANT ALL PRIVILEGES ON `flong`.* TO 'flong-nodejs'@localhost;
FLUSH PRIVILEGES;

CREATE TABLE `flong`.`test`(a int);