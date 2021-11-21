-- Create scheme flong
CREATE DATABASE `flong`;

-- Create flong-nodejs user for flong db
CREATE USER 'flong-nodejs'@localhost IDENTIFIED BY '6d27U6C';
GRANT ALL PRIVILEGES ON `flong`.* TO 'flong-nodejs'@localhost;
FLUSH PRIVILEGES;

-- Create table user
CREATE TABLE `flong`.`user`(
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    stamp_create TIMESTAMP DEFAULT(current_timestamp),
    active ENUM('y', '') NOT NULL,
    
);