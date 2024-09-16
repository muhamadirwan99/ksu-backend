import { ResponseSuccess } from "../../utils/response-success.js";
import cashinoutService from "../../service/cash_in_out/cash-in-out-service.js";

const createCash = async (req, res, next) => {
  try {
    const result = await cashinoutService.createCash(req.body);

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
    const result = await cashinoutService.updateCash(req.body);

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
    const result = await cashinoutService.removeCash(req.body);

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
    const result = await cashinoutService.listCash();

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
