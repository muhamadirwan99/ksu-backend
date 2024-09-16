import { ResponseSuccess } from "../../utils/response-success.js";
import refCashinoutService from "../../service/cash_in_out/ref-cash-in-out-service.js";

const createCash = async (req, res, next) => {
  try {
    const result = await refCashinoutService.createCash(req.body);

    const responses = new ResponseSuccess(
      "Cash registered",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const updateCash = async (req, res, next) => {
  try {
    const result = await refCashinoutService.updateCash(req.body);

    const responses = new ResponseSuccess(
      "Success update cash",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeCash = async (req, res, next) => {
  try {
    const result = await refCashinoutService.removeCash(req.body);

    const responses = new ResponseSuccess(
      "Success remove cash",
      result,
    ).getResponse();

    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const listCash = async (req, res, next) => {
  try {
    const result = await refCashinoutService.listCash();

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
  createCash,
  updateCash,
  removeCash,
  listCash,
};
