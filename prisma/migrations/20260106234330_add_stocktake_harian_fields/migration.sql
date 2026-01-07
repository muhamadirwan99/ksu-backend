-- AlterTable
ALTER TABLE `stocktake` ADD COLUMN `id_tutup_kasir` INTEGER NULL,
    ADD COLUMN `is_confirmed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `keterangan` TEXT NULL;

-- AlterTable
ALTER TABLE `tutup_kasir` ADD COLUMN `is_stocktake_done` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `stocktake_completed_at` TIMESTAMP(6) NULL;

-- CreateIndex
CREATE INDEX `stocktake_id_tutup_kasir_fkey` ON `stocktake`(`id_tutup_kasir`);

-- AddForeignKey
ALTER TABLE `stocktake` ADD CONSTRAINT `stocktake_id_tutup_kasir_fkey` FOREIGN KEY (`id_tutup_kasir`) REFERENCES `tutup_kasir`(`id_tutup_kasir`) ON DELETE SET NULL ON UPDATE CASCADE;
