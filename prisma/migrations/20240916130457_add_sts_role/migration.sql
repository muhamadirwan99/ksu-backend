-- AlterTable
ALTER TABLE `anggota` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `cash_in_out` ALTER COLUMN `created_at` DROP DEFAULT;

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
ALTER TABLE `roles` ADD COLUMN `sts_anggota` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_awal_akhir_hari` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_cash_in_cash_out` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_cash_movement` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_cetak_barcode` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_cetak_label` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_dashboard` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_divisi` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_estimasi` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_kartu_piutang` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_laporan` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_pembayaran_hutang` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_pembayaran_pinjaman` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_pembelian` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_penjualan` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_produk` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_retur` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_role` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_stock_opname` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_stocktake_harian` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_supplier` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sts_user` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `suppliers` ALTER COLUMN `created_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `created_at` DROP DEFAULT;
