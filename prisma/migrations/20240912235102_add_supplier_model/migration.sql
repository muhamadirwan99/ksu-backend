-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `response_logs` MODIFY `created_at` TIMESTAMP(6) NOT NULL;

-- AlterTable
ALTER TABLE `roles` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;

-- CreateTable
CREATE TABLE `suppliers` (
    `kd_supplier` VARCHAR(10) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `pemilik` VARCHAR(100) NOT NULL,
    `nm_pic` VARCHAR(100) NOT NULL,
    `no_wa` VARCHAR(20) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `hutang_dagang` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`kd_supplier`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
