import { prismaClient } from "../application/database.js";
import { monthlyIncomeValidation } from "../validation/dashboard-validation.js";
import { validate } from "../validation/validation.js";
import { generateDate } from "../utils/generate-date.js";
import laporanService from "./laporan/laporan-service.js";

const getDashboardIncome = async () => {
  /**
   * PENTING: CARA KERJA TIMEZONE GMT+7
   * ===================================
   *
   * 1. generateDate() menambah 7 jam ke UTC saat menyimpan data
   *    Contoh: Tanggal 2 Feb 2026 pukul 10:00 WIB
   *            → disimpan sebagai: 2026-02-02T10:00:00.000Z (bukan 2026-02-02T03:00:00.000Z)
   *
   * 2. Database menyimpan data dengan offset +7 jam sudah ter-apply
   *    Transaksi tanggal 2 Feb WIB → created_at antara 2026-02-02T00:00:00Z sampai 2026-02-02T23:59:59Z
   *
   * 3. Query yang BENAR: Langsung pakai UTC date TANPA kurang/tambah offset
   *    ✅ BENAR: Query 2026-02-02T00:00:00.000Z to 2026-02-02T23:59:59.999Z
   *    ❌ SALAH: Query 2026-02-01T17:00:00.000Z to 2026-02-02T16:59:59.999Z (ini akan ambil data tanggal 1 juga!)
   *
   * 4. Kenapa? Karena data sudah disimpan dengan +7 jam offset, jadi tidak perlu dikurangi lagi
   *
   * Ringkasan: generateDate() sudah handle timezone, query tinggal pakai date UTC langsung!
   */

  // Mendapatkan tanggal hari ini dalam WIB (sudah ada offset +7 jam)
  const todayWIB = generateDate();

  // Dapatkan komponen tanggal untuk hari ini (WIB)
  const todayWIBDate = {
    year: todayWIB.getUTCFullYear(),
    month: todayWIB.getUTCMonth(),
    day: todayWIB.getUTCDate(),
  };

  // Kemarin (WIB) - kurangi 1 hari dari todayWIB
  const yesterdayWIB = new Date(todayWIB.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayWIBDate = {
    year: yesterdayWIB.getUTCFullYear(),
    month: yesterdayWIB.getUTCMonth(),
    day: yesterdayWIB.getUTCDate(),
  };

  // Buat range query untuk hari ini: 00:00:00.000 sampai 23:59:59.999 (tanggal WIB hari ini)
  const todayStart = new Date(
    Date.UTC(
      todayWIBDate.year,
      todayWIBDate.month,
      todayWIBDate.day,
      0,
      0,
      0,
      0,
    ),
  );
  const todayEnd = new Date(
    Date.UTC(
      todayWIBDate.year,
      todayWIBDate.month,
      todayWIBDate.day,
      23,
      59,
      59,
      999,
    ),
  );

  // Buat range query untuk kemarin
  const yesterdayStart = new Date(
    Date.UTC(
      yesterdayWIBDate.year,
      yesterdayWIBDate.month,
      yesterdayWIBDate.day,
      0,
      0,
      0,
      0,
    ),
  );
  const yesterdayEnd = new Date(
    Date.UTC(
      yesterdayWIBDate.year,
      yesterdayWIBDate.month,
      yesterdayWIBDate.day,
      23,
      59,
      59,
      999,
    ),
  );

  // Query penjualan hari ini
  const salesToday = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Query penjualan kemarin
  const salesYesterday = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      },
    },
  });

  // Menghitung total penjualan hari ini dan kemarin
  let totalSaleToday = 0;
  let totalSaleYesterday = 0;

  salesToday.forEach((sale) => {
    totalSaleToday += parseFloat(sale.total_nilai_jual);
  });

  salesYesterday.forEach((sale) => {
    totalSaleYesterday += parseFloat(sale.total_nilai_jual);
  });

  // Query cash in hari ini
  const cashInToday = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      tg_transaksi: {
        gte: todayStart,
        lte: todayEnd,
      },
    },
  });

  // Query cash in kemarin
  const cashInYesterday = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      tg_transaksi: {
        gte: yesterdayStart,
        lte: yesterdayEnd,
      },
    },
  });

  let totalCashInToday = 0;
  let totalCashInYesterday = 0;

  cashInToday.forEach((cash) => {
    totalCashInToday += parseFloat(cash.nominal);
  });

  cashInYesterday.forEach((cash) => {
    totalCashInYesterday += parseFloat(cash.nominal);
  });

  const totalIncomeToday =
    parseFloat(totalSaleToday) + parseFloat(totalCashInToday);
  const totalIncomeYesterday =
    parseFloat(totalSaleYesterday) + parseFloat(totalCashInYesterday);

  let percentage;

  // Check if totalIncomeYesterday is zero to avoid division by zero
  if (totalIncomeYesterday === 0) {
    // If there was no income yesterday, but there's income today, consider it as a 100% increase
    // Or you can use another logic based on your needs, like displaying "N/A"
    percentage = totalIncomeToday > 0 ? 100 : 0;
  } else {
    // Calculate the percentage normally if totalIncomeYesterday is not zero
    percentage =
      ((totalIncomeToday - totalIncomeYesterday) / totalIncomeYesterday) * 100;
  }

  return {
    total_income_today: totalIncomeToday,
    total_income_yesterday: totalIncomeYesterday,
    percentage: percentage,
  };
};

