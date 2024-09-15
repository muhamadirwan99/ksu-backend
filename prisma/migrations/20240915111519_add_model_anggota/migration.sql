-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `products` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `response_logs` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `roles` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;

-- CreateTable
CREATE TABLE `anggota` (
    `kd_anggota` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_anggota` VARCHAR(100) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `no_telp` VARCHAR(20) NOT NULL,
    `limit_pinjaman` DECIMAL(10, 2) NULL,
    `pinjaman` DECIMAL(10, 2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`kd_anggota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
