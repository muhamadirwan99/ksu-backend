import { ResponseSuccess } from "../utils/response-success.js";
import stockTakeService from "../service/stock-take-service.js";

const createStockTake = async (req, res, next) => {
  try {
    const result = await stockTakeService.createStockTake(req.body);
    const responses = new ResponseSuccess(
      "Stock opname successfully registered",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getStockTakeList = async (req, res, next) => {
  try {
    const result = await stockTakeService.searchStockTake(req.body);
    const responses = new ResponseSuccess(
      "Success get history stock opname",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const rekonStockTake = async (req, res, next) => {
  try {
    const result = await stockTakeService.rekonStockTake(req.body);
    const responses = new ResponseSuccess(
      "Success rekon stock take",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const detailRekonStockTake = async (req, res, next) => {
  try {
    const result = await stockTakeService.detailRekonStockTake(req.body);
    const responses = new ResponseSuccess(
      "Success detail rekon stock take",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getDailySOProducts = async (req, res, next) => {
  try {
    const result = await stockTakeService.getDailySOProducts(req.body);
    const responses = new ResponseSuccess(
      "Success get products for daily stock opname",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const batchSaveDailySO = async (req, res, next) => {
  try {
    const result = await stockTakeService.batchSaveDailySO(req.body);
    const responses = new ResponseSuccess(
      "Stock opname harian successfully saved",
      result
    ).getResponse();
    res.status(201).json(responses);
  } catch (e) {
    next(e);
  }
};

const checkSOStatus = async (req, res, next) => {
  try {
    const result = await stockTakeService.checkSOStatusOnly(req.body);
    const responses = new ResponseSuccess(
      "Success check SO status",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createStockTake,
  getStockTakeList,
  rekonStockTake,
  detailRekonStockTake,
  getDailySOProducts,
  batchSaveDailySO,
  checkSOStatus,
};
