import stockTrackingService from "../service/stock-tracking-service.js";
import { ResponseSuccess } from "../utils/response-success.js";

const trackStockDiscrepancy = async (req, res, next) => {
  try {
    const result = await stockTrackingService.trackStockDiscrepancy(req.body);
    const responses = new ResponseSuccess(
      "Success track stock discrepancy",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const findProductsWithDiscrepancy = async (req, res, next) => {
  try {
    const result = await stockTrackingService.findProductsWithDiscrepancy();
    const responses = new ResponseSuccess(
      "Success find products with discrepancy",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const analyzeCauseOfDiscrepancy = async (req, res, next) => {
  try {
    const result = await stockTrackingService.analyzeCauseOfDiscrepancy(
      req.body
    );
    const responses = new ResponseSuccess(
      "Success analyze cause of discrepancy",
      result
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  trackStockDiscrepancy,
  findProductsWithDiscrepancy,
  analyzeCauseOfDiscrepancy,
};
