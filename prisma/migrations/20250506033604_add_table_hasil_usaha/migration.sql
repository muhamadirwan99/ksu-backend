-- CreateTable
CREATE TABLE `hasil_usaha` (
    `id_hasil_usaha` INTEGER NOT NULL AUTO_INCREMENT,
    `bulan_tahun` DATE NOT NULL,
    `sisa_hasil_usaha` DECIMAL(20, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `hasil_usaha_bulan_tahun_idx`(`bulan_tahun`),
    UNIQUE INDEX `hasil_usaha_bulan_tahun_key`(`bulan_tahun`),
    PRIMARY KEY (`id_hasil_usaha`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
