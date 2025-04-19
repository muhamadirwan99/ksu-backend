import {
  endDate,
  generateNeraca,
  getCurrentMonthPurchase,
  getCurrentMonthSale,
  getHutangAnggota,
  getHutangDagang,
  getTotalRetur,
  newYear,
  startDate,
} from "./calculate-neraca-lajur.js";
import { prismaClient } from "../../../application/database.js";
import { getTotalCashInOutByDateRange } from "../lap-hasil-usaha.js";
import { CASH_OUT_CODES } from "../../../utils/constant.js";

async function kas() {
  return generateNeraca({
    akun: "KAS",
    includeNeracaAwal: true,
    getDebit: async () => {
      // Penjualan tunai
      const cashSales = await getCurrentMonthSale("tunai");
      const totalCurrentMonthSale = cashSales.reduce(
        (sum, sale) => sum + parseFloat(sale.total_nilai_jual),
        0,
      );

      // Retur penjualan
      const totalRetur = await getTotalRetur("tunai", startDate, endDate);

      // Pendapatan lain-lain dan hutang pihak ketiga
      const pendapatanLain = await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.PENDAPATAN_LAIN_LAIN,
        startDate,
        endDate,
      );
      const utangPihakKetiga = await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.HUTANG_PIHAK_KETIGA,
        startDate,
        endDate,
      );

      const hutangAnggota = await getHutangAnggota();
      const totalHutangAnggota = hutangAnggota.reduce(
        (sum, hutang) => sum + parseFloat(hutang.nominal),
        0,
      );

      return (
        totalCurrentMonthSale +
        totalRetur +
        pendapatanLain +
        utangPihakKetiga +
        totalHutangAnggota
      );
    },
    getKredit: async () => {
      // Pembelian tunai
      const cashPurchases = await getCurrentMonthPurchase("tunai");
      const totalCurrentMonthPurchase = cashPurchases.reduce(
        (sum, p) => sum + parseFloat(p.total_harga_beli),
        0,
      );

      // Semua pengeluaran dari kas
      const cashOutCodes = [
        CASH_OUT_CODES.BEBAN_GAJI,
        CASH_OUT_CODES.UANG_MAKAN_KARYAWAN,
        CASH_OUT_CODES.THR_KARYAWAN,
        CASH_OUT_CODES.BEBAN_ADM_UMUM,
        CASH_OUT_CODES.BEBAN_PERLENGKAPAN,
        CASH_OUT_CODES.PEMELIHARAAN_INVENTARIS,
        CASH_OUT_CODES.PEMELIHARAAN_GEDUNG,
        CASH_OUT_CODES.LAIN_LAIN,
        CASH_OUT_CODES.HONOR_PENGURUS,
        CASH_OUT_CODES.HONOR_PENGAWAS,
        CASH_OUT_CODES.PEMBAYARAN_HUTANG_PIHAK_KETIGA,
        CASH_OUT_CODES.TAGIHAN_LISTRIK,
      ];

      const pengeluaran = await Promise.all(
        cashOutCodes.map((id) =>
          getTotalCashInOutByDateRange(id, startDate, endDate),
        ),
      );

      const totalPengeluaran = pengeluaran.reduce((acc, curr) => acc + curr, 0);

      const hutangDagang = await getHutangDagang();
      const totalHutangDagang = hutangDagang.reduce(
        (sum, hutang) => sum + parseFloat(hutang.nominal),
        0,
      );

      return totalCurrentMonthPurchase + totalPengeluaran + totalHutangDagang;
    },
  });
}

async function bankBri() {
  return generateNeraca({
    akun: "BANK BRI",
    includeNeracaAwal: true,
    getDebit: async () => {
      const qrisSales = await getCurrentMonthSale("qris");
      return qrisSales.reduce(
        (sum, sale) => sum + parseFloat(sale.total_nilai_jual),
        0,
      );
    },
    getKredit: async () => 0,
  });
}

