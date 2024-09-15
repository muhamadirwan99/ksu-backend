-- AlterTable
ALTER TABLE `anggota` MODIFY `id_anggota` INTEGER NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT;

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
ALTER TABLE `roles` MODIFY `id_role` INTEGER NOT NULL,
    ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;
