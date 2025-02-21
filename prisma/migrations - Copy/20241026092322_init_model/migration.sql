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

    INDEX `users_id_role_fkey`(`id_role`),
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
    `pinjaman` DECIMAL(10, 2) NULL,
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

    INDEX `products_id_divisi_fkey`(`id_divisi`),
    INDEX `products_id_supplier_fkey`(`id_supplier`),
    PRIMARY KEY (`id_product`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_in_out` (
    `id_cash_in_out` VARCHAR(3) NOT NULL,
    `tg_transaksi` TIMESTAMP(6) NOT NULL,
    `id_cash` VARCHAR(10) NOT NULL,
    `id_jenis` INTEGER NOT NULL,
    `id_detail` INTEGER NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `cash_in_out_id_cash_fkey`(`id_cash`),
    INDEX `cash_in_out_id_detail_fkey`(`id_detail`),
    INDEX `cash_in_out_id_jenis_fkey`(`id_jenis`),
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

    INDEX `reference_jenis_cash_in_out_id_cash_fkey`(`id_cash`),
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

    INDEX `reference_detail_cash_in_out_id_cash_fkey`(`id_cash`),
    INDEX `reference_detail_cash_in_out_id_jenis_fkey`(`id_jenis`),
    PRIMARY KEY (`id_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembelian` (
    `id_pembelian` VARCHAR(20) NOT NULL,
    `tg_pembelian` VARCHAR(20) NOT NULL,
    `id_supplier` VARCHAR(10) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `total_harga_beli` DECIMAL(10, 2) NOT NULL,
    `total_harga_jual` DECIMAL(10, 2) NOT NULL,
    `jenis_pembayaran` VARCHAR(100) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `pembelian_id_supplier_fkey`(`id_supplier`),
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

    INDEX `detail_pembelian_id_pembelian_fkey`(`id_pembelian`),
    INDEX `detail_pembelian_id_product_fkey`(`id_product`),
    PRIMARY KEY (`id_detail_pembelian`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penjualan` (
    `id_penjualan` VARCHAR(20) NOT NULL,
    `tg_penjualan` VARCHAR(20) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `total_nilai_beli` DECIMAL(10, 2) NOT NULL,
    `total_nilai_jual` DECIMAL(10, 2) NOT NULL,
    `id_anggota` VARCHAR(8) NOT NULL,
    `nm_anggota` VARCHAR(100) NOT NULL,
    `jenis_pembayaran` VARCHAR(100) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `username` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `penjualan_id_anggota_fkey`(`id_anggota`),
    INDEX `penjualan_username_fkey`(`username`),
    PRIMARY KEY (`id_penjualan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_penjualan` (
    `id_detail_penjualan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_penjualan` VARCHAR(20) NOT NULL,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_divisi` VARCHAR(100) NOT NULL,
    `nm_produk` VARCHAR(100) NOT NULL,
    `harga` DECIMAL(10, 2) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `diskon` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `detail_penjualan_id_penjualan_fkey`(`id_penjualan`),
    INDEX `detail_penjualan_id_product_fkey`(`id_product`),
    PRIMARY KEY (`id_detail_penjualan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hutang_anggota` (
    `id_hutang_anggota` VARCHAR(20) NOT NULL,
    `id_anggota` VARCHAR(8) NOT NULL,
    `nm_anggota` VARCHAR(100) NOT NULL,
    `tg_hutang` VARCHAR(20) NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `id_penjualan` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `hutang_anggota_id_anggota_fkey`(`id_anggota`),
    INDEX `hutang_anggota_id_penjualan_fkey`(`id_penjualan`),
    PRIMARY KEY (`id_hutang_anggota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hutang_dagang` (
    `id_hutang_dagang` VARCHAR(20) NOT NULL,
    `id_supplier` VARCHAR(8) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `tg_hutang` VARCHAR(20) NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `id_pembelian` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    UNIQUE INDEX `hutang_dagang_id_pembelian_key`(`id_pembelian`),
    INDEX `hutang_dagang_id_pembelian_fkey`(`id_pembelian`),
    INDEX `hutang_dagang_id_supplier_fkey`(`id_supplier`),
    PRIMARY KEY (`id_hutang_dagang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stocktake` (
    `id_stocktake` INTEGER NOT NULL AUTO_INCREMENT,
    `tg_stocktake` VARCHAR(20) NOT NULL,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_product` VARCHAR(100) NOT NULL,
    `stok_awal` INTEGER NOT NULL,
    `stok_akhir` INTEGER NOT NULL,
    `selisih` INTEGER NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `stocktake_id_product_fkey`(`id_product`),
    INDEX `stocktake_username_fkey`(`username`),
    PRIMARY KEY (`id_stocktake`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `counters` (
    `name` VARCHAR(50) NOT NULL,
    `value` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `retur` (
    `id_retur` VARCHAR(20) NOT NULL,
    `tg_retur` VARCHAR(20) NOT NULL,
    `id_pembelian` VARCHAR(20) NOT NULL,
    `id_supplier` VARCHAR(10) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `total_nilai_beli` DECIMAL(10, 2) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_retur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `detail_retur` (
    `id_detail_retur` INTEGER NOT NULL AUTO_INCREMENT,
    `id_retur` VARCHAR(20) NOT NULL,
    `nm_divisi` VARCHAR(100) NOT NULL,
    `id_product` VARCHAR(100) NOT NULL,
    `nm_produk` VARCHAR(100) NOT NULL,
    `harga_beli` DECIMAL(10, 2) NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `total_nilai_beli` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_detail_retur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `penyusutan_aset` (
    `id_aset` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis_aset` ENUM('inventaris', 'gedung') NOT NULL,
    `nilai_aset_awal` DECIMAL(10, 2) NOT NULL,
    `persentase_penyusutan` DECIMAL(5, 2) NOT NULL,
    `nilai_penyusutan` DECIMAL(10, 2) NOT NULL,
    `tahun` INTEGER NOT NULL,
    `nilai_aset_akhir` DECIMAL(10, 2) NOT NULL,
    `penyusutan_bulan` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_aset`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tutup_kasir` (
    `id_tutup_kasir` INTEGER NOT NULL AUTO_INCREMENT,
    `tg_tutup_kasir` VARCHAR(20) NOT NULL,
    `shift` VARCHAR(20) NOT NULL,
    `nama_kasir` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `tunai` DECIMAL(10, 2) NOT NULL,
    `qris` DECIMAL(10, 2) NOT NULL,
    `kredit` DECIMAL(10, 2) NOT NULL,
    `total` DECIMAL(10, 2) NOT NULL,
    `uang_tunai` DECIMAL(10, 2) NOT NULL,
    `total_nilai_jual` DECIMAL(10, 2) NOT NULL,
    `total_nilai_beli` DECIMAL(10, 2) NOT NULL,
    `total_keuntungan` DECIMAL(10, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    PRIMARY KEY (`id_tutup_kasir`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history_hutang_anggota` (
    `id_history_hutang_anggota` VARCHAR(20) NOT NULL,
    `id_anggota` VARCHAR(8) NOT NULL,
    `nm_anggota` VARCHAR(100) NOT NULL,
    `tg_bayar_hutang` VARCHAR(20) NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `id_penjualan` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `hutang_anggota_id_anggota_fkey`(`id_anggota`),
    INDEX `hutang_anggota_id_penjualan_fkey`(`id_penjualan`),
    PRIMARY KEY (`id_history_hutang_anggota`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `history_hutang_dagang` (
    `id_history_hutang_dagang` VARCHAR(20) NOT NULL,
    `id_supplier` VARCHAR(8) NOT NULL,
    `nm_supplier` VARCHAR(100) NOT NULL,
    `tg_bayar_hutang` VARCHAR(20) NOT NULL,
    `nominal` DECIMAL(10, 2) NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `id_pembelian` VARCHAR(20) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `hutang_dagang_id_pembelian_fkey`(`id_pembelian`),
    INDEX `hutang_dagang_id_supplier_fkey`(`id_supplier`),
    PRIMARY KEY (`id_history_hutang_dagang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_id_role_fkey` FOREIGN KEY (`id_role`) REFERENCES `roles`(`id_role`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_id_divisi_fkey` FOREIGN KEY (`id_divisi`) REFERENCES `divisi`(`id_divisi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_in_out` ADD CONSTRAINT `cash_in_out_id_cash_fkey` FOREIGN KEY (`id_cash`) REFERENCES `reference_cash_in_out`(`id_cash`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_in_out` ADD CONSTRAINT `cash_in_out_id_detail_fkey` FOREIGN KEY (`id_detail`) REFERENCES `reference_detail_cash_in_out`(`id_detail`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cash_in_out` ADD CONSTRAINT `cash_in_out_id_jenis_fkey` FOREIGN KEY (`id_jenis`) REFERENCES `reference_jenis_cash_in_out`(`id_jenis`) ON DELETE RESTRICT ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `penjualan` ADD CONSTRAINT `penjualan_id_anggota_fkey` FOREIGN KEY (`id_anggota`) REFERENCES `anggota`(`id_anggota`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `penjualan` ADD CONSTRAINT `penjualan_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_penjualan` ADD CONSTRAINT `detail_penjualan_id_penjualan_fkey` FOREIGN KEY (`id_penjualan`) REFERENCES `penjualan`(`id_penjualan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_penjualan` ADD CONSTRAINT `detail_penjualan_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hutang_anggota` ADD CONSTRAINT `hutang_anggota_id_anggota_fkey` FOREIGN KEY (`id_anggota`) REFERENCES `anggota`(`id_anggota`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hutang_anggota` ADD CONSTRAINT `hutang_anggota_id_penjualan_fkey` FOREIGN KEY (`id_penjualan`) REFERENCES `penjualan`(`id_penjualan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hutang_dagang` ADD CONSTRAINT `hutang_dagang_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian`(`id_pembelian`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hutang_dagang` ADD CONSTRAINT `hutang_dagang_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocktake` ADD CONSTRAINT `stocktake_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stocktake` ADD CONSTRAINT `stocktake_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retur` ADD CONSTRAINT `retur_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `retur` ADD CONSTRAINT `retur_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian`(`id_pembelian`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur` ADD CONSTRAINT `detail_retur_id_retur_fkey` FOREIGN KEY (`id_retur`) REFERENCES `retur`(`id_retur`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `detail_retur` ADD CONSTRAINT `detail_retur_id_product_fkey` FOREIGN KEY (`id_product`) REFERENCES `products`(`id_product`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tutup_kasir` ADD CONSTRAINT `tutup_kasir_username_fkey` FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_hutang_anggota` ADD CONSTRAINT `history_hutang_anggota_id_anggota_fkey` FOREIGN KEY (`id_anggota`) REFERENCES `anggota`(`id_anggota`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_hutang_anggota` ADD CONSTRAINT `history_hutang_anggota_id_penjualan_fkey` FOREIGN KEY (`id_penjualan`) REFERENCES `penjualan`(`id_penjualan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_hutang_dagang` ADD CONSTRAINT `history_hutang_dagang_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `pembelian`(`id_pembelian`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `history_hutang_dagang` ADD CONSTRAINT `history_hutang_dagang_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `suppliers`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;
