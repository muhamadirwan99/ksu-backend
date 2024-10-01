import { prismaClient } from "../src/application/database.js";
import { generateDate } from "../src/utils/generate-date.js";
import bcrypt from "bcrypt";

async function main() {
  await prismaClient.role.create({
    data: {
      id_role: "ROLE001",
      role_name: "admin",
      sts_anggota: true,
      sts_pembayaran_pinjaman: true,
      sts_kartu_piutang: true,
      sts_supplier: true,
      sts_divisi: true,
      sts_produk: true,
      sts_pembelian: true,
      sts_penjualan: true,
      sts_retur: true,
      sts_pembayaran_hutang: true,
      sts_estimasi: true,
      sts_stocktake_harian: true,
      sts_stock_opname: true,
      sts_cash_in_cash_out: true,
      sts_cash_movement: true,
      sts_user: true,
      sts_role: true,
      sts_cetak_label: true,
      sts_cetak_barcode: true,
      sts_awal_akhir_hari: true,
      sts_dashboard: true,
      sts_laporan: true,
      created_at: generateDate(),
    },
  });

  await prismaClient.user.create({
    data: {
      username: "admin",
      password: await bcrypt.hash("rahasia", 10),
      name: "admin",
      id_role: "ROLE001",
      created_at: generateDate(),
    },
  });

  await prismaClient.divisi.create({
    data: {
      id_divisi: "001",
      nm_divisi: "PERLENGKAPAN BAYI & ANAK",
      created_at: generateDate(),
    },
  });

  await prismaClient.supplier.create({
    data: {
      id_supplier: "SUP001",
      nm_supplier: "PT. ABC",
      nm_pic: "Santoso",
      nm_pemilik: "Budi Santoso",
      alamat: "Jl. ABC No. 123",
      no_wa: "081234567890",
      created_at: generateDate(),
    },
  });

  await prismaClient.product.create({
    data: {
      id_product: "PRO001",
      nm_product: "COTTON BUDS CINDERELA 100PCS",
      harga_beli: 1000,
      harga_jual: 5000,
      id_divisi: "001",
      id_supplier: "SUP001",
      status_product: true,
      jumlah: 10,
      created_at: generateDate(),
    },
  });

  const dateNow = generateDate();

  //mendapatkan data tanggal, bulan dan tahun dari dateNow
  const date = dateNow.getDate();
  const month = dateNow.getMonth() + 1;
  const year = dateNow.getFullYear();

  await prismaClient.pembelian.create({
    data: {
      id_pembelian: "PEM001",
      tg_pembelian: `${date}-${month}-${year}`,
      id_supplier: "SUP001",
      nm_supplier: "PT. ABC",
      jumlah: 10,
      total_harga_beli: 10000,
      total_harga_jual: 50000,
      jenis_pembayaran: "tunai",
      created_at: generateDate(),
    },
  });

  await prismaClient.detailPembelian.create({
    data: {
      id_pembelian: "PEM001",
      id_product: "PRO001",
      nm_divisi: "PERLENGKAPAN BAYI & ANAK",
      nm_produk: "COTTON BUDS CINDERELA 100PCS",
      harga_beli: 1000,
      harga_jual: 5000,
      jumlah: 10,
      diskon: 0,
      ppn: 0,
      total_nilai_beli: 10000,
      total_nilai_jual: 50000,
      created_at: generateDate(),
    },
  });

  await prismaClient.anggota.create({
    data: {
      id_anggota: "ABCD1234",
      nm_anggota: "Budi",
      alamat: "Jl. ABC No. 123",
      no_wa: "081234567890",
      limit_pinjaman: 20000000,
      created_at: generateDate(),
    },
  });

  await prismaClient.referenceCashInOut.createMany({
    data: [
      {
        id_cash: "1",
        nm_cash: "Cash In",
        created_at: generateDate(),
      },
      {
        id_cash: "2",
        nm_cash: "Cash Out",
        created_at: generateDate(),
      },
    ],
  });

  await prismaClient.referenceJenisCashInOut.createMany({
    data: [
      {
        id_jenis: 1,
        nm_jenis: "Penarikan Bank",
        id_cash: "1",
        created_at: generateDate(),
      },
      {
        id_jenis: 2,
        nm_jenis: "Pendapatan Lain",
        id_cash: "1",
        created_at: generateDate(),
      },
      {
        id_jenis: 3,
        nm_jenis: "Beban Operasional Toko",
        id_cash: "2",
        created_at: generateDate(),
      },
      {
        id_jenis: 4,
        nm_jenis: "Beban Operasional Pusat",
        id_cash: "2",
        created_at: generateDate(),
      },
      {
        id_jenis: 5,
        nm_jenis: "Transfer ke Bank",
        id_cash: "2",
        created_at: generateDate(),
      },
      {
        id_jenis: 6,
        nm_jenis: "Pengeluaran Lain-lain",
        id_cash: "2",
        created_at: generateDate(),
      },
    ],
  });

  await prismaClient.referenceDetailCashInOut.createMany({
    data: [
      {
        id_detail: 1,
        nm_detail: "Penarikan Bank 1",
        id_cash: "1",
        id_jenis: 1,
        created_at: generateDate(),
      },
      {
        id_detail: 2,
        nm_detail: "Penarikan Bank 2",
        id_cash: "1",
        id_jenis: 1,
        created_at: generateDate(),
      },
      {
        id_detail: 3,
        nm_detail: "Tenant",
        id_cash: "1",
        id_jenis: 2,
        created_at: generateDate(),
      },
      {
        id_detail: 4,
        nm_detail: "Pendapatan Lain-lain",
        id_cash: "1",
        id_jenis: 2,
        created_at: generateDate(),
      },
      {
        id_detail: 5,
        nm_detail: "Beban Gaji/Insentif",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 6,
        nm_detail: "Uang Makan Karyawan",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 7,
        nm_detail: "THR Karyawan",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 8,
        nm_detail: "Tunjangan Pangan",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 9,
        nm_detail: "Beban Adm. & Umum",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 10,
        nm_detail: "Beban Perlengkapan",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 11,
        nm_detail: "Tunjangan Kesehatan",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 12,
        nm_detail: "Pemeliharaan Inventaris",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 13,
        nm_detail: "Pemeliharaan Gedung",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 14,
        nm_detail: "Beban Pensiun Karyawan",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 15,
        nm_detail: "Tagihan Listrik",
        id_cash: "2",
        id_jenis: 4,
        created_at: generateDate(),
      },
      {
        id_detail: 16,
        nm_detail: "Utang Simpan Pinjam",
        id_cash: "2",
        id_jenis: 4,
        created_at: generateDate(),
      },
      {
        id_detail: 17,
        nm_detail: "Lain-lain",
        id_cash: "2",
        id_jenis: 4,
        created_at: generateDate(),
      },
      {
        id_detail: 18,
        nm_detail: "Transfer ke Bank 1",
        id_cash: "2",
        id_jenis: 5,
        created_at: generateDate(),
      },
      {
        id_detail: 19,
        nm_detail: "Transfer ke Bank 2",
        id_cash: "2",
        id_jenis: 5,
        created_at: generateDate(),
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prismaClient.$disconnect();
  });