async function bankBni() {
  return generateNeraca({
    akun: "BANK BNI",
    includeNeracaAwal: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.TENANT,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function piutangDagang() {
  return generateNeraca({
    akun: "PIUTANG DAGANG",
    includeNeracaAwal: true,
    getDebit: async () => {
      const kreditSales = await getCurrentMonthSale("kredit");
      return kreditSales.reduce(
        (sum, sale) => sum + parseFloat(sale.total_nilai_jual),
        0,
      );
    },
    getKredit: async () => {
      const hutangAnggota = await getHutangAnggota();
      return hutangAnggota.reduce(
        (sum, hutang) => sum + parseFloat(hutang.nominal),
        0,
      );
    },
  });
}

async function persediaan() {
  return generateNeraca({
    akun: "PERSEDIAAN",
    includeNeracaAwal: true,
    getDebit: async () => {
      const [cashPurchases, creditPurchases] = await Promise.all([
        getCurrentMonthPurchase("tunai"),
        getCurrentMonthPurchase("kredit"),
      ]);

      const totalPembelian = [...cashPurchases, ...creditPurchases].reduce(
        (sum, p) => sum + parseFloat(p.total_harga_beli),
        0,
      );

      const totalReturPenjualan = 0; // Placeholder (belum ada)

      return totalPembelian + totalReturPenjualan;
    },
    getKredit: async () => {
      const [cashSales, qrisSales, kreditSales] = await Promise.all([
        getCurrentMonthSale("tunai"),
        getCurrentMonthSale("qris"),
        getCurrentMonthSale("kredit"),
      ]);

      const totalPenjualan = [
        ...cashSales,
        ...qrisSales,
        ...kreditSales,
      ].reduce((sum, s) => sum + parseFloat(s.total_nilai_beli), 0);

      const returTunai = await getTotalRetur("tunai", startDate, endDate);
      const returKredit = await getTotalRetur("kredit", startDate, endDate);

      return totalPenjualan + returTunai + returKredit;
    },
  });
}

async function penghapusanPersediaan() {
  return generateNeraca({
    akun: "PENGHAPUSAN PERSEDIAAN",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 1000000,
  });
}

async function inventaris() {
  return generateNeraca({
    akun: "INVENTARIS",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function akumPenyInventaris() {
  return generateNeraca({
    akun: "AKUM. PENY. INVENTARIS",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => {
      const bebanPenyusutanInventaris =
        await prismaClient.penyusutanAset.findFirst({
          where: {
            jenis_aset: "inventaris",
            tahun: newYear,
          },
          select: {
            penyusutan_bulan: true,
          },
        });

      return parseFloat(bebanPenyusutanInventaris?.penyusutan_bulan) || 0;
    },
  });
}

async function gedung() {
  return generateNeraca({
    akun: "GEDUNG",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function akumPenyGedung() {
  return generateNeraca({
    akun: "AKUM. PENY. GEDUNG",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => {
      const bebanPenyusutanGedung = await prismaClient.penyusutanAset.findFirst(
        {
          where: {
            jenis_aset: "gedung",
            tahun: newYear,
          },
          select: {
            penyusutan_bulan: true,
          },
        },
      );

      return parseFloat(bebanPenyusutanGedung?.penyusutan_bulan) || 0;
    },
  });
}

async function modalTidakTetap() {
  return generateNeraca({
    akun: "MODAL TIDAK TETAP (R/C)",
    includeNeracaAwal: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.TAGIHAN_LISTRIK,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function modalDisetor() {
  return generateNeraca({
    akun: "MODAL DISETOR",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function usahaLainLainToko() {
  return generateNeraca({
    akun: "USAHA LAIN-LAIN TOKO",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function modalUnitToko() {
  return generateNeraca({
    akun: "MODAL UNIT TOKO",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function shuTh2023() {
  return generateNeraca({
    akun: "SHU TH. 2023",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function shuTh2024() {
  return generateNeraca({
    akun: "SHU TH. 2024",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function shuTh2025() {
  return generateNeraca({
    akun: "SHU TH. 2025",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function utangDagang() {
  return generateNeraca({
    akun: "UTANG DAGANG",
    includeNeracaAwal: true,
    getDebit: async () => {
      const hutangDagang = await getHutangDagang();

      const totalHutangDagang = hutangDagang.reduce(
        (sum, hutang) => sum + parseFloat(hutang.nominal),
        0,
      );
      const returCredit = await getTotalRetur("kredit", startDate, endDate);

      return totalHutangDagang + returCredit;
    },
    getKredit: async () => {
      const purchases = await getCurrentMonthPurchase("kredit");

      return purchases.reduce(
        (sum, p) => sum + parseFloat(p.total_harga_beli),
        0,
      );
    },
  });
}

async function utangPihakKetiga() {
  return generateNeraca({
    akun: "UTANG DARI PIHAK KETIGA",
    includeNeracaAwal: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.PEMBAYARAN_HUTANG_PIHAK_KETIGA,
        startDate,
        endDate,
      );
    },
    getKredit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.HUTANG_PIHAK_KETIGA,
        startDate,
        endDate,
      );
    },
  });
}

async function utangDariSP() {
  return generateNeraca({
    akun: "UTANG DARI SP",
    includeNeracaAwal: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function penjualanTunai() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 0,
    getKredit: async () => {
      const sales = await getCurrentMonthSale("tunai");
      return sales.reduce(
        (sum, sale) => sum + parseFloat(sale.total_nilai_jual),
        0,
      );
    },
  });
}

async function penjualanQris() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 0,
    getKredit: async () => {
      const sales = await getCurrentMonthSale("qris");
      return sales.reduce(
        (sum, sale) => sum + parseFloat(sale.total_nilai_jual),
        0,
      );
    },
  });
}

async function penjualanKredit() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 0,
    getKredit: async () => {
      const sales = await getCurrentMonthSale("kredit");
      return sales.reduce(
        (sum, sale) => sum + parseFloat(sale.total_nilai_jual),
        0,
      );
    },
  });
}

async function hargaPokokPenjualan() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      const [cashSales, qrisSales, kreditSales] = await Promise.all([
        getCurrentMonthSale("tunai"),
        getCurrentMonthSale("qris"),
        getCurrentMonthSale("kredit"),
      ]);

      const allSales = [...cashSales, ...qrisSales, ...kreditSales];
      return allSales.reduce(
        (sum, sale) => sum + parseFloat(sale.total_nilai_beli),
        0,
      );
    },
    getKredit: async () => 0,
  });
}

async function returPenjualan() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 0,
    getKredit: async () => 0,
  });
}

async function pendapatanSewa() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 0,
    getKredit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.TENANT,
        startDate,
        endDate,
      );
    },
  });
}

async function pendapatanLainLain() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 0,
    getKredit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.PENDAPATAN_LAIN_LAIN,
        startDate,
        endDate,
      );
    },
  });
}

async function pembelianTunai() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      const purchases = await getCurrentMonthPurchase("tunai");
      return purchases.reduce(
        (sum, p) => sum + parseFloat(p.total_harga_beli),
        0,
      );
    },
    getKredit: async () => 0,
  });
}

