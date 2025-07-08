import { ResponseSuccess } from "../utils/response-success.js";
import hutangDagangService from "../service/hutang-dagang-service.js";
import { logger } from "../application/logging.js";

const bayarHutangDagang = async (req, res, next) => {
  const startTime = Date.now();
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    logger.info(`[${requestId}] Memulai pembayaran hutang dagang`, {
      id_hutang_dagang: req.body.id_hutang_dagang,
      nominal_bayar: req.body.nominal_bayar,
      user: req.user?.username || "unknown",
    });

    const result = await hutangDagangService.pembayaranHutangDagang(req.body);

    const executionTime = Date.now() - startTime;
    logger.info(
      `[${requestId}] Pembayaran hutang dagang berhasil dalam ${executionTime}ms`,
      {
        id_history: result.id_history_hutang_dagang,
        id_hutang_dagang: req.body.id_hutang_dagang,
      }
    );

    const responses = new ResponseSuccess(
      "Pembayaran hutang dagang successfully registered",
      result
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    const executionTime = Date.now() - startTime;
    logger.error(
      `[${requestId}] Pembayaran hutang dagang gagal dalam ${executionTime}ms`,
      {
        error: e.message,
        stack: e.stack,
        id_hutang_dagang: req.body.id_hutang_dagang,
        nominal_bayar: req.body.nominal_bayar,
      }
    );
    next(e);
  }
};

const listPembayaranHutangDagang = async (req, res, next) => {
  try {
    const result = await hutangDagangService.listPembayaranHutangDagang(
      req.body
    );
    const responses = new ResponseSuccess(
      "List pembayaran hutang dagang successfully retrieved",
      result
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
      result
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
