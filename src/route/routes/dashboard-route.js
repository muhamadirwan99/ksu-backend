import { userRouter } from "../api.js";
import dashboardController from "../../controller/dashboard-controller.js";

const dashboardRoute = () => {
  // Anggota API
  userRouter.post(
    "/api/dashboard/income-dashboard",
    dashboardController.getDashboardIncome,
  );
};

export default dashboardRoute;