const getPercentageChange = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

const getStatisticIncomeMonthly = async (request) => {
  request = validate(monthlyIncomeValidation, request);
  const result = await laporanService.getLaporanHasilUsaha(request);

  const {
    total_current_month_sale,
    total_last_month_sale,
    total_current_month_sale_nilai_beli,
    total_last_month_sale_nilai_beli,
  } = result.penjualan;

  // Penjualan
  const penjualanToko = total_current_month_sale;
  const presentasePenjualan = getPercentageChange(
    total_current_month_sale,
    total_last_month_sale,
  );

  // Keuntungan
  const keuntunganToko =
    total_current_month_sale - total_current_month_sale_nilai_beli;
  const keuntunganTokoLastMonth =
    total_last_month_sale - total_last_month_sale_nilai_beli;
  const presentaseKeuntungan = getPercentageChange(
    keuntunganToko,
    keuntunganTokoLastMonth,
  );

  const pendapatanToko = {
    penjualan: penjualanToko,
    presentase_penjualan: presentasePenjualan,
    keuntungan: keuntunganToko,
    presentase_keuntungan: presentaseKeuntungan,
  };

  // Pendapatan Koperasi
  const pendapatanKoperasi =
    result.penjualan.total_current_month_sale +
    result.pendapatan_lain.total_pendapatan_lain;

  const pendapatanKoperasiLastMonth =
    result.penjualan.total_last_month_sale +
    result.pendapatan_lain.total_pendapatan_lain_last_month;

  const presentasePendapatanKoperasi = getPercentageChange(
    pendapatanKoperasi,
    pendapatanKoperasiLastMonth,
  );

  // Pengeluaran Koperasi
  const pengeluaranKoperasi =
    result.harga_pokok_penjualan.pembelian_bersih +
    result.beban_operasional.total_beban_operasional;

  const pengeluaranKoperasiLastMonth =
    result.harga_pokok_penjualan.pembelian_bersih_last_month +
    result.beban_operasional.total_beban_operasional_last_month;

  const presentasePengeluaranKoperasi = getPercentageChange(
    pengeluaranKoperasi,
    pengeluaranKoperasiLastMonth,
  );

  // Keuntungan Koperasi
  const keuntunganKoperasi = pendapatanKoperasi - pengeluaranKoperasi;
  const keuntunganKoperasiLastMonth =
    pendapatanKoperasiLastMonth - pengeluaranKoperasiLastMonth;

  const presentaseKeuntunganKoperasi = getPercentageChange(
    keuntunganKoperasi,
    keuntunganKoperasiLastMonth,
  );

  const koperasi = {
    pendapatan_koperasi: pendapatanKoperasi,
    presentase_pendapatan: presentasePendapatanKoperasi,
    pengeluaran_koperasi: pengeluaranKoperasi,
    presentase_pengeluaran: presentasePengeluaranKoperasi,
    keuntungan_koperasi: keuntunganKoperasi,
    presentase_keuntungan: presentaseKeuntunganKoperasi,
  };

  return {
    pendapatan_toko: pendapatanToko,
    pendapatan_koperasi: koperasi,
  };
};

export default {
  getDashboardIncome,
  getStatisticIncomeMonthly,
};
