import { ResponseSuccess } from "../utils/response-success.js";
import purchaseService from "../service/purchase-service.js";

const createPurchase = async (req, res, next) => {
  try {
    const result = await purchaseService.createPurchase(req.body);
    const responses = new ResponseSuccess(
      "Purchase registered",
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
      "Detail Purchase",
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
      "Purchase list",
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
};
