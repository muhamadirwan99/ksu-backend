import { prismaClient } from "../application/database.js";
import { monthlyIncomeValidation } from "../validation/dashboard-validation.js";
import { validate } from "../validation/validation.js";
import { generateDate } from "../utils/generate-date.js";
import { getTotalRetur } from "./laporan/lap-hasil-usaha.js";

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

const getStatisticIncomeMonthly = async (request) => {
  request = validate(monthlyIncomeValidation, request);
  // Mendapatkan data penjualan berdasarkan request.month dan request.year
  const month = request.month;
  const year = request.year;

  // Tanggal awal dan akhir bulan saat ini
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1)); // Awal bulan berikutnya

  // Jika bulan adalah Januari (1), bulan sebelumnya harus Desember tahun lalu
  let lastMonthStartDate, lastMonthEndDate;
  if (month === 1) {
    // Bulan sebelumnya adalah Desember tahun sebelumnya
    lastMonthStartDate = new Date(Date.UTC(year - 1, 11, 1)); // Desember tahun lalu
    lastMonthEndDate = new Date(Date.UTC(year - 1, 12, 1)); // Awal Januari tahun ini
  } else {
    // Bulan sebelumnya masih dalam tahun yang sama
    lastMonthStartDate = new Date(Date.UTC(year, month - 2, 1)); // Bulan sebelumnya
    lastMonthEndDate = new Date(Date.UTC(year, month - 1, 1)); // Awal bulan ini
  }

  const purchasesCurrentMonth = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const purchasesLastMonth = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: lastMonthStartDate,
        lt: lastMonthEndDate,
      },
    },
  });

  let totalPurchaseCurrentMonth = 0;
  let totalPurchaseLastMonth = 0;

  purchasesCurrentMonth.forEach((purchase) => {
    totalPurchaseCurrentMonth += parseFloat(purchase.total_nilai_beli);
  });

  purchasesLastMonth.forEach((purchase) => {
    totalPurchaseLastMonth += parseFloat(purchase.total_nilai_beli);
  });

  // Mendapatkan data cash in berdasarkan request.month dan request.year
  const cashInCurrentMonth = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      tg_transaksi: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const cashInLastMonth = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      tg_transaksi: {
        gte: lastMonthStartDate,
        lt: lastMonthEndDate,
      },
    },
  });

  let totalCashInCurrentMonth = 0;
  let totalCashInLastMonth = 0;

  cashInCurrentMonth.forEach((cashIn) => {
    totalCashInCurrentMonth += parseFloat(cashIn.nominal);
  });

  cashInLastMonth.forEach((cashIn) => {
    totalCashInLastMonth += parseFloat(cashIn.nominal);
  });

  // Mendapatkan data penjualan berdasarkan request.month dan request.year
  let totalSaleCurrentMonth = 0;
  let totalSaleLastMonth = 0;

  purchasesCurrentMonth.forEach((purchase) => {
    totalSaleCurrentMonth += parseFloat(purchase.total_nilai_jual);
  });

  purchasesLastMonth.forEach((purchase) => {
    totalSaleLastMonth += parseFloat(purchase.total_nilai_jual);
  });

  // Mendapatkan data cash out berdasarkan request.month dan request.year
  const cashOutCurrentMonth = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "2",
      tg_transaksi: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  const cashOutLastMonth = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "2",
      tg_transaksi: {
        gte: lastMonthStartDate,
        lt: lastMonthEndDate,
      },
    },
  });

  let totalCashOutCurrentMonth = 0;
  let totalCashOutLastMonth = 0;

  cashOutCurrentMonth.forEach((cashOut) => {
    totalCashOutCurrentMonth += parseFloat(cashOut.nominal);
  });

  cashOutLastMonth.forEach((cashOut) => {
    totalCashOutLastMonth += parseFloat(cashOut.nominal);
  });

  const totalIncomeCurrentMonth =
    totalSaleCurrentMonth + totalCashInCurrentMonth;

  const totalIncomeLastMonth = totalSaleLastMonth + totalCashInLastMonth;

  const [returCurrent, returLast] = await Promise.all([
    getTotalRetur(startDate, endDate),
    getTotalRetur(lastMonthStartDate, lastMonthEndDate),
  ]);

  const totalExpenseCurrentMonth =
    parseFloat(totalPurchaseCurrentMonth) -
    returCurrent +
    parseFloat(totalCashOutCurrentMonth);

  const totalProfitCurrentMonth =
    parseFloat(totalSaleCurrentMonth) - parseFloat(totalPurchaseCurrentMonth);

  const totalExpenseLastMonth =
    parseFloat(totalPurchaseLastMonth) -
    returLast +
    parseFloat(totalCashOutLastMonth);

  const totalProfitLastMonth =
    parseFloat(totalSaleLastMonth) - parseFloat(totalPurchaseLastMonth);

  // Menghitung persentase kenaikan dari total income bulan ini dan bulan lalu
  const percentageIncome =
    ((totalIncomeCurrentMonth - totalIncomeLastMonth) / totalIncomeLastMonth) *
    100;

  // Menghitung persentase kenaikan dari total expense bulan ini dan bulan lalu
  const percentageExpense =
    ((totalExpenseCurrentMonth - totalExpenseLastMonth) /
      totalExpenseLastMonth) *
    100;

  // Menghitung persentase kenaikan dari total profit bulan ini dan bulan lalu
  const percentageProfit =
    ((totalProfitCurrentMonth - totalProfitLastMonth) / totalProfitLastMonth) *
    100;

  return {
    total_income: totalIncomeCurrentMonth,
    percentage_income: percentageIncome,
    total_expense: totalExpenseCurrentMonth,
    percentage_expense: percentageExpense,
    total_profit: totalProfitCurrentMonth,
    percentage_profit: percentageProfit,
  };
};

export default {
  getDashboardIncome,
  getStatisticIncomeMonthly,
};
