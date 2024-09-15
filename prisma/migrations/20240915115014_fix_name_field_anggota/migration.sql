/*
  Warnings:

  - You are about to drop the column `no_telp` on the `anggota` table. All the data in the column will be lost.
  - Added the required column `no_wa` to the `anggota` table without a default value. This is not possible if the table is not empty.
  - Made the column `limit_pinjaman` on table `anggota` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `anggota` DROP COLUMN `no_telp`,
    ADD COLUMN `no_wa` VARCHAR(20) NOT NULL,
    MODIFY `limit_pinjaman` DECIMAL(10, 2) NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT;

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
