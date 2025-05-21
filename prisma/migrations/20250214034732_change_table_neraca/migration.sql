-- CreateTable
CREATE TABLE `akun_neraca` (
    `id_akun` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_akun` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,

    UNIQUE INDEX `akun_neraca_nama_akun_key`(`nama_akun`),
    PRIMARY KEY (`id_akun`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `neraca` (
    `id_neraca` INTEGER NOT NULL AUTO_INCREMENT,
    `akun_id` INTEGER NOT NULL,
    `bulan_tahun` DATE NOT NULL,
    `debit` DECIMAL(20, 2) NOT NULL,
    `kredit` DECIMAL(20, 2) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL,
    `updated_at` TIMESTAMP(6) NULL,

    INDEX `neraca_bulan_tahun_idx`(`bulan_tahun`),
    UNIQUE INDEX `neraca_akun_id_bulan_tahun_key`(`akun_id`, `bulan_tahun`),
    PRIMARY KEY (`id_neraca`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `neraca` ADD CONSTRAINT `neraca_akun_id_fkey` FOREIGN KEY (`akun_id`) REFERENCES `akun_neraca`(`id_akun`) ON DELETE RESTRICT ON UPDATE CASCADE;
