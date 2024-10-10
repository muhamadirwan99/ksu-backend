import { validate } from "../validation/validation.js";
import { monthlyIncomeValidation } from "../validation/dashboard-validation.js";
import { prismaClient } from "../application/database.js";

let startDate, endDate;
let lastMonthStartDate, lastMonthEndDate;
let totalCurrentMonthSale, totalLastMonthSale;
let grossProfitCurrent, grossProfitLast;

function getDate(request) {
  // Mendapatkan data bulan dan tahun dari request
  const month = request.month;
  const year = request.year;
  const timezoneOffset = 7 * 60 * 60 * 1000; // UTC+7 dalam milidetik

  // Tanggal awal bulan ini dalam zona waktu lokal
  startDate = new Date(Date.UTC(year, month - 1, 1) - timezoneOffset);
  endDate = new Date(Date.UTC(year, month, 1) - timezoneOffset);

  // Jika bulan adalah Januari (1), bulan sebelumnya harus Desember tahun lalu
  if (month === 1) {
    // Bulan sebelumnya adalah Desember tahun sebelumnya
    lastMonthStartDate = new Date(Date.UTC(year - 1, 11, 1)); // Desember tahun lalu
    lastMonthEndDate = new Date(Date.UTC(year, 0, 1)); // Awal Januari tahun ini (bulan 0 adalah Januari)
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

  grossProfitCurrent = totalCurrentMonthSale - totalSalesCurrent;
  grossProfitLast = totalLastMonthSale - totalSalesLast;

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

async function getTotalCashInOutByDateRange(idDetail, startDate, endDate) {
  const result = await prismaClient.cashInOut.aggregate({
    where: {
      id_detail: idDetail,
      created_at: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      nominal: true,
    },
  });

  return parseFloat(result._sum.nominal) || 0;
}

async function getTotalPendapatanLain(startDate, endDate) {
  const result = await prismaClient.cashInOut.aggregate({
    where: {
      id_jenis: 6,
      created_at: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      nominal: true,
    },
  });

  return parseFloat(result._sum.nominal) || 0;
}

async function laporanBebanOperasional() {
  try {
    const [totalBebanGajiCurrent, totalBebanGajiLast] = await Promise.all([
      getTotalCashInOutByDateRange(5, startDate, endDate),
      getTotalCashInOutByDateRange(5, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalUangMakanCurrent, totalUangMakanLast] = await Promise.all([
      getTotalCashInOutByDateRange(6, startDate, endDate),
      getTotalCashInOutByDateRange(6, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalThrKaryawanCurrent, totalThrKaryawanLast] = await Promise.all([
      getTotalCashInOutByDateRange(7, startDate, endDate),
      getTotalCashInOutByDateRange(7, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalTunjanganPanganCurrent, totalTunjanganPanganLast] =
      await Promise.all([
        getTotalCashInOutByDateRange(8, startDate, endDate),
        getTotalCashInOutByDateRange(8, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [totalBebanAdmCurrent, totalBebanAdmLast] = await Promise.all([
      getTotalCashInOutByDateRange(9, startDate, endDate),
      getTotalCashInOutByDateRange(9, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalBebanPerlengkapanCurrent, totalBebanPerlengkapanLast] =
      await Promise.all([
        getTotalCashInOutByDateRange(10, startDate, endDate),
        getTotalCashInOutByDateRange(10, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [totalTunjanganKesehatanCurrent, totalTunjanganKesehatanLast] =
      await Promise.all([
        getTotalCashInOutByDateRange(11, startDate, endDate),
        getTotalCashInOutByDateRange(11, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [totalBebanInventarisCurrent, totalBebanInventarisLast] =
      await Promise.all([
        getTotalCashInOutByDateRange(12, startDate, endDate),
        getTotalCashInOutByDateRange(12, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [totalBebanGedungCurrent, totalBebanGedungLast] = await Promise.all([
      getTotalCashInOutByDateRange(13, startDate, endDate),
      getTotalCashInOutByDateRange(13, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalPengeluaranLain, totalPengeluaranLainLast] = await Promise.all([
      getTotalPendapatanLain(startDate, endDate),
      getTotalPendapatanLain(lastMonthStartDate, lastMonthEndDate),
    ]);

    const totalBebanOperasionalCurrent =
      totalBebanGajiCurrent +
      totalUangMakanCurrent +
      totalThrKaryawanCurrent +
      totalTunjanganPanganCurrent +
      totalBebanAdmCurrent +
      totalBebanPerlengkapanCurrent +
      totalTunjanganKesehatanCurrent +
      totalBebanInventarisCurrent +
      totalBebanGedungCurrent +
      totalPengeluaranLain;

    const totalBebanOperasionalLast =
      totalBebanGajiLast +
      totalUangMakanLast +
      totalThrKaryawanLast +
      totalTunjanganPanganLast +
      totalBebanAdmLast +
      totalBebanPerlengkapanLast +
      totalTunjanganKesehatanLast +
      totalBebanInventarisLast +
      totalBebanGedungLast +
      totalPengeluaranLainLast;

    const hasilUsahaBersih = grossProfitCurrent - totalBebanOperasionalCurrent;
    const hasilUsahaBersihLast = grossProfitLast - totalBebanOperasionalLast;

    return {
      beban_gaji: totalBebanGajiCurrent,
      beban_gaji_last_month: totalBebanGajiLast,
      uang_makan: totalUangMakanCurrent,
      uang_makan_last_month: totalUangMakanLast,
      thr_karyawan: totalThrKaryawanCurrent,
      thr_karyawan_last_month: totalThrKaryawanLast,
      tunjangan_pangan: totalTunjanganPanganCurrent,
      tunjangan_pangan_last_month: totalTunjanganPanganLast,
      beban_adm: totalBebanAdmCurrent,
      beban_adm_last_month: totalBebanAdmLast,
      beban_perlengkapan: totalBebanPerlengkapanCurrent,
      beban_perlengkapan_last_month: totalBebanPerlengkapanLast,
      tunjangan_kesehatan: totalTunjanganKesehatanCurrent,
      tunjangan_kesehatan_last_month: totalTunjanganKesehatanLast,
      beban_peny_inventaris: 0,
      beban_peny_inventaris_last_month: 0,
      beban_peny_gedung: 0,
      beban_peny_gedung_last_month: 0,
      pemeliharaan_inventaris: totalBebanInventarisCurrent,
      pemeliharaan_inventaris_last_month: totalBebanInventarisLast,
      pemeliharaan_gedung: totalBebanGedungCurrent,
      pemeliharaan_gedung_last_month: totalBebanGedungLast,
      pengeluaran_lain: totalPengeluaranLain,
      pengeluaran_lain_last_month: totalPengeluaranLainLast,
      beban_operasional: totalBebanOperasionalCurrent,
      beban_operasional_last_month: totalBebanOperasionalLast,
      hasil_usaha_bersih: hasilUsahaBersih,
      hasil_usaha_bersih_last_month: hasilUsahaBersihLast,
    };
  } catch (error) {
    console.error("Error in laporanBebanOperasional:", error);
    throw new Error("Failed to retrieve operational expenses report.");
  }
}

async function laporanPendapatanLain() {
  try {
    const [totalPenarikanBank1Current, totalPenarikanBank1Last] =
      await Promise.all([
        getTotalCashInOutByDateRange(1, startDate, endDate),
        getTotalCashInOutByDateRange(1, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [totalPenarikanBank2Current, totalPenarikanBank2Last] =
      await Promise.all([
        getTotalCashInOutByDateRange(2, startDate, endDate),
        getTotalCashInOutByDateRange(2, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [totalTenantCurrent, totalTenantLast] = await Promise.all([
      getTotalCashInOutByDateRange(3, startDate, endDate),
      getTotalCashInOutByDateRange(3, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalLainLainCurrent, totalLainLainLast] = await Promise.all([
      getTotalCashInOutByDateRange(4, startDate, endDate),
      getTotalCashInOutByDateRange(4, lastMonthStartDate, lastMonthEndDate),
    ]);

    const totalPenarikanBankCurrent =
      totalPenarikanBank1Current + totalPenarikanBank2Current;
    const totalPenarikanBankLast =
      totalPenarikanBank1Last + totalPenarikanBank2Last;

    const totalPendapatanLainCurrent =
      totalPenarikanBankCurrent + totalTenantCurrent + totalLainLainCurrent;
    const totalPendapatanLainLast =
      totalPenarikanBankLast + totalTenantLast + totalLainLainLast;

    return {
      penarikan_bank: totalPenarikanBankCurrent,
      penarikan_bank_last_month: totalPenarikanBankLast,
      tenant: totalTenantCurrent,
      tenant_last_month: totalTenantLast,
      lain_lain: totalLainLainCurrent,
      lain_lain_last_month: totalLainLainLast,
      pendapatan_lain: totalPendapatanLainCurrent,
      pendapatan_lain_last_month: totalPendapatanLainLast,
    };
  } catch (error) {
    console.error("Error in laporanBebanOperasional:", error);
    throw new Error("Failed to retrieve operational other report.");
  }
}

const getLaporanHasilUsaha = async (request) => {
  request = validate(monthlyIncomeValidation, request);

  getDate(request);
  const laporanPenjualanResult = await laporanPenjualan();
  const laporanHargaPokokPenjualanResult = await laporanHargaPokokPenjualan();
  const laporanBebanOperasionalResult = await laporanBebanOperasional();
  const laporanPendapatanLainResult = await laporanPendapatanLain();
  const laporanSisaHasilUsaha = {
    sisa_hasil_usaha:
      laporanBebanOperasionalResult.hasil_usaha_bersih +
      laporanPendapatanLainResult.pendapatan_lain,
    sisa_hasil_usaha_last_month:
      laporanBebanOperasionalResult.hasil_usaha_bersih_last_month +
      laporanPendapatanLainResult.pendapatan_lain_last_month,
  };

  return {
    penjualan: laporanPenjualanResult,
    harga_pokok_penjualan: laporanHargaPokokPenjualanResult,
    beban_operasional: laporanBebanOperasionalResult,
    pendapatan_lain: laporanPendapatanLainResult,
    sisa_hasil_usaha: laporanSisaHasilUsaha,
  };
};

export default {
  getLaporanHasilUsaha,
};
