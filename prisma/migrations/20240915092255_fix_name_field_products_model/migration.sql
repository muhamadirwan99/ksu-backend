/*
  Warnings:

  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `kd_produk` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `nm_produk` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `status_produk` on the `products` table. All the data in the column will be lost.
  - Added the required column `kd_product` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nm_product` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status_product` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `products` DROP PRIMARY KEY,
    DROP COLUMN `kd_produk`,
    DROP COLUMN `nm_produk`,
    DROP COLUMN `status_produk`,
    ADD COLUMN `kd_product` VARCHAR(10) NOT NULL,
    ADD COLUMN `nm_product` VARCHAR(100) NOT NULL,
    ADD COLUMN `status_product` BOOLEAN NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT,
    ADD PRIMARY KEY (`kd_product`);

-- AlterTable
ALTER TABLE `response_logs` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `roles` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;
