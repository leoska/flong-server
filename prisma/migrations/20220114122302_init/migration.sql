-- CreateTable
CREATE TABLE `user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `token` BINARY(24) NOT NULL,
    `stamp_create` TIMESTAMP NOT NULL,
    `last_online` TIMESTAMP NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `email` VARCHAR(320) NOT NULL,
    `platform` ENUM('html5') NOT NULL,

    UNIQUE INDEX `user_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
