-- CreateTable
CREATE TABLE `stocktake_sessions_v2` (
    `id_stocktake_session` VARCHAR(30) NOT NULL,
    `stocktake_type` ENUM('HARIAN', 'BULANAN') NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'REVISION', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `id_tutup_kasir` INTEGER NOT NULL,
    `shift` VARCHAR(20) NOT NULL,
    `tg_stocktake` TIMESTAMP(6) NOT NULL,
    `username_kasir` VARCHAR(100) NOT NULL,
    `nama_kasir` VARCHAR(100) NOT NULL,
    `username_reviewer` VARCHAR(100) NULL,
    `nama_reviewer` VARCHAR(100) NULL,
    `total_items` INTEGER NOT NULL DEFAULT 0,
    `total_counted` INTEGER NOT NULL DEFAULT 0,
    `total_variance` INTEGER NOT NULL DEFAULT 0,
    `notes_kasir` TEXT NULL,
    `notes_reviewer` TEXT NULL,
    `submitted_at` TIMESTAMP(6) NULL,
    `reviewed_at` TIMESTAMP(6) NULL,
    `completed_at` TIMESTAMP(6) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `stocktake_sessions_v2_id_tutup_kasir_idx`(`id_tutup_kasir`),
    INDEX `stocktake_sessions_v2_stocktake_type_idx`(`stocktake_type`),
    INDEX `stocktake_sessions_v2_status_idx`(`status`),
    INDEX `stocktake_sessions_v2_tg_stocktake_idx`(`tg_stocktake`),
    PRIMARY KEY (`id_stocktake_session`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stocktake_items_v2` (
    `id_stocktake_item` INTEGER NOT NULL AUTO_INCREMENT,
    `id_stocktake_session` VARCHAR(30) NOT NULL,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_product` VARCHAR(100) NOT NULL,
    `nm_divisi` VARCHAR(100) NOT NULL,
    `stok_sistem` INTEGER NOT NULL,
    `stok_fisik` INTEGER NULL,
    `selisih` INTEGER NOT NULL DEFAULT 0,
    `is_counted` BOOLEAN NOT NULL DEFAULT false,
    `is_flagged` BOOLEAN NOT NULL DEFAULT false,
    `flag_reason` TEXT NULL,
    `is_high_risk` BOOLEAN NOT NULL DEFAULT false,
    `has_transaction` BOOLEAN NOT NULL DEFAULT false,
    `notes` TEXT NULL,
    `counted_at` TIMESTAMP(6) NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `stocktake_items_v2_id_stocktake_session_idx`(`id_stocktake_session`),
    INDEX `stocktake_items_v2_id_product_idx`(`id_product`),
    INDEX `stocktake_items_v2_is_counted_idx`(`is_counted`),
    INDEX `stocktake_items_v2_is_flagged_idx`(`is_flagged`),
    UNIQUE INDEX `stocktake_items_v2_id_stocktake_session_id_product_key`(`id_stocktake_session`, `id_product`),
    PRIMARY KEY (`id_stocktake_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stocktake_high_risk_products` (
    `id_high_risk` INTEGER NOT NULL AUTO_INCREMENT,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_product` VARCHAR(100) NOT NULL,
    `category` VARCHAR(100) NULL,
    `reason` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `stocktake_high_risk_products_is_active_idx`(`is_active`),
    INDEX `stocktake_high_risk_products_category_idx`(`category`),
    UNIQUE INDEX `stocktake_high_risk_products_id_product_key`(`id_product`),
    PRIMARY KEY (`id_high_risk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stocktake_adjustment_logs` (
    `id_adjustment` INTEGER NOT NULL AUTO_INCREMENT,
    `id_stocktake_session` VARCHAR(30) NOT NULL,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_product` VARCHAR(100) NOT NULL,
    `stok_before` INTEGER NOT NULL,
    `stok_after` INTEGER NOT NULL,
    `adjustment_qty` INTEGER NOT NULL,
    `harga_beli` DECIMAL(10, 2) NOT NULL,
    `nilai_adjustment` DECIMAL(10, 2) NOT NULL,
    `adjustment_reason` TEXT NOT NULL,
    `adjusted_by` VARCHAR(100) NOT NULL,
    `adjusted_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `stocktake_adjustment_logs_id_stocktake_session_idx`(`id_stocktake_session`),
    INDEX `stocktake_adjustment_logs_id_product_idx`(`id_product`),
    INDEX `stocktake_adjustment_logs_adjusted_at_idx`(`adjusted_at`),
    PRIMARY KEY (`id_adjustment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stocktake_sessions_v2` ADD CONSTRAINT `stocktake_sessions_v2_id_tutup_kasir_fkey` FOREIGN KEY (`id_tutup_kasir`) REFERENCES `tutup_kasir`(`id_tutup_kasir`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocktake_items_v2` ADD CONSTRAINT `stocktake_items_v2_id_stocktake_session_fkey` FOREIGN KEY (`id_stocktake_session`) REFERENCES `stocktake_sessions_v2`(`id_stocktake_session`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocktake_items_v2` ADD CONSTRAINT `stocktake_items_v2_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocktake_high_risk_products` ADD CONSTRAINT `stocktake_high_risk_products_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocktake_adjustment_logs` ADD CONSTRAINT `stocktake_adjustment_logs_id_stocktake_session_fkey` FOREIGN KEY (`id_stocktake_session`) REFERENCES `stocktake_sessions_v2`(`id_stocktake_session`) ON DELETE RESTRICT ON UPDATE CASCADE;
