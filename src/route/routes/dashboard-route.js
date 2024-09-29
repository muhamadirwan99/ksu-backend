import { userRouter } from "../api.js";
import dashboardController from "../../controller/dashboard-controller.js";

const dashboardRoute = () => {
  // Dashboard API
  userRouter.post(
    "/api/dashboard/income-dashboard",
    dashboardController.getDashboardIncome,
  );
  userRouter.post(
    "/api/dashboard/income-monthly",
    dashboardController.getStatisticIncomeMonthly,
  );
};

export default dashboardRoute;
