import { validate } from "../validation/validation.js";
import { monthlyIncomeValidation } from "../validation/dashboard-validation.js";
import { prismaClient } from "../application/database.js";

let startDate, endDate;
let lastMonthStartDate, lastMonthEndDate;
let totalCurrentMonthSale, totalLastMonthSale;

function getDate(request) {
  // Mendapatkan data bulan dan tahun dari request
  const month = request.month;
  const year = request.year;

  // Tanggal awal dan akhir bulan saat ini
  startDate = new Date(Date.UTC(year, month - 1, 1));
  endDate = new Date(Date.UTC(year, month, 1)); // Awal bulan berikutnya

  // Jika bulan adalah Januari (1), bulan sebelumnya harus Desember tahun lalu
  if (month === 1) {
    // Bulan sebelumnya adalah Desember tahun sebelumnya
    lastMonthStartDate = new Date(Date.UTC(year - 1, 11, 1)); // Desember tahun lalu
    lastMonthEndDate = new Date(Date.UTC(year - 1, 12, 1)); // Awal Januari tahun ini
  } else {
    // Bulan sebelumnya masih dalam tahun yang sama
    lastMonthStartDate = new Date(Date.UTC(year, month - 2, 1)); // Bulan sebelumnya
    lastMonthEndDate = new Date(Date.UTC(year, month - 1, 1)); // Awal bulan ini
  }
}

function getCurrentMonthSale(jenisPembayaran) {
  return prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: startDate,
        lt: endDate,
      },
      jenis_pembayaran: jenisPembayaran,
    },
  });
}

function getCurrentMonthPurchase(jenisPembayaran) {
  return prismaClient.pembelian.findMany({
    where: {
      created_at: {
        gte: startDate,
        lt: endDate,
      },
      jenis_pembayaran: jenisPembayaran,
    },
  });
}

function getLastMonthSale(jenisPembayaran) {
  return prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: lastMonthStartDate,
        lt: lastMonthEndDate,
      },
      jenis_pembayaran: jenisPembayaran,
    },
  });
}

function getLastMonthPurchase(jenisPembayaran) {
  return prismaClient.pembelian.findMany({
    where: {
      created_at: {
        gte: lastMonthStartDate,
        lt: lastMonthEndDate,
      },
      jenis_pembayaran: jenisPembayaran,
    },
  });
}

async function laporanPenjualan() {
  // Mendapatkan data penjualan berdasarkan request.month dan request.year untuk jenis pembayaran tunai
  const currentMonthCashSales = await getCurrentMonthSale("tunai");
  const lastMonthCashSales = await getLastMonthSale("tunai");

  // Menghitung total penjualan untuk jenis pembayaran tunai bulan ini dan bulan lalu
  let totalCurrentMonthCashSale = 0;
  let totalLastMonthCashSale = 0;

  currentMonthCashSales.forEach((sale) => {
    totalCurrentMonthCashSale += parseFloat(sale.total_nilai_jual);
  });

  lastMonthCashSales.forEach((sale) => {
    totalLastMonthCashSale += parseFloat(sale.total_nilai_jual);
  });

  // Mendapatkan data penjualan berdasarkan request.month dan request.year untuk jenis pembayaran kredit
  const currentMonthCreditSales = await getCurrentMonthSale("kredit");
  const lastMonthCreditSales = await getLastMonthSale("kredit");

  // Menghitung total penjualan untuk jenis pembayaran kredit bulan ini dan bulan lalu
  let totalCurrentMonthCreditSale = 0;
  let totalLastMonthCreditSale = 0;

  currentMonthCreditSales.forEach((sale) => {
    totalCurrentMonthCreditSale += parseFloat(sale.total_nilai_jual);
  });

  lastMonthCreditSales.forEach((sale) => {
    totalLastMonthCreditSale += parseFloat(sale.total_nilai_jual);
  });

  // Mendapatkan data penjualan berdasarkan request.month dan request.year untuk jenis pembayaran qris
  const currentMonthQrisSales = await getCurrentMonthSale("qris");
  const lastMonthQrisSales = await getLastMonthSale("qris");

  // Menghitung total penjualan untuk jenis pembayaran qris bulan ini dan bulan lalu
  let totalCurrentMonthQrisSale = 0;
  let totalLastMonthQrisSale = 0;

  currentMonthQrisSales.forEach((sale) => {
    totalCurrentMonthQrisSale += parseFloat(sale.total_nilai_jual);
  });

  lastMonthQrisSales.forEach((sale) => {
    totalLastMonthQrisSale += parseFloat(sale.total_nilai_jual);
  });

  // Menghitung total penjualan bulan ini dan bulan lalu
  totalCurrentMonthSale =
    parseFloat(totalCurrentMonthCashSale) +
    parseFloat(totalCurrentMonthCreditSale) +
    parseFloat(totalCurrentMonthQrisSale);

  totalLastMonthSale =
    parseFloat(totalLastMonthCashSale) +
    parseFloat(totalLastMonthCreditSale) +
    parseFloat(totalLastMonthQrisSale);

  return {
    total_current_month_sale: totalCurrentMonthSale,
    total_last_month_sale: totalLastMonthSale,
    current_month_cash_sale: totalCurrentMonthCashSale,
    last_month_cash_sale: totalLastMonthCashSale,
    current_month_credit_sale: totalCurrentMonthCreditSale,
    last_month_credit_sale: totalLastMonthCreditSale,
    current_month_qris_sale: totalCurrentMonthQrisSale,
    last_month_qris_sale: totalLastMonthQrisSale,
  };
}

