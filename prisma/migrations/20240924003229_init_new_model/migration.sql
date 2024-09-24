-- CreateTable
CREATE TABLE `response_logs` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `success` BOOLEAN NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,

    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `token` VARCHAR(255) NULL,
    `id_role` VARCHAR(10) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id_role` VARCHAR(10) NOT NULL,
    `role_name` VARCHAR(100) NOT NULL,
    `sts_anggota` BOOLEAN NOT NULL DEFAULT false,
    `sts_pembayaran_pinjaman` BOOLEAN NOT NULL DEFAULT false,
    `sts_kartu_piutang` BOOLEAN NOT NULL DEFAULT false,
    `sts_supplier` BOOLEAN NOT NULL DEFAULT false,
    `sts_divisi` BOOLEAN NOT NULL DEFAULT false,
    `sts_produk` BOOLEAN NOT NULL DEFAULT false,
    `sts_pembelian` BOOLEAN NOT NULL DEFAULT false,
    `sts_penjualan` BOOLEAN NOT NULL DEFAULT false,
    `sts_retur` BOOLEAN NOT NULL DEFAULT false,
    `sts_pembayaran_hutang` BOOLEAN NOT NULL DEFAULT false,
    `sts_estimasi` BOOLEAN NOT NULL DEFAULT false,
    `sts_stocktake_harian` BOOLEAN NOT NULL DEFAULT false,
    `sts_stock_opname` BOOLEAN NOT NULL DEFAULT false,
    `sts_cash_in_cash_out` BOOLEAN NOT NULL DEFAULT false,
    `sts_cash_movement` BOOLEAN NOT NULL DEFAULT false,
    `sts_user` BOOLEAN NOT NULL DEFAULT false,
    `sts_role` BOOLEAN NOT NULL DEFAULT false,
    `sts_cetak_label` BOOLEAN NOT NULL DEFAULT false,
    `sts_cetak_barcode` BOOLEAN NOT NULL DEFAULT false,
    `sts_awal_akhir_hari` BOOLEAN NOT NULL DEFAULT false,
    `sts_dashboard` BOOLEAN NOT NULL DEFAULT false,
    `sts_laporan` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anggota` (
    `id_anggota` VARCHAR(8) NOT NULL,
    `nm_anggota` VARCHAR(100) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `no_wa` VARCHAR(20) NOT NULL,
    `limit_pinjaman` DECIMAL(10, 2) NOT NULL,
    `hutang` DECIMAL(10, 2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_anggota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `divisi` (
    `id_divisi` VARCHAR(3) NOT NULL,
    `nm_divisi` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_divisi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id_supplier` VARCHAR(10) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `nm_pemilik` VARCHAR(100) NOT NULL,
    `nm_pic` VARCHAR(100) NOT NULL,
    `no_wa` VARCHAR(20) NOT NULL,
    `alamat` VARCHAR(255) NOT NULL,
    `hutang_dagang` DECIMAL(10, 2) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_supplier`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id_product` VARCHAR(100) NOT NULL,
    `nm_product` VARCHAR(100) NOT NULL,
    `id_divisi` VARCHAR(3) NOT NULL,
    `id_supplier` VARCHAR(10) NOT NULL,
    `harga_jual` DECIMAL(10, 2) NOT NULL,
    `harga_beli` DECIMAL(10, 2) NOT NULL,
    `status_product` BOOLEAN NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_in_out` (
    `id_cash_in_out` VARCHAR(3) NOT NULL,
    `tg_transaksi` DATETIME(3) NOT NULL,
    `id_cash` VARCHAR(10) NOT NULL,
    `id_jenis` INTEGER NOT NULL,
    `id_detail` INTEGER NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_cash_in_out`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reference_cash_in_out` (
    `id_cash` VARCHAR(10) NOT NULL,
    `nm_cash` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_cash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reference_jenis_cash_in_out` (
    `id_jenis` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_jenis` VARCHAR(100) NOT NULL,
    `id_cash` VARCHAR(10) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_jenis`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reference_detail_cash_in_out` (
    `id_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `nm_detail` VARCHAR(100) NOT NULL,
    `id_cash` VARCHAR(10) NOT NULL,
    `id_jenis` INTEGER NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembelian` (
    `id_pembelian` VARCHAR(20) NOT NULL,
    `tg_pembelian` DATETIME(3) NOT NULL,
    `id_supplier` VARCHAR(10) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `total_harga_beli` DECIMAL(10, 2) NOT NULL,
    `total_harga_jual` DECIMAL(10, 2) NOT NULL,
    `jenis_pembayaran` VARCHAR(100) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_pembelian`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_pembelian` (
    `id_detail_pembelian` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pembelian` VARCHAR(20) NOT NULL,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_divisi` VARCHAR(100) NOT NULL,
    `nm_produk` VARCHAR(100) NOT NULL,
    `harga_beli` DECIMAL(10, 2) NOT NULL,
    `harga_jual` DECIMAL(10, 2) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `diskon` DECIMAL(10, 2) NOT NULL,
    `ppn` DECIMAL(10, 2) NOT NULL,
    `total_nilai_beli` DECIMAL(10, 2) NOT NULL,
    `total_nilai_jual` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_detail_pembelian`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `roles`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `divisi`(`id_divisi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_in_out` ADD CONSTRAINT `cash_in_out_id_cash_fkey` FOREIGN KEY (`id_cash`) REFERENCES `reference_cash_in_out`(`id_cash`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_in_out` ADD CONSTRAINT `cash_in_out_id_jenis_fkey` FOREIGN KEY (`id_jenis`) REFERENCES `reference_jenis_cash_in_out`(`id_jenis`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_in_out` ADD CONSTRAINT `cash_in_out_id_detail_fkey` FOREIGN KEY (`id_detail`) REFERENCES `reference_detail_cash_in_out`(`id_detail`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reference_jenis_cash_in_out` ADD CONSTRAINT `reference_jenis_cash_in_out_id_cash_fkey` FOREIGN KEY (`id_cash`) REFERENCES `reference_cash_in_out`(`id_cash`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reference_detail_cash_in_out` ADD CONSTRAINT `reference_detail_cash_in_out_id_cash_fkey` FOREIGN KEY (`id_cash`) REFERENCES `reference_cash_in_out`(`id_cash`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reference_detail_cash_in_out` ADD CONSTRAINT `reference_detail_cash_in_out_id_jenis_fkey` FOREIGN KEY (`id_jenis`) REFERENCES `reference_jenis_cash_in_out`(`id_jenis`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembelian` ADD CONSTRAINT `pembelian_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pembelian` ADD CONSTRAINT `detail_pembelian_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian`(`id_pembelian`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_pembelian` ADD CONSTRAINT `detail_pembelian_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;
