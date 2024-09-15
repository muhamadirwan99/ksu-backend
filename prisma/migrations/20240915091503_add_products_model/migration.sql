-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `response_logs` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `roles` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;

-- CreateTable
CREATE TABLE `products` (
    `kd_produk` VARCHAR(10) NOT NULL,
    `nm_produk` VARCHAR(100) NOT NULL,
    `kd_divisi` VARCHAR(10) NOT NULL,
    `kd_supplier` VARCHAR(10) NOT NULL,
    `harga_jual` DECIMAL(10, 2) NOT NULL,
    `harga_beli` DECIMAL(10, 2) NOT NULL,
    `status_produk` BOOLEAN NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`kd_produk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_kd_supplier_fkey` FOREIGN KEY (`kd_supplier`) REFERENCES `suppliers`(`kd_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_kd_divisi_fkey` FOREIGN KEY (`kd_divisi`) REFERENCES `divisi`(`kd_divisi`) ON DELETE RESTRICT ON UPDATE CASCADE;
