-- AlterTable
ALTER TABLE `divisi` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `response_logs` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `roles` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `suppliers` MODIFY `hutang_dagang` DECIMAL(10, 2) NULL,
    ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;
