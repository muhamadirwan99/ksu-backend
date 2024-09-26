import { ResponseSuccess } from "../utils/response-success.js";
import purchaseService from "../service/purchase-service.js";

const createPurchase = async (req, res, next) => {
  try {
    const result = await purchaseService.createPurchase(req.body);
    const responses = new ResponseSuccess(
      "Purchase successfully registered",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const detailPurchase = async (req, res, next) => {
  try {
    const result = await purchaseService.getDetailPurchase(req.body);
    const responses = new ResponseSuccess(
      "Success get detail purchase",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getPurchaseList = async (req, res, next) => {
  try {
    const result = await purchaseService.getPurchaseList(req.body);
    const responses = new ResponseSuccess(
      "Success get list purchase",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const removePurchase = async (req, res, next) => {
  try {
    const result = await purchaseService.removePurchase(req.body);
    const responses = new ResponseSuccess(
      "Success remove purchase",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  createPurchase,
  detailPurchase,
  getPurchaseList,
  removePurchase,
};
