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

const getLaporanPenjualan = async (request) => {
  request = validate(dateValidation, request);

  // Parse dates more carefully
  const startDate = new Date(request.start_date);
  const endDate = new Date(request.end_date);

  // Check if dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
  }

  endDate.setHours(23, 59, 59, 999);

  // Get all sales data within the date range
  const salesData = await prismaClient.penjualan.findMany({
    where: {
      created_at: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      DetailPenjualan: {
        include: {
          product: true,
        },
      },
    },
  });

  // Group products by payment method and calculate totals
  const productSummary = {};
  const paymentMethodTotals = {
    TUNAI: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
    QRIS: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
    KREDIT: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
  };

  salesData.forEach((sale) => {
    const paymentMethod = sale.jenis_pembayaran.toUpperCase();

    sale.DetailPenjualan.forEach((detail) => {
      const productName = detail.nm_produk;
      const productId = detail.id_product;

      if (!productSummary[productName]) {
        productSummary[productName] = {
          id_product: productId,
          TUNAI: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
          QRIS: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
          KREDIT: { jumlah: 0, modal: 0, hasil_penjualan: 0, keuntungan: 0 },
        };
      }

      const modal = parseFloat(detail.product.harga_beli) * detail.jumlah;
      const hasilPenjualan = parseFloat(detail.total);
      const keuntungan = hasilPenjualan - modal;

      // Update product summary by payment method
      if (productSummary[productName][paymentMethod]) {
        productSummary[productName][paymentMethod].jumlah += detail.jumlah;
        productSummary[productName][paymentMethod].modal += modal;
        productSummary[productName][paymentMethod].hasil_penjualan +=
          hasilPenjualan;
        productSummary[productName][paymentMethod].keuntungan += keuntungan;
      }

      // Update payment method totals
      if (paymentMethodTotals[paymentMethod]) {
        paymentMethodTotals[paymentMethod].jumlah += detail.jumlah;
        paymentMethodTotals[paymentMethod].modal += modal;
        paymentMethodTotals[paymentMethod].hasil_penjualan += hasilPenjualan;
        paymentMethodTotals[paymentMethod].keuntungan += keuntungan;
      }
    });
  });

  // Format data for frontend
  const formattedData = [];

  Object.keys(productSummary).forEach((productName) => {
    const product = productSummary[productName];

    // Add rows for each payment method that has data
    ["TUNAI", "QRIS", "KREDIT"].forEach((method) => {
      if (product[method].jumlah > 0) {
        formattedData.push({
          id_product: product.id_product,
          produk: productName,
          metode_pembayaran: method,
          jumlah: product[method].jumlah,
          modal: product[method].modal,
          hasil_penjualan: product[method].hasil_penjualan,
          keuntungan: product[method].keuntungan,
          persentase:
            product[method].modal > 0
              ? Math.round(
                  (product[method].keuntungan / product[method].modal) * 100
                )
              : 0,
        });
      }
    });
  });

  // Add totals for each payment method
  ["TUNAI", "QRIS", "KREDIT"].forEach((method) => {
    if (paymentMethodTotals[method].jumlah > 0) {
      formattedData.push({
        produk: `TOTAL PENJUALAN ${method}`,
        metode_pembayaran: method,
        jumlah: paymentMethodTotals[method].jumlah,
        modal: paymentMethodTotals[method].modal,
        hasil_penjualan: paymentMethodTotals[method].hasil_penjualan,
        keuntungan: paymentMethodTotals[method].keuntungan,
        persentase:
          paymentMethodTotals[method].modal > 0
            ? Math.round(
                (paymentMethodTotals[method].keuntungan /
                  paymentMethodTotals[method].modal) *
                  100
              )
            : 0,
      });
    }
  });

  // Add grand total
  const grandTotal = {
    jumlah: Object.values(paymentMethodTotals).reduce(
      (sum, method) => sum + method.jumlah,
      0
    ),
    modal: Object.values(paymentMethodTotals).reduce(
      (sum, method) => sum + method.modal,
      0
    ),
    hasil_penjualan: Object.values(paymentMethodTotals).reduce(
      (sum, method) => sum + method.hasil_penjualan,
      0
    ),
    keuntungan: Object.values(paymentMethodTotals).reduce(
      (sum, method) => sum + method.keuntungan,
      0
    ),
  };

  formattedData.push({
    produk: "TOTAL PENJUALAN",
    metode_pembayaran: "ALL",
    jumlah: grandTotal.jumlah,
    modal: grandTotal.modal,
    hasil_penjualan: grandTotal.hasil_penjualan,
    keuntungan: grandTotal.keuntungan,
    persentase:
      grandTotal.modal > 0
        ? Math.round((grandTotal.keuntungan / grandTotal.modal) * 100)
        : 0,
  });

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
