import { validate } from "../../validation/validation.js";
import { monthlyIncomeValidation } from "../../validation/dashboard-validation.js";
import {
  getDate,
  laporanBebanOperasional,
  laporanHargaPokokPenjualan,
  laporanPendapatanLain,
  laporanPenjualan,
} from "./lap-hasil-usaha.js";

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

export default {
  getLaporanHasilUsaha,
};
