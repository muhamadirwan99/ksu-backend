import { prismaClient } from "../application/database.js";

const getDashboardIncome = async (request) => {
  // Mendapatkan data dari table penjualan berdasarkan tanggal hari ini
  const today = new Date();
  const todayStart = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );
  const todayEnd = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + 1),
  );

  // Gunakan Date object langsung
  const purchases = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: todayStart, // Menggunakan objek Date, bukan Unix timestamp
        lt: todayEnd,
      },
    },
  });

  // Mendapatkan data penjualan kemarin
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Mengatur awal hari kemarin (yesterdayStart) di UTC
  const yesterdayStart = new Date(
    Date.UTC(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    ),
  );

  // Mengatur akhir hari kemarin (yesterdayEnd) di UTC
  const yesterdayEnd = new Date(
    Date.UTC(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate() + 1,
    ),
  );

  const purchasesYesterday = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: yesterdayStart, // Menggunakan objek Date
        lt: yesterdayEnd,
      },
    },
  });

  // Menghitung total penjualan hari ini dan kemarin
  let totalPurchaseToday = 0;
  let totalPurchaseYesterday = 0;

  purchases.forEach((purchase) => {
    totalPurchaseToday += parseFloat(purchase.total_nilai_jual);
  });

  purchasesYesterday.forEach((purchase) => {
    totalPurchaseYesterday += parseFloat(purchase.total_nilai_jual);
  });

  // Menghitung total dari table cash in out dengan id_cash = 1 hari ini
  const cashInToday = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      created_at: {
        gte: todayStart, // Menggunakan objek Date
        lt: todayEnd,
      },
    },
  });

  // Menghitung total dari table cash in out dengan id_cash = 1 kemarin
  const cashInYesterday = await prismaClient.cashInOut.findMany({
    where: {
      id_cash: "1",
      created_at: {
        gte: yesterdayStart, // Menggunakan objek Date
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
    parseFloat(totalPurchaseToday) + parseFloat(totalCashInToday);
  const totalIncomeYesterday =
    parseFloat(totalPurchaseYesterday) + parseFloat(totalCashInYesterday);

  // Menghitung persentase kenaikan dari total income hari ini dan kemarin
  const percentage =
    ((totalIncomeToday - totalIncomeYesterday) / totalIncomeYesterday) * 100;

  return {
    total_income_today: totalIncomeToday,
    total_income_yesterday: totalIncomeYesterday,
    percentage: percentage,
  };
};

export default {
  getDashboardIncome,
};
