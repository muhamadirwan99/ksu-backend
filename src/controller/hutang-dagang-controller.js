import { ResponseSuccess } from "../utils/response-success.js";
import hutangDagangService from "../service/hutang-dagang-service.js";

const bayarHutangDagang = async (req, res, next) => {
  try {
    const result = await hutangDagangService.pembayaranHutangDagang(req.body);
    const responses = new ResponseSuccess(
      "Pembayaran hutang dagang successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listPembayaranHutangDagang = async (req, res, next) => {
  try {
    const result = await hutangDagangService.listPembayaranHutangDagang(
      req.body,
    );
    const responses = new ResponseSuccess(
      "List pembayaran hutang dagang successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listHutangDagang = async (req, res, next) => {
  try {
    const result = await hutangDagangService.listHutangDagang(req.body);
    const responses = new ResponseSuccess(
      "List hutang dagang successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  bayarHutangDagang,
  listPembayaranHutangDagang,
  listHutangDagang,
};
