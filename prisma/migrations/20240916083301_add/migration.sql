/*
  Warnings:

  - Added the required column `id_jenis` to the `reference_detail_cash_in_out` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `anggota` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `products` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `reference_cash_in_out` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `reference_detail_cash_in_out` ADD COLUMN `id_jenis` INTEGER NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `reference_jenis_cash_in_out` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `response_logs` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `roles` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `reference_detail_cash_in_out` ADD CONSTRAINT `reference_detail_cash_in_out_id_jenis_fkey` FOREIGN KEY (`id_jenis`) REFERENCES `reference_jenis_cash_in_out`(`id_jenis`) ON DELETE RESTRICT ON UPDATE CASCADE;
