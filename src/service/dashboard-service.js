import { prismaClient } from "../application/database.js";
import { monthlyIncomeValidation } from "../validation/dashboard-validation.js";
import { validate } from "../validation/validation.js";
import { generateDate } from "../utils/generate-date.js";
import laporanService from "./laporan/laporan-service.js";

const getDashboardIncome = async () => {
  // Mendapatkan offset zona waktu (dalam menit) dan mengonversinya ke milidetik

  // Mengatur waktu sekarang ke UTC+7
  const today = generateDate();

  // Mengatur awal dan akhir hari di zona waktu UTC+7
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0, // Awal hari
  );

  const todayEnd = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
    0,
    0,
    0, // Awal hari berikutnya
  );

  // Mendapatkan data penjualan hari ini
  const sales = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: todayStart, // Menggunakan objek Date sesuai zona waktu
        lt: todayEnd,
      },
    },
  });

  // Mengatur waktu untuk kemarin
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000); // Hari kemarin

  const yesterdayStart = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
    0,
    0,
    0, // Awal hari kemarin
  );

  const yesterdayEnd = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate() + 1,
    0,
    0,
    0, // Akhir hari kemarin
  );

  // Mendapatkan data penjualan kemarin
  const salesYesterday = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: yesterdayStart,
        lt: yesterdayEnd,
      },
    },
  });

  // Menghitung total penjualan hari ini dan kemarin
  let totalSaleToday = 0;
  let totalSaleYesterday = 0;

  sales.forEach((sale) => {
    totalSaleToday += parseFloat(sale.total_nilai_jual);
  });

  salesYesterday.forEach((sale) => {
    totalSaleYesterday += parseFloat(sale.total_nilai_jual);
  });

  // Menghitung total dari table cash in out dengan id_cash = 1 hari ini
  const cashInToday = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      tg_transaksi: {
        gte: todayStart,
        lt: todayEnd,
      },
    },
  });

  // Menghitung total dari table cash in out dengan id_cash = 1 kemarin
  const cashInYesterday = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      tg_transaksi: {
        gte: yesterdayStart,
        lt: yesterdayEnd,
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
