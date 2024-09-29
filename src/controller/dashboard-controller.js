import { ResponseSuccess } from "../utils/response-success.js";
import dashboardService from "../service/dashboard-service.js";

const getDashboardIncome = async (req, res, next) => {
  try {
    const result = await dashboardService.getDashboardIncome();
    const responses = new ResponseSuccess(
      "Dashboard income successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

const getStatisticIncomeMonthly = async (req, res, next) => {
  try {
    const result = await dashboardService.getStatisticIncomeMonthly(req.body);
    const responses = new ResponseSuccess(
      "Dashboard income monthly successfully retrieved",
      result,
    ).getResponse();
    res.status(200).json(responses);
  } catch (e) {
    next(e);
  }
};

export default {
  getDashboardIncome,
  getStatisticIncomeMonthly,
};
