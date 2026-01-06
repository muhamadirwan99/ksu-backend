import { validate } from "../../validation/validation.js";
import {
  dateValidation,
  monthlyIncomeValidation,
  yearlyIncomeValidation,
} from "../../validation/dashboard-validation.js";
import {
  getDate,
  laporanBebanOperasional,
  laporanHargaPokokPenjualan,
  laporanPendapatanLain,
  laporanPenjualan,
} from "./lap-hasil-usaha.js";
import {
  laporanPendapatan,
  laporanPengeluaran,
} from "./lap-realisasi-pendapatan.js";
import { laporanNeracaLajur } from "./lap-neraca-lajur.js";
import { prismaClient } from "../../application/database.js";
import { generateDate, getNextMonthDate } from "../../utils/generate-date.js";
import { laporanNeraca } from "./lap-neraca.js";

const getLaporanHasilUsaha = async (request) => {
  request = validate(monthlyIncomeValidation, request);

  getDate(request);
  const laporanPenjualanResult = await laporanPenjualan();
  const laporanHargaPokokPenjualanResult = await laporanHargaPokokPenjualan();
  const laporanBebanOperasionalResult = await laporanBebanOperasional();
  const laporanPendapatanLainResult = await laporanPendapatanLain();
  const sisaHasilUsaha =
    laporanBebanOperasionalResult.hasil_usaha_bersih +
    laporanPendapatanLainResult.total_pendapatan_lain;
  const sisaHasilUsahaLastMonth =
    laporanBebanOperasionalResult.hasil_usaha_bersih_last_month +
    laporanPendapatanLainResult.total_pendapatan_lain_last_month;

  const laporanSisaHasilUsaha = {
    sisa_hasil_usaha: sisaHasilUsaha,
    sisa_hasil_usaha_last_month: sisaHasilUsahaLastMonth,
  };

  const now = generateDate();
  const bulanTahun = getNextMonthDate(request.year, request.month);
  bulanTahun.setUTCHours(0, 0, 0, 0);

  const existing = await prismaClient.hasilUsaha.findFirst({
    where: {
      bulan_tahun: bulanTahun,
    },
  });

  if (existing) {
    await prismaClient.hasilUsaha.update({
      where: {
        id_hasil_usaha: existing.id_hasil_usaha,
      },
      data: {
        sisa_hasil_usaha: sisaHasilUsaha,
        updated_at: now,
      },
    });
  } else {
    await prismaClient.hasilUsaha.create({
      data: {
        sisa_hasil_usaha: sisaHasilUsaha,
        bulan_tahun: bulanTahun,
        created_at: now,
      },
    });
  }

  return {
    penjualan: laporanPenjualanResult,
    harga_pokok_penjualan: laporanHargaPokokPenjualanResult,
    beban_operasional: laporanBebanOperasionalResult,
    pendapatan_lain: laporanPendapatanLainResult,
    sisa_hasil_usaha: laporanSisaHasilUsaha,
  };
};

const getLaporanRealisasiPendapatan = async (request) => {
  request = validate(yearlyIncomeValidation, request);

  const laporanPendapatanResult = await laporanPendapatan(request.year);
  const laporanPengeluaranResult = await laporanPengeluaran(request.year);

  const sisaHasilUsaha =
    laporanPendapatanResult.total_pendapatan_per_bulan.data.map(
      (pendapatan, index) => ({
        bulan: pendapatan.bulan,
        sisa_hasil_usaha:
          pendapatan.total_pendapatan -
          laporanPengeluaranResult.total_pengeluaraan_per_bulan.data[index]
            .total_pengeluaran,
      })
    );

  const totalSisaHasilUsaha = sisaHasilUsaha.reduce(
    (acc, curr) => acc + curr.sisa_hasil_usaha,
    0
  );

  return {
    pendapatan: laporanPendapatanResult,
    pengeluaran: laporanPengeluaranResult,
    sisa_hasil_usaha: {
      jumlah: totalSisaHasilUsaha,
      data: sisaHasilUsaha,
    },
  };
};

const getLaporanNeracaLajur = async (request) => {
  request = validate(monthlyIncomeValidation, request);

  return await laporanNeracaLajur(request.month, request.year);
};

const getLaporanNeraca = async (request) => {
  request = validate(monthlyIncomeValidation, request);

  return await laporanNeraca(request.month, request.year);
};