async function pembelianKredit() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      const purchases = await getCurrentMonthPurchase("kredit");
      return purchases.reduce(
        (sum, p) => sum + parseFloat(p.total_harga_beli),
        0,
      );
    },
    getKredit: async () => 0,
  });
}

async function hargaPokokPembelian() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      const returCash = await getTotalRetur("tunai", startDate, endDate);
      const returCredit = await getTotalRetur("kredit", startDate, endDate);

      return returCash + returCredit;
    },
    getKredit: async () => {
      const purchasesCash = await getCurrentMonthPurchase("tunai");
      const purchasesCredit = await getCurrentMonthPurchase("kredit");

      let total = purchasesCash.reduce(
        (sum, p) => sum + parseFloat(p.total_harga_beli),
        0,
      );
      total += purchasesCredit.reduce(
        (sum, p) => sum + parseFloat(p.total_harga_beli),
        0,
      );

      return total;
    },
  });
}

async function returPembelian() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 0,
    getKredit: async () => {
      const returCash = await getTotalRetur("tunai", startDate, endDate);
      const returCredit = await getTotalRetur("kredit", startDate, endDate);

      return returCash + returCredit;
    },
  });
}

async function bebanGaji() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.BEBAN_GAJI,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function uangMakan() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.UANG_MAKAN_KARYAWAN,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function thrKaryawan() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.THR_KARYAWAN,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function bebanAdmUmum() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.BEBAN_ADM_UMUM,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function bebanPerlengkapanToko() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.BEBAN_PERLENGKAPAN,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function bebanPenyusutanInventaris() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      const bebanPenyusutanInventaris =
        await prismaClient.penyusutanAset.findFirst({
          where: {
            jenis_aset: "inventaris",
            tahun: newYear,
          },
          select: {
            penyusutan_bulan: true,
          },
        });

      return parseFloat(bebanPenyusutanInventaris?.penyusutan_bulan) || 0;
    },
    getKredit: async () => 0,
  });
}

async function bebanPenyusutanGedung() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      const bebanPenyusutanGedung = await prismaClient.penyusutanAset.findFirst(
        {
          where: {
            jenis_aset: "gedung",
            tahun: newYear,
          },
          select: {
            penyusutan_bulan: true,
          },
        },
      );

      return parseFloat(bebanPenyusutanGedung?.penyusutan_bulan) || 0;
    },
    getKredit: async () => 0,
  });
}

async function pemeliharaanInventaris() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.PEMELIHARAAN_INVENTARIS,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function pemeliharaanGedung() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.PEMELIHARAAN_GEDUNG,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function pengeluaranLainLain() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.LAIN_LAIN,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function bebanKerugianPersediaan() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => 1000000,
    getKredit: async () => 0,
  });
}

async function honorPengurus() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.HONOR_PENGURUS,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

async function honorPengawas() {
  return generateNeraca({
    includeHasilUsaha: true,
    getDebit: async () => {
      return await getTotalCashInOutByDateRange(
        CASH_OUT_CODES.HONOR_PENGAWAS,
        startDate,
        endDate,
      );
    },
    getKredit: async () => 0,
  });
}

export {
  kas,
  bankBri,
  bankBni,
  piutangDagang,
  persediaan,
  penghapusanPersediaan,
  inventaris,
  akumPenyInventaris,
  gedung,
  akumPenyGedung,
  modalTidakTetap,
  modalDisetor,
  usahaLainLainToko,
  modalUnitToko,
  shuTh2023,
  shuTh2024,
  shuTh2025,
  utangDagang,
  utangPihakKetiga,
  utangDariSP,
  penjualanTunai,
  penjualanQris,
  penjualanKredit,
  hargaPokokPenjualan,
  returPenjualan,
  pendapatanSewa,
  pendapatanLainLain,
  pembelianTunai,
  pembelianKredit,
  hargaPokokPembelian,
  returPembelian,
  bebanGaji,
  uangMakan,
  thrKaryawan,
  bebanAdmUmum,
  bebanPerlengkapanToko,
  bebanPenyusutanInventaris,
  bebanPenyusutanGedung,
  pemeliharaanInventaris,
  pemeliharaanGedung,
  pengeluaranLainLain,
  bebanKerugianPersediaan,
  honorPengurus,
  honorPengawas,
};
