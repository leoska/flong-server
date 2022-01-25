-- Create scheme flong
CREATE DATABASE `flong`;

-- Create flong-prisma user for flong db
DROP USER IF EXISTS 'flong-prisma'@'%';
CREATE USER 'flong-prisma'@'%' IDENTIFIED BY 'y758DGQ';
GRANT ALL PRIVILEGES ON *.* TO 'flong-prisma'@'%';
FLUSH PRIVILEGES;

-- Create flong-nodejs user for flong db
DROP USER IF EXISTS 'flong-nodejs'@'%';
CREATE USER 'flong-nodejs'@'%' IDENTIFIED BY '6d27U6C';
GRANT ALL PRIVILEGES ON `flong`.* TO 'flong-nodejs'@'%';
FLUSH PRIVILEGES;

-- Create user table
CREATE TABLE `flong`.`user`(
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(320) NOT NULL,
    username VARCHAR(100) NOT NULL DEFAULT("player"),
    password BLOB NOT NULL,
    stamp_create TIMESTAMP NOT NULL DEFAULT(current_timestamp),
    last_online TIMESTAMP NOT NULL DEFAULT(current_timestamp),
    active BOOLEAN NOT NULL DEFAULT(true),
    platform ENUM('html5') NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create session table
CREATE TABLE `flong`.`session`(
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_id VARCHAR(24) NOT NULL,
    stamp_create TIMESTAMP NOT NULL DEFAULT(current_timestamp),

    PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create skin table
CREATE TABLE `flong`.`skin`(
    user_id INT NOT NULL,
    skin_type ENUM('head', 'body', 'legs', 'accessory') NOT NULL,

    PRIMARY KEY (`user_id`, `skin_type`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create match table
CREATE TABLE `flong`.`match`(
    id INT NOT NULL AUTO_INCREMENT,
    stamp_create TIMESTAMP NOT NULL DEFAULT(current_timestamp),
    `status` ENUM('completed', 'canceled') NOT NULL,

    PRIMARY KEY (id)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;