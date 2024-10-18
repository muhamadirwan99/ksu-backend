import { ResponseSuccess } from "../utils/response-success.js";
import hutangAnggotaService from "../service/hutang-anggota-service.js";

const bayarHutangAnggota = async (req, res, next) => {
  try {
    const result = await hutangAnggotaService.pembayaranHutangAnggota(req.body);
    const responses = new ResponseSuccess(
      "Pembayaran hutang anggota successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listPembayaranHutangAnggota = async (req, res, next) => {
  try {
    const result = await hutangAnggotaService.listPembayaranHutangAnggota(
      req.body,
    );
    const responses = new ResponseSuccess(
      "List pembayaran hutang anggota successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listHutangAnggota = async (req, res, next) => {
  try {
    const result = await hutangAnggotaService.listHutangAnggota(req.body);
    const responses = new ResponseSuccess(
      "List hutang anggota successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  bayarHutangAnggota,
  listPembayaranHutangAnggota,
  listHutangAnggota,
};
