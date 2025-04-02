import { prismaClient } from "../src/application/database.js";
import { generateDate } from "../src/utils/generate-date.js";
import bcrypt from "bcrypt";

async function main() {
  // await seedCommon();
  // await cashInOut();
  // await seedAkunNeraca();
  // const date = new Date("2024-12-01");
  // await initDataNeracaAwal(date);
}

async function seedAkunNeraca() {
  const akunNeraca = [
    "KAS",
    "BANK BRI",
    "BANK BNI",
    "PIUTANG DAGANG",
    "PERSEDIAAN",
    "PENGHAPUSAN PERSEDIAAN",
    "INVENTARIS",
    "AKUM. PENY. INVENTARIS",
    "GEDUNG",
    "AKUM. PENY. GEDUNG",
    "MODAL TIDAK TETAP (R/C)",
    "MODAL DISETOR",
    "USAHA LAIN-LAIN TOKO",
    "MODAL UNIT TOKO",
    "SHU TH. 2023",
    "SHU TH. 2024",
    "SHU TH. 2025",
    "UTANG DAGANG",
    "UTANG DARI PIHAK KETIGA",
    "UTANG DARI SP",
    "PENJUALAN TUNAI",
    "PENJUALAN QRIS",
    "PENJUALAN KREDIT",
    "HARGA POKOK PENJUALAN",
    "RETUR PENJUALAN",
    "PENDAPATAN SEWA",
    "PENDAPATAN LAIN-LAIN",
    "PEMBELIAN TUNAI",
    "PEMBELIAN KREDIT",
    "HARGA POKOK PEMBELIAN",
    "RETUR PEMBELIAN",
    "BEBAN GAJI",
    "UANG MAKAN",
    "THR KARYAWAN",
    "BEBAN ADM. & UMUM",
    "BEBAN PERLENGKAPAN TOKO",
    "BEBAN PENY. INVENTARIS",
    "BEBAN PENY. GEDUNG",
    "PEMELIHARAAN INVENTARIS",
    "PEMELIHARAAN GEDUNG",
    "PENGELUARAN LAIN-LAIN",
    "BEBAN KERUGIAN PERSEDIAAN",
    "HONOR PENGURUS",
    "HONOR PENGAWAS",
  ];

  const dataToInsert = akunNeraca.map((item) => ({
    nama_akun: item,
    created_at: generateDate(),
  }));

  await prismaClient.akunNeraca.createMany({
    data: dataToInsert,
    skipDuplicates: true, // Menghindari duplikasi jika ada data yang sama
  });

  console.log("seed akun neraca berhasil dimasukkan!");
}

async function initDataNeracaAwal(date) {
  const neracaData = [
    neracaModel(1, 69343225, 0),
    neracaModel(2, 4117026, 0),
    neracaModel(3, 0, 0),
    neracaModel(4, 12763734, 0),
    neracaModel(5, 48767331, 0),
    neracaModel(6, 96683115, 0),
    neracaModel(7, 149185956, 0),
    neracaModel(8, 0, 141242206),
    neracaModel(9, 154878130, 0),
    neracaModel(10, 0, 98898847),
    neracaModel(11, 0, 12655213),
    neracaModel(12, 0, 53205769),
    neracaModel(13, 0, 43318438),
    neracaModel(14, 0, 28000000),
    neracaModel(15, 0, 11313276),
    neracaModel(16, 0, 73073118),
    neracaModel(17, 0, 0),
    neracaModel(18, 0, 27946033),
    neracaModel(19, 0, 27401537),
    neracaModel(20, 0, 18684080),
    neracaModel(21, 0, 0),
    neracaModel(22, 0, 0),
    neracaModel(23, 0, 0),
    neracaModel(24, 0, 0),
    neracaModel(25, 0, 0),
    neracaModel(26, 0, 0),
    neracaModel(27, 0, 0),
    neracaModel(28, 0, 0),
    neracaModel(29, 0, 0),
    neracaModel(30, 0, 0),
    neracaModel(31, 0, 0),
    neracaModel(32, 0, 0),
    neracaModel(33, 0, 0),
    neracaModel(34, 0, 0),
    neracaModel(35, 0, 0),
    neracaModel(36, 0, 0),
    neracaModel(37, 0, 0),
    neracaModel(38, 0, 0),
    neracaModel(39, 0, 0),
    neracaModel(40, 0, 0),
    neracaModel(41, 0, 0),
    neracaModel(42, 0, 0),
    neracaModel(43, 0, 0),
    neracaModel(44, 0, 0),
  ];

  const dataToInsert = neracaData.map((item) => ({
    akun_id: item.akun_id,
    debit: item.debit,
    kredit: item.kredit,
    bulan_tahun: date,
    created_at: generateDate(),
  }));

  await prismaClient.neraca.createMany({
    data: dataToInsert,
    skipDuplicates: true, // Menghindari duplikasi jika ada data yang sama
  });

  console.log("Data neraca berhasil dimasukkan!");
}

