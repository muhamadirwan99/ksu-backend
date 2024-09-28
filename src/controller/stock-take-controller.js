import { ResponseSuccess } from "../utils/response-success.js";
import stockTakeService from "../service/stock-take-service.js";

const createStockTake = async (req, res, next) => {
  try {
    const result = await stockTakeService.createStockTake(req.body);
    const responses = new ResponseSuccess(
      "Stock take successfully registered",
      result,
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
      "Success get stock take list",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createStockTake,
  getStockTakeList,
};
