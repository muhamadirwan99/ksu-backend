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
      laporanPendapatanLainResult.total_pendapatan_lain,
    sisa_hasil_usaha_last_month:
      laporanBebanOperasionalResult.hasil_usaha_bersih_last_month +
      laporanPendapatanLainResult.total_pendapatan_lain_last_month,
  };

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

  const laporanNeracaLajurResult = await laporanNeracaLajur(
    request.month,
    request.year,
  );

  return laporanNeracaLajurResult;
};

export default {
  getLaporanHasilUsaha,
  getLaporanRealisasiPendapatan,
  getLaporanNeracaLajur,
};