function neracaModel(akunId, debit, kredit) {
  return {
    akun_id: akunId,
    debit: debit,
    kredit: kredit,
    created_at: generateDate(),
  };
}

async function seedCommon() {
  await prismaClient.role.createMany({
    data: [
      {
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
      {
        id_role: "ROLE002",
        role_name: "kasir",
        sts_anggota: true,
        sts_pembayaran_pinjaman: true,
        sts_kartu_piutang: true,
        sts_supplier: false,
        sts_divisi: false,
        sts_produk: false,
        sts_pembelian: false,
        sts_penjualan: true,
        sts_retur: false,
        sts_pembayaran_hutang: false,
        sts_estimasi: false,
        sts_stocktake_harian: false,
        sts_stock_opname: true,
        sts_cash_in_cash_out: false,
        sts_cash_movement: false,
        sts_user: false,
        sts_role: false,
        sts_cetak_label: false,
        sts_cetak_barcode: false,
        sts_awal_akhir_hari: true,
        sts_dashboard: true,
        sts_laporan: false,
        created_at: generateDate(),
      },
    ],
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

  await prismaClient.anggota.create({
    data: {
      id_anggota: "UMUM",
      nm_anggota: "UMUM",
      alamat: "UMUM",
      no_wa: "UMUM",
      limit_pinjaman: 0,
      created_at: generateDate(),
    },
  });

  await prismaClient.counter.create({
    data: {
      name: "supplier",
      value: 1,
    },
  });
}

async function cashInOut() {
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
        nm_detail: "Penarikan dari Kas",
        id_cash: "1",
        id_jenis: 1,
        created_at: generateDate(),
      },
      {
        id_detail: 2,
        nm_detail: "Penarikan dari Bank",
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
        nm_detail: "Beban Adm. & Umum",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 9,
        nm_detail: "Beban Perlengkapan",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 10,
        nm_detail: "Pemeliharaan Inventaris",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 11,
        nm_detail: "Pemeliharaan Gedung",
        id_cash: "2",
        id_jenis: 3,
        created_at: generateDate(),
      },
      {
        id_detail: 12,
        nm_detail: "Tagihan Listrik",
        id_cash: "2",
        id_jenis: 4,
        created_at: generateDate(),
      },
      {
        id_detail: 13,
        nm_detail: "Honor Pengawas",
        id_cash: "2",
        id_jenis: 4,
        created_at: generateDate(),
      },
      {
        id_detail: 14,
        nm_detail: "Honor Pengurus",
        id_cash: "2",
        id_jenis: 4,
        created_at: generateDate(),
      },
      {
        id_detail: 15,
        nm_detail: "Lain-lain",
        id_cash: "2",
        id_jenis: 4,
        created_at: generateDate(),
      },
      {
        id_detail: 16,
        nm_detail: "Transfer ke Kas",
        id_cash: "2",
        id_jenis: 5,
        created_at: generateDate(),
      },
      {
        id_detail: 17,
        nm_detail: "Transfer ke Bank",
        id_cash: "2",
        id_jenis: 5,
        created_at: generateDate(),
      },
    ],
  });
}

async function dummyData() {
  await prismaClient.divisi.create({
    data: {
      id_divisi: "001",
      nm_divisi: "PERLENGKAPAN BAYI & ANAK",
      created_at: generateDate(),
    },
  });

  await prismaClient.supplier.create({
    data: {
      id_supplier: "SUP9999",
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
      id_supplier: "SUP9999",
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
      id_supplier: "SUP9999",
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prismaClient.$disconnect();
  });
