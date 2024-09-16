/*
  Warnings:

  - The primary key for the `anggota` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `anggota` DROP PRIMARY KEY,
    MODIFY `id_anggota` VARCHAR(8) NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT,
    ADD PRIMARY KEY (`id_anggota`);

-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

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
ALTER TABLE `roles` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;
