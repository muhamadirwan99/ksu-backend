-- AlterTable
ALTER TABLE `anggota` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `cash_in_out` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `detail_pembelian` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `detail_penjualan` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `hutang_anggota` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `pembelian` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `penjualan` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `products` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `reference_cash_in_out` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `reference_detail_cash_in_out` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `reference_jenis_cash_in_out` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `response_logs` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;

-- CreateTable
CREATE TABLE `hutang_dagang` (
    `id_hutang_dagang` VARCHAR(20) NOT NULL,
    `id_supplier` VARCHAR(8) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `tg_hutang` VARCHAR(20) NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `id_pembelian` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_hutang_dagang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hutang_dagang` ADD CONSTRAINT `hutang_dagang_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hutang_dagang` ADD CONSTRAINT `hutang_dagang_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian`(`id_pembelian`) ON DELETE RESTRICT ON UPDATE CASCADE;