// Helper function to calculate percentage
const calculatePercentage = (keuntungan, modal) => {
  return modal > 0 ? Math.round((keuntungan / modal) * 100) : 0;
};

// Helper function to initialize payment method structure
const initializePaymentMethodTotals = () => ({
  TUNAI: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
  QRIS: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
  KREDIT: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
});

const getLaporanPenjualan = async (request) => {
  request = validate(dateValidation, request);

  // Parse dates - using string format to match database timezone
  // Create dates at start of day (00:00:00) and end of day (23:59:59)
  const startDate = new Date(`${request.start_date}T00:00:00.000Z`);
  const endDate = new Date(`${request.end_date}T23:59:59.999Z`);

  // Validate dates
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
  }

  // Validate date range
  if (startDate > endDate) {
    throw new Error("Start date cannot be greater than end date.");
  }

  // Debug logging
  console.log("=== LAPORAN PENJUALAN DEBUG ===");
  console.log("Start Date:", startDate.toISOString());
  console.log("End Date:", endDate.toISOString());
  console.log("Request:", {
    start_date: request.start_date,
    end_date: request.end_date,
    metode_pembayaran: request.metode_pembayaran,
  });

  // Build where clause with optional payment method filter
  const whereClause = {
    created_at: {
      gte: startDate,
      lte: endDate,
    },
  };

  // Add payment method filter if provided (with null safety)
  if (request.metode_pembayaran?.trim()) {
    whereClause.jenis_pembayaran = request.metode_pembayaran.toUpperCase();
  }

  console.log("Where Clause:", JSON.stringify(whereClause, null, 2));

  // Get all sales data within the date range
  const salesData = await prismaClient.penjualan.findMany({
    where: whereClause,
    include: {
      DetailPenjualan: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`Total Sales Data Retrieved: ${salesData.length}`);
  if (salesData.length > 0) {
    console.log("Sample Sale:", {
      id: salesData[0].id_penjualan,
      created_at: salesData[0].created_at,
      jenis_pembayaran: salesData[0].jenis_pembayaran,
      detail_count: salesData[0].DetailPenjualan?.length,
    });
  }

  // Initialize data structures
  const productSummary = {};
  const paymentMethodTotals = initializePaymentMethodTotals();

  // Process sales data with null safety checks
  salesData.forEach((sale) => {
    // Handle null/undefined payment method
    if (!sale.jenis_pembayaran) {
      console.warn(`Sale ${sale.id_penjualan} has no payment method`);
      return;
    }

    const paymentMethod = sale.jenis_pembayaran.toUpperCase();

    // Skip if payment method is not recognized
    const validPaymentMethods = ["TUNAI", "QRIS", "KREDIT"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      console.warn(
        `Unknown payment method: ${paymentMethod} for sale ${sale.id_penjualan}`
      );
      return;
    }

    // Check if DetailPenjualan exists
    if (!sale.DetailPenjualan || sale.DetailPenjualan.length === 0) {
      console.warn(`Sale ${sale.id_penjualan} has no detail items`);
      return;
    }

    sale.DetailPenjualan.forEach((detail) => {
      // Null safety checks
      if (!detail.nm_produk || !detail.id_product) {
        console.warn(
          `Detail item missing product info in sale ${sale.id_penjualan}`
        );
        return;
      }

      // Check if product data exists
      if (!detail.product) {
        console.warn(
          `Product not found for ${detail.nm_produk} in sale ${sale.id_penjualan}`
        );
        return;
      }

      const productName = detail.nm_produk;
      const productId = detail.id_product;

      // Initialize product summary if not exists
      if (!productSummary[productName]) {
        productSummary[productName] = {
          id_product: productId,
          ...initializePaymentMethodTotals(),
        };
      }

      // Safe parsing with null/undefined checks
      const hargaBeli = detail.product?.harga_beli ?? 0;
      const jumlah = detail.jumlah ?? 0;
      const total = detail.total ?? 0;

      const modal = parseFloat(hargaBeli) * jumlah;
      const hasilPenjualan = parseFloat(total);
      const keuntungan = hasilPenjualan - modal;

      // Update product summary by payment method
      if (productSummary[productName][paymentMethod]) {
        productSummary[productName][paymentMethod].jumlah += jumlah;
        productSummary[productName][paymentMethod].modal += modal;
        productSummary[productName][paymentMethod].hasil_penjualan +=
          hasilPenjualan;
        productSummary[productName][paymentMethod].keuntungan += keuntungan;
      }

      // Update payment method totals
      if (paymentMethodTotals[paymentMethod]) {
        paymentMethodTotals[paymentMethod].jumlah += jumlah;
        paymentMethodTotals[paymentMethod].modal += modal;
        paymentMethodTotals[paymentMethod].hasil_penjualan += hasilPenjualan;
        paymentMethodTotals[paymentMethod].keuntungan += keuntungan;
      }
    });
  });

  // Format data for frontend
  const formattedData = [];

  // Determine which payment methods to show
  const methodsToShow = request.metode_pembayaran?.trim()
    ? [request.metode_pembayaran.toUpperCase()]
    : ["TUNAI", "QRIS", "KREDIT"];

  // Add product rows
  Object.keys(productSummary).forEach((productName) => {
    const product = productSummary[productName];

    methodsToShow.forEach((method) => {
      if (product[method] && product[method].jumlah > 0) {
        formattedData.push({
          id_product: product.id_product,
          produk: productName,
          metode_pembayaran: method,
          jumlah: product[method].jumlah,
          modal: product[method].modal,
          hasil_penjualan: product[method].hasil_penjualan,
          keuntungan: product[method].keuntungan,
          persentase: calculatePercentage(
            product[method].keuntungan,
            product[method].modal
          ),
        });
      }
    });
  });

  // Add totals for each payment method
  methodsToShow.forEach((method) => {
    if (paymentMethodTotals[method] && paymentMethodTotals[method].jumlah > 0) {
      formattedData.push({
        produk: `TOTAL PENJUALAN ${method}`,
        metode_pembayaran: method,
        jumlah: paymentMethodTotals[method].jumlah,
        modal: paymentMethodTotals[method].modal,
        hasil_penjualan: paymentMethodTotals[method].hasil_penjualan,
        keuntungan: paymentMethodTotals[method].keuntungan,
        persentase: calculatePercentage(
          paymentMethodTotals[method].keuntungan,
          paymentMethodTotals[method].modal
        ),
      });
    }
  });

  // Calculate grand total
  const grandTotal = {
    jumlah: methodsToShow.reduce(
      (sum, method) => sum + (paymentMethodTotals[method]?.jumlah || 0),
      0
    ),
    modal: methodsToShow.reduce(
      (sum, method) => sum + (paymentMethodTotals[method]?.modal || 0),
      0
    ),
    hasil_penjualan: methodsToShow.reduce(
      (sum, method) =>
        sum + (paymentMethodTotals[method]?.hasil_penjualan || 0),
      0
    ),
    keuntungan: methodsToShow.reduce(
      (sum, method) => sum + (paymentMethodTotals[method]?.keuntungan || 0),
      0
    ),
  };

  // Add grand total row
  if (!request.metode_pembayaran || grandTotal.jumlah > 0) {
    const totalLabel = request.metode_pembayaran?.trim()
      ? `TOTAL PENJUALAN ${request.metode_pembayaran.toUpperCase()}`
      : "TOTAL PENJUALAN";

    formattedData.push({
      produk: totalLabel,
      metode_pembayaran: request.metode_pembayaran?.toUpperCase() || "ALL",
      jumlah: grandTotal.jumlah,
      modal: grandTotal.modal,
      hasil_penjualan: grandTotal.hasil_penjualan,
      keuntungan: grandTotal.keuntungan,
      persentase: calculatePercentage(grandTotal.keuntungan, grandTotal.modal),
    });
  }

  return {
    periode: {
      start_date: request.start_date,
      end_date: request.end_date,
    },
    data: formattedData,
    summary: {
      total_penjualan_tunai: paymentMethodTotals.TUNAI,
      total_penjualan_qris: paymentMethodTotals.QRIS,
      total_penjualan_kredit: paymentMethodTotals.KREDIT,
      grand_total: grandTotal,
    },
  };
};

export default {
  getLaporanHasilUsaha,
  getLaporanRealisasiPendapatan,
  getLaporanNeracaLajur,
  getLaporanNeraca,
  getLaporanPenjualan,
};
