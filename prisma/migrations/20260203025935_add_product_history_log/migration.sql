-- CreateTable
CREATE TABLE `product_history_log` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_product` VARCHAR(100) NOT NULL,
    `jumlah_sebelum` INTEGER NOT NULL,
    `jumlah_sesudah` INTEGER NOT NULL,
    `selisih` INTEGER NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `keterangan` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,

    INDEX `product_history_log_id_product_fkey`(`id_product`),
    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_history_log` ADD CONSTRAINT `product_history_log_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;
