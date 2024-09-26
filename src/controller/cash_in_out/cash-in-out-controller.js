import { ResponseSuccess } from "../../utils/response-success.js";
import cashInOutService from "../../service/cash_in_out/cash-in-out-service.js";

const createCashInOut = async (req, res, next) => {
  try {
    const result = await cashInOutService.createCashInOut(req.body);
    const responses = new ResponseSuccess(
      "Cash In Out successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getCashInOut = async (req, res, next) => {
  try {
    const result = await cashInOutService.getCashInOut(req.body);
    const responses = new ResponseSuccess(
      "Success get cash in out",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateCashInOut = async (req, res, next) => {
  try {
    const result = await cashInOutService.updateCashInOut(req.body);
    const responses = new ResponseSuccess(
      "Success update cash in out",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeCashInOut = async (req, res, next) => {
  try {
    const result = await cashInOutService.removeCashInOut(req.body);
    const responses = new ResponseSuccess(
      "Success remove cash in out",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listCashInOut = async (req, res, next) => {
  try {
    const result = await cashInOutService.searchCashInOut(req.body);
    const responses = new ResponseSuccess(
      "Success get list cash in out",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createCashInOut,
  getCashInOut,
  updateCashInOut,
  removeCashInOut,
  listCashInOut,
};
