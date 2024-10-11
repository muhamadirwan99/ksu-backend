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

export default {
  getLaporanHasilUsaha,
};
