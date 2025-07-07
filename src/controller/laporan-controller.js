import { ResponseSuccess } from "../utils/response-success.js";
import laporanService from "../service/laporan/laporan-service.js";

const getLaporanHasilUsaha = async (req, res, next) => {
  try {
    const result = await laporanService.getLaporanHasilUsaha(req.body);
    const responses = new ResponseSuccess(
      "Laporan hasil usaha successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getLaporanRealisasiPendapatan = async (req, res, next) => {
  try {
    const result = await laporanService.getLaporanRealisasiPendapatan(req.body);
    const responses = new ResponseSuccess(
      "Laporan realisasi pendapatan successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getLaporanNeracaLajur = async (req, res, next) => {
  try {
    const result = await laporanService.getLaporanNeracaLajur(req.body);
    const responses = new ResponseSuccess(
      "Laporan neraca lajur successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getLaporanNeraca = async (req, res, next) => {
  try {
    const result = await laporanService.getLaporanNeraca(req.body);
    const responses = new ResponseSuccess(
      "Laporan neraca successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getLaporanPenjualan = async (req, res, next) => {
  try {
    const result = await laporanService.getLaporanPenjualan(req.body);
    const responses = new ResponseSuccess(
      "Laporan penjualan successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  getLaporanHasilUsaha,
  getLaporanRealisasiPendapatan,
  getLaporanNeracaLajur,
  getLaporanNeraca,
  getLaporanPenjualan,
};
