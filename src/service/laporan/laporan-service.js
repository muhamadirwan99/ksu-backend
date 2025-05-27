import { validate } from "../../validation/validation.js";
import {
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
      }),
    );

  const totalSisaHasilUsaha = sisaHasilUsaha.reduce(
    (acc, curr) => acc + curr.sisa_hasil_usaha,
    0,
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

export default {
  getLaporanHasilUsaha,
  getLaporanRealisasiPendapatan,
  getLaporanNeracaLajur,
  getLaporanNeraca,
};
