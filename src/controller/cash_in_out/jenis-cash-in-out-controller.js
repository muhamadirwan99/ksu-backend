import { ResponseSuccess } from "../../utils/response-success.js";
import jenisCashInOutService from "../../service/cash_in_out/jenis-cash-in-out-service.js";

const createJenisCash = async (req, res, next) => {
  try {
    const result = await jenisCashInOutService.createJenisCash(req.body);

    const responses = new ResponseSuccess(
      "JenisCash registered",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateJenisCash = async (req, res, next) => {
  try {
    const result = await jenisCashInOutService.updateJenisCash(req.body);

    const responses = new ResponseSuccess(
      "Success update cash",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeJenisCash = async (req, res, next) => {
  try {
    const result = await jenisCashInOutService.removeJenisCash(req.body);

    const responses = new ResponseSuccess(
      "Success remove cash",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listJenisCash = async (req, res, next) => {
  try {
    const result = await jenisCashInOutService.listJenisCash(req.body);

    const responses = new ResponseSuccess(
      "Success get list cash",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createJenisCash,
  updateJenisCash,
  removeJenisCash,
  listJenisCash,
};
