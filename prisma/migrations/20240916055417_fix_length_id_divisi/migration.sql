/*
  Warnings:

  - The primary key for the `divisi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id_divisi` on the `divisi` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.
  - You are about to alter the column `id_divisi` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_id_divisi_fkey`;

-- AlterTable
ALTER TABLE `anggota` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `divisi` DROP PRIMARY KEY,
    MODIFY `id_divisi` INTEGER NOT NULL AUTO_INCREMENT,
    ALTER COLUMN `created_at` DROP DEFAULT,
    ADD PRIMARY KEY (`id_divisi`);

-- AlterTable
ALTER TABLE `products` MODIFY `id_divisi` INTEGER NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT;

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

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `divisi`(`id_divisi`) ON DELETE RESTRICT ON UPDATE CASCADE;
