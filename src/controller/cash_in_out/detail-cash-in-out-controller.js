import { ResponseSuccess } from "../../utils/response-success.js";
import detailCashInOutService from "../../service/cash_in_out/detail-cash-in-out-service.js";

const createDetailCash = async (req, res, next) => {
  try {
    const result = await detailCashInOutService.createDetailCash(req.body);

    const responses = new ResponseSuccess(
      "Detail cash successfully registered",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateDetailCash = async (req, res, next) => {
  try {
    const result = await detailCashInOutService.updateDetailCash(req.body);

    const responses = new ResponseSuccess(
      "Success update cash",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeDetailCash = async (req, res, next) => {
  try {
    const result = await detailCashInOutService.removeDetailCash(req.body);

    const responses = new ResponseSuccess(
      "Success remove cash",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listDetailCash = async (req, res, next) => {
  try {
    const result = await detailCashInOutService.listDetailCash(req.body);

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
  createDetailCash,
  updateDetailCash,
  removeDetailCash,
  listDetailCash,
};
