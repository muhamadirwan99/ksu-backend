import { prismaClient } from "../../application/database.js";

let startDate, endDate;
let lastMonthStartDate, lastMonthEndDate;
let totalCurrentMonthSale, totalLastMonthSale;
let grossProfitCurrent, grossProfitLast;

function getDate(request) {
  // Mendapatkan data bulan dan tahun dari request
  const month = request.month;
  const year = request.year;

  // Tanggal awal dan akhir bulan ini dalam UTC
  startDate = new Date(Date.UTC(year, month - 1, 1));
  endDate = new Date(Date.UTC(year, month, 1)); // Awal bulan berikutnya

  if (month === 1) {
    // Jika bulan Januari, bulan sebelumnya adalah Desember tahun lalu
    lastMonthStartDate = new Date(Date.UTC(year - 1, 11, 1)); // 1 Desember tahun lalu
    lastMonthEndDate = new Date(Date.UTC(year, 0, 1)); // 1 Januari tahun ini
  } else {
    // Bulan sebelumnya masih dalam tahun yang sama
    lastMonthStartDate = new Date(Date.UTC(year, month - 2, 1)); // Awal bulan sebelumnya
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

async function getTotalRetur(startDate, endDate) {
  const result = await prismaClient.retur.aggregate({
    where: {
      created_at: {
        gte: startDate,
        lt: endDate,
      },
    },
    _sum: {
      total_nilai_beli: true,
    },
  });

  return parseFloat(result._sum.total_nilai_beli) || 0;
}

async function getInventorySnapshot(tanggalSnapshot) {
  return prismaClient.product.findMany({
    where: {
      updated_at: {
        lt: tanggalSnapshot, // hanya stok yang sudah tercatat sebelum tanggal ini
      },
    },
    select: {
      harga_beli: true,
      jumlah: true,
    },
  });
}

async function laporanHargaPokokPenjualan() {
  // SET tanggal snapshot agar konsisten: awal bulan untuk inventoryAtStart, dan awal bulan berikutnya untuk inventoryAtEnd
  const tanggalAwalBulanIni = startDate; // contoh: 1 April 2025
  const tanggalAwalBulanLalu = lastMonthStartDate; // contoh: 1 Maret 2025
  const tanggalAwalBulanDepan = endDate; // contoh: 1 Mei 2025

  // Dapatkan semua data produk yang tersedia pada tanggal 1
  const inventoryAtStart = await getInventorySnapshot(tanggalAwalBulanIni);

  const inventoryAtEnd = await getInventorySnapshot(tanggalAwalBulanLalu);

  // Hitung total nilai persediaan awal (stok * harga beli)
  const totalCurrentInventoryValue = inventoryAtStart.reduce((total, item) => {
    return total + parseFloat(item.jumlah) * parseFloat(item.harga_beli);
  }, 0);

  const totalLastInventoryValue = inventoryAtEnd.reduce((total, item) => {
    return total + parseFloat(item.jumlah) * parseFloat(item.harga_beli);
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

  const [returCurrent, returLast] = await Promise.all([
    getTotalRetur(startDate, endDate),
    getTotalRetur(lastMonthStartDate, lastMonthEndDate),
  ]);

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

  const totalSalesCurrent =
    readyToSellCurrent -
    (totalCurrentMonthCashPurchase + totalCurrentMonthCreditPurchase);
  const totalSalesLast =
    readyToSellLast -
    (totalLastMonthCashPurchase + totalLastMonthCreditPurchase);

  grossProfitCurrent = totalCurrentMonthSale - totalSalesCurrent;
  grossProfitLast = totalLastMonthSale - totalSalesLast;

  return {
    persediaan_awal: totalCurrentInventoryValue,
    persediaan_awal_last_month: totalLastInventoryValue,
    pembelian_tunai: totalCurrentMonthCashPurchase,
    pembelian_tunai_last_month: totalLastMonthCashPurchase,
    pembelian_kredit: totalCurrentMonthCreditPurchase,
    pembelian_kredit_last_month: totalLastMonthCreditPurchase,
    retur: returCurrent,
    retur_last_month: returLast,
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
      tg_transaksi: {
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

    const [totalBebanAdmCurrent, totalBebanAdmLast] = await Promise.all([
      getTotalCashInOutByDateRange(8, startDate, endDate),
      getTotalCashInOutByDateRange(8, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalBebanPerlengkapanCurrent, totalBebanPerlengkapanLast] =
      await Promise.all([
        getTotalCashInOutByDateRange(9, startDate, endDate),
        getTotalCashInOutByDateRange(9, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [
      totalPemeliharaanInventarisCurrent,
      totalPemeliharaanInventarisLast,
    ] = await Promise.all([
      getTotalCashInOutByDateRange(10, startDate, endDate),
      getTotalCashInOutByDateRange(10, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalPemeliharaanGedungCurrent, totalPemeliharaanGedungLast] =
      await Promise.all([
        getTotalCashInOutByDateRange(11, startDate, endDate),
        getTotalCashInOutByDateRange(11, lastMonthStartDate, lastMonthEndDate),
      ]);

    const [totalPengeluaranLain, totalPengeluaranLainLast] = await Promise.all([
      getTotalPendapatanLain(startDate, endDate),
      getTotalPendapatanLain(lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalBebanKerugianPersediaan, totalBebanKerugianPersediaanLast] = [
      1000000, 1000000,
    ];

    const [totalBebanPenyusutanInventaris, totalBebanPenyusutanGedung] =
      await Promise.all([
        prismaClient.penyusutanAset.findFirst({
          where: {
            jenis_aset: "inventaris",
            tahun: startDate.getFullYear(),
          },
          select: {
            penyusutan_bulan: true,
          },
        }),
        prismaClient.penyusutanAset.findFirst({
          where: {
            jenis_aset: "gedung",
            tahun: startDate.getFullYear(),
          },
          select: {
            penyusutan_bulan: true,
          },
        }),
      ]);

    const totalBebanOperasionalCurrent =
      totalBebanGajiCurrent +
      totalUangMakanCurrent +
      totalThrKaryawanCurrent +
      totalBebanAdmCurrent +
      totalBebanPerlengkapanCurrent +
      parseFloat(totalBebanPenyusutanInventaris.penyusutan_bulan) +
      parseFloat(totalBebanPenyusutanGedung.penyusutan_bulan) +
      totalPemeliharaanInventarisCurrent +
      totalPemeliharaanGedungCurrent +
      totalBebanKerugianPersediaan +
      totalPengeluaranLain;

    const totalBebanOperasionalLast =
      totalBebanGajiLast +
      totalUangMakanLast +
      totalThrKaryawanLast +
      totalBebanAdmLast +
      totalBebanPerlengkapanLast +
      parseFloat(totalBebanPenyusutanInventaris.penyusutan_bulan) +
      parseFloat(totalBebanPenyusutanGedung.penyusutan_bulan) +
      totalPemeliharaanInventarisLast +
      totalPemeliharaanGedungLast +
      totalBebanKerugianPersediaanLast +
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
      beban_adm: totalBebanAdmCurrent,
      beban_adm_last_month: totalBebanAdmLast,
      beban_perlengkapan: totalBebanPerlengkapanCurrent,
      beban_perlengkapan_last_month: totalBebanPerlengkapanLast,
      beban_peny_inventaris: parseFloat(
        totalBebanPenyusutanInventaris.penyusutan_bulan,
      ),
      beban_peny_inventaris_last_month: parseFloat(
        totalBebanPenyusutanInventaris.penyusutan_bulan,
      ),
      beban_peny_gedung: parseFloat(
        totalBebanPenyusutanGedung.penyusutan_bulan,
      ),
      beban_peny_gedung_last_month: parseFloat(
        totalBebanPenyusutanGedung.penyusutan_bulan,
      ),
      pemeliharaan_inventaris: totalPemeliharaanInventarisCurrent,
      pemeliharaan_inventaris_last_month: totalPemeliharaanInventarisLast,
      pemeliharaan_gedung: totalPemeliharaanGedungCurrent,
      pemeliharaan_gedung_last_month: totalPemeliharaanGedungLast,
      beban_kerugian_persediaan: totalBebanKerugianPersediaan,
      beban_kerugian_persediaan_last_month: totalBebanKerugianPersediaanLast,
      pengeluaran_lain: totalPengeluaranLain,
      pengeluaran_lain_last_month: totalPengeluaranLainLast,
      total_beban_operasional: totalBebanOperasionalCurrent,
      total_beban_operasional_last_month: totalBebanOperasionalLast,
      hasil_usaha_bersih: hasilUsahaBersih,
      hasil_usaha_bersih_last_month: hasilUsahaBersihLast,
    };
  } catch (error) {
    console.error("Error in laporanBebanOperasional:", error);
    throw new Error(`Failed to retrieve operational expenses report. ${error}`);
  }
}

async function laporanPendapatanLain() {
  try {
    const [totalTenantCurrent, totalTenantLast] = await Promise.all([
      getTotalCashInOutByDateRange(3, startDate, endDate),
      getTotalCashInOutByDateRange(3, lastMonthStartDate, lastMonthEndDate),
    ]);

    const [totalLainLainCurrent, totalLainLainLast] = await Promise.all([
      getTotalCashInOutByDateRange(4, startDate, endDate),
      getTotalCashInOutByDateRange(4, lastMonthStartDate, lastMonthEndDate),
    ]);

    const totalPendapatanLainCurrent =
      totalTenantCurrent + totalLainLainCurrent;
    const totalPendapatanLainLast = totalTenantLast + totalLainLainLast;

    return {
      tenant: totalTenantCurrent,
      tenant_last_month: totalTenantLast,
      lain_lain: totalLainLainCurrent,
      lain_lain_last_month: totalLainLainLast,
      total_pendapatan_lain: totalPendapatanLainCurrent,
      total_pendapatan_lain_last_month: totalPendapatanLainLast,
    };
  } catch (error) {
    console.error("Error in laporanBebanOperasional:", error);
    throw new Error("Failed to retrieve operational other report.");
  }
}

export {
  getDate,
  laporanPenjualan,
  laporanHargaPokokPenjualan,
  laporanBebanOperasional,
  laporanPendapatanLain,
  getTotalCashInOutByDateRange,
};
