import { ResponseSuccess } from "../utils/response-success.js";
import saleService from "../service/sale-service.js";

const createSale = async (req, res, next) => {
  try {
    const result = await saleService.createSale(req.body);
    const responses = new ResponseSuccess(
      "Sale successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const detailSale = async (req, res, next) => {
  try {
    const result = await saleService.getDetailSale(req.body);
    const responses = new ResponseSuccess(
      "Success get detail Sale",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getSaleList = async (req, res, next) => {
  try {
    const result = await saleService.getSaleList(req.body);
    const responses = new ResponseSuccess(
      "Success get sale list",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removeSale = async (req, res, next) => {
  try {
    const result = await saleService.removeSale(req.body);
    const responses = new ResponseSuccess(
      "Success remove sale",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createSale,
  detailSale,
  getSaleList,
  removeSale,
};
