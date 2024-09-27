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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prismaClient.$disconnect();
  });
