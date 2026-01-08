-- AlterTable
ALTER TABLE `stocktake_items_v2` ADD COLUMN `harga_beli` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `harga_jual` DECIMAL(10, 2) NOT NULL DEFAULT 0;