async function laporanHargaPokokPenjualan() {
  // Dapatkan semua data produk yang tersedia pada tanggal 1
  const inventoryAtStart = await prismaClient.product.findMany({
    where: {
      updated_at: {
        lt: startDate, // Produk yang sudah ada sebelum atau pada tanggal 1 bulan yang diminta
      },
    },
    select: {
      harga_beli: true, // Harga beli dari produk
      jumlah: true, // Stok barang pada awal bulan
    },
  });

  const inventoryAtEnd = await prismaClient.product.findMany({
    where: {
      updated_at: {
        lt: endDate, // Produk yang sudah ada sebelum atau pada tanggal 1 bulan yang diminta
      },
    },
    select: {
      harga_beli: true, // Harga beli dari produk
      jumlah: true, // Stok barang pada awal bulan
    },
  });

  // Hitung total nilai persediaan awal (stok * harga beli)
  const totalCurrentInventoryValue = inventoryAtStart.reduce((total, item) => {
    return (
      parseFloat(total) + parseFloat(item.jumlah) * parseFloat(item.harga_beli)
    );
  }, 0);

  const totalLastInventoryValue = inventoryAtEnd.reduce((total, item) => {
    return (
      parseFloat(total) + parseFloat(item.jumlah) * parseFloat(item.harga_beli)
    );
  }, 0);

  // Mendapatkan data penjualan berdasarkan request.month dan request.year untuk jenis pembayaran tunai
  const currentMonthCashPurchases = await getCurrentMonthPurchase("tunai");
  const lastMonthCashPurchases = await getLastMonthPurchase("tunai");

  // Menghitung total penjualan untuk jenis pembayaran tunai bulan ini dan bulan lalu
  let totalCurrentMonthCashPurchase = 0;
  let totalLastMonthCashPurchase = 0;

  currentMonthCashPurchases.forEach((purchase) => {
    totalCurrentMonthCashPurchase += parseFloat(purchase.total_harga_beli);
  });

  lastMonthCashPurchases.forEach((purchase) => {
    totalLastMonthCashPurchase += parseFloat(purchase.total_harga_beli);
  });

  // Mendapatkan data penjualan berdasarkan request.month dan request.year untuk jenis pembayaran kredit
  const currentMonthCreditPurchases = await getCurrentMonthPurchase("kredit");
  const lastMonthCreditPurchases = await getLastMonthPurchase("kredit");

  // Menghitung total penjualan untuk jenis pembayaran kredit bulan ini dan bulan lalu
  let totalCurrentMonthCreditPurchase = 0;
  let totalLastMonthCreditPurchase = 0;

  currentMonthCreditPurchases.forEach((purchase) => {
    totalCurrentMonthCreditPurchase += parseFloat(purchase.total_harga_beli);
  });

  lastMonthCreditPurchases.forEach((purchase) => {
    totalLastMonthCreditPurchase += parseFloat(purchase.total_harga_beli);
  });

  const salesCurrent = await prismaClient.pembelian.findMany();

  let totalSalesCurrent = 0;

  salesCurrent.forEach((sale) => {
    totalSalesCurrent += parseFloat(sale.total_harga_beli);
  });

  // Mendapatkan total penjualan dari awal hingga bulan lalu
  const salesLast = await prismaClient.pembelian.findMany({
    where: {
      created_at: {
        lt: startDate,
      },
    },
  });

  let totalSalesLast = 0;

  salesLast.forEach((sale) => {
    totalSalesLast += parseFloat(sale.total_harga_beli);
  });

  const returCurrent = 0;
  const returLast = 0;

  const netPurchaseCurrent =
    totalCurrentMonthCashPurchase +
    totalCurrentMonthCreditPurchase -
    returCurrent;

  const netPurchaseLast =
    totalLastMonthCashPurchase + totalLastMonthCreditPurchase - returLast;

  const readyToSellCurrent =
    totalCurrentInventoryValue +
    totalCurrentMonthCashPurchase +
    totalCurrentMonthCreditPurchase -
    returCurrent;

  const readyToSellLast =
    totalLastInventoryValue +
    totalLastMonthCashPurchase +
    totalLastMonthCreditPurchase -
    returLast;

  const grossProfitCurrent = totalCurrentMonthSale - totalSalesCurrent;
  const grossProfitLast = totalLastMonthSale - totalSalesLast;

  return {
    persediaan_awal: totalCurrentInventoryValue,
    persediaan_awal_last_month: totalLastInventoryValue,
    pembelian_tunai: totalCurrentMonthCashPurchase,
    pembelian_tunai_last_month: totalLastMonthCashPurchase,
    pembelian_kredit: totalCurrentMonthCreditPurchase,
    pembelian_kredit_last_month: totalLastMonthCreditPurchase,
    pembelian_bersih: netPurchaseCurrent,
    pembelian_bersih_last_month: netPurchaseLast,
    barang_siap_jual: readyToSellCurrent,
    barang_siap_jual_last_month: readyToSellLast,
    persediaan_akhir:
      totalCurrentMonthCashPurchase + totalCurrentMonthCreditPurchase,
    persediaan_akhir_last_month:
      totalLastMonthCashPurchase + totalLastMonthCreditPurchase,
    harga_pokok_penjualan: totalSalesCurrent,
    harga_pokok_penjualan_last_month: totalSalesLast,
    hasil_usaha_kotor: grossProfitCurrent,
    hasil_usaha_kotor_last_month: grossProfitLast,
  };
}

const getLaporanHasilUsaha = async (request) => {
  request = validate(monthlyIncomeValidation, request);

  getDate(request);
  const laporanPenjualanResult = await laporanPenjualan();
  const laporanHargaPokokPenjualanResult = await laporanHargaPokokPenjualan();

  return {
    penjualan: laporanPenjualanResult,
    harga_pokok_penjualan: laporanHargaPokokPenjualanResult,
  };
};

export default {
  getLaporanHasilUsaha,
};
