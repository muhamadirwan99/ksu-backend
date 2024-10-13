import { ResponseSuccess } from "../utils/response-success.js";
import returService from "../service/retur-service.js";

const createRetur = async (req, res, next) => {
  try {
    const result = await returService.createRetur(req.body);
    const responses = new ResponseSuccess(
      "Retur successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const detailRetur = async (req, res, next) => {
  try {
    const result = await returService.getDetailRetur(req.body);
    const responses = new ResponseSuccess(
      "Success get detail Retur",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getReturList = async (req, res, next) => {
  try {
    const result = await returService.getReturList(req.body);
    const responses = new ResponseSuccess(
      "Success get retur list",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeRetur = async (req, res, next) => {
  try {
    const result = await returService.removeRetur(req.body);
    const responses = new ResponseSuccess(
      "Success remove retur",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createRetur,
  detailRetur,
  getReturList,
  removeRetur,
};
