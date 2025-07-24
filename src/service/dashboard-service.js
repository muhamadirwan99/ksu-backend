import { prismaClient } from "../application/database.js";
import { monthlyIncomeValidation } from "../validation/dashboard-validation.js";
import { validate } from "../validation/validation.js";
import { generateDate } from "../utils/generate-date.js";
import laporanService from "./laporan/laporan-service.js";

const getDashboardIncome = async () => {
  // Mendapatkan tanggal hari ini dalam WIB
  const today = generateDate();
  const todayUTC = new Date(); // Current UTC time

  // Untuk dashboard, kita ingin menghitung transaksi berdasarkan tanggal actual di UTC
  // bukan berdasarkan timezone conversion

  // Dapatkan tanggal hari ini dan kemarin dalam UTC
  const todayUTCDate = {
    year: todayUTC.getUTCFullYear(),
    month: todayUTC.getUTCMonth(),
    day: todayUTC.getUTCDate(),
  };

  const yesterdayUTC = new Date(todayUTC.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayUTCDate = {
    year: yesterdayUTC.getUTCFullYear(),
    month: yesterdayUTC.getUTCMonth(),
    day: yesterdayUTC.getUTCDate(),
  };

  // Range untuk mengambil data dari 2 hari terakhir
  const twoDaysAgo = new Date(todayUTC.getTime() - 2 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(todayUTC.getTime() + 24 * 60 * 60 * 1000);

  // Ambil semua data dari rentang luas, lalu filter manual
  const allSales = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: twoDaysAgo,
        lt: tomorrow,
      },
    },
  });

  // Filter transaksi berdasarkan tanggal UTC yang sebenarnya
  const salesToday = allSales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    return (
      saleDate.getUTCFullYear() === todayUTCDate.year &&
      saleDate.getUTCMonth() === todayUTCDate.month &&
      saleDate.getUTCDate() === todayUTCDate.day
    );
  });

  const salesYesterday = allSales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    return (
      saleDate.getUTCFullYear() === yesterdayUTCDate.year &&
      saleDate.getUTCMonth() === yesterdayUTCDate.month &&
      saleDate.getUTCDate() === yesterdayUTCDate.day
    );
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

  // Untuk cash in out, kita juga perlu menggunakan logic yang sama
  const allCashIn = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      tg_transaksi: {
        gte: twoDaysAgo,
        lt: tomorrow,
      },
    },
  });

  // Filter cash in berdasarkan tanggal UTC yang sebenarnya
  const cashInToday = allCashIn.filter((cash) => {
    const cashDate = new Date(cash.tg_transaksi);
    return (
      cashDate.getUTCFullYear() === todayUTCDate.year &&
      cashDate.getUTCMonth() === todayUTCDate.month &&
      cashDate.getUTCDate() === todayUTCDate.day
    );
  });

  const cashInYesterday = allCashIn.filter((cash) => {
    const cashDate = new Date(cash.tg_transaksi);
    return (
      cashDate.getUTCFullYear() === yesterdayUTCDate.year &&
      cashDate.getUTCMonth() === yesterdayUTCDate.month &&
      cashDate.getUTCDate() === yesterdayUTCDate.day
    );
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
    total_last_month_sale
  );

  // Keuntungan
  const keuntunganToko =
    total_current_month_sale - total_current_month_sale_nilai_beli;
  const keuntunganTokoLastMonth =
    total_last_month_sale - total_last_month_sale_nilai_beli;
  const presentaseKeuntungan = getPercentageChange(
    keuntunganToko,
    keuntunganTokoLastMonth
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
    pendapatanKoperasiLastMonth
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
    pengeluaranKoperasiLastMonth
  );

  // Keuntungan Koperasi
  const keuntunganKoperasi = pendapatanKoperasi - pengeluaranKoperasi;
  const keuntunganKoperasiLastMonth =
    pendapatanKoperasiLastMonth - pengeluaranKoperasiLastMonth;

  const presentaseKeuntunganKoperasi = getPercentageChange(
    keuntunganKoperasi,
    keuntunganKoperasiLastMonth
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
