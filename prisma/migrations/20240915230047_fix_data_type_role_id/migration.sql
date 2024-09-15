/*
  Warnings:

  - The primary key for the `anggota` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `users` DROP FOREIGN KEY `users_id_role_fkey`;

-- AlterTable
ALTER TABLE `anggota` DROP PRIMARY KEY,
    MODIFY `id_anggota` VARCHAR(6) NOT NULL,
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
ALTER TABLE `roles` DROP PRIMARY KEY,
    MODIFY `id_role` VARCHAR(10) NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT,
    ADD PRIMARY KEY (`id_role`);

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` MODIFY `id_role` VARCHAR(10) NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `roles`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;
