-- Create scheme flong
CREATE DATABASE `flong`;

-- Create flong-nodejs user for flong db
CREATE USER 'flong-nodejs'@localhost IDENTIFIED BY '6d27U6C';
GRANT ALL PRIVILEGES ON `flong`.* TO 'flong-nodejs'@localhost;
FLUSH PRIVILEGES;

-- Create user table
CREATE TABLE `flong`.`user`(
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    stamp_create TIMESTAMP NOT NULL DEFAULT(current_timestamp),
    last_online TIMESTAMP NOT NULL DEFAULT(current_timestamp),
    active ENUM('y', '') NOT NULL,

);

-- Create session table
CREATE TABLE `flong`.`session`(
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(24) NOT NULL,
    stamp_create TIMESTAMP NOT NULL DEFAULT(current_timestamp),

);

-- Create skin table
CREATE TABLE `flong`.`skin`(
    user_id INT NOT NULL,
    skin_type ENUM('head', 'body', 'legs', 'accessory') NOT NULL
);

-- Create match table
CREATE TABLE `flong`.`match`(
    id INT NOT NULL AUTO_INCREMENT,
    stamp_create TIMESTAMP NOT NULL DEFAULT(current_timestamp),
    canceled ENUM('y', '') NOT NULL
);