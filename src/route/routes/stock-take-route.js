import { userRouter } from "../api.js";
import stockTakeHarianController from "../../controller/stock-take-controller.js";

const stockTakeRoute = () => {
  // Role API
  userRouter.post(
    "/api/stock/create-stock-opname",
    stockTakeHarianController.createStockTake,
  );
  userRouter.post(
    "/api/stock/history-stock-opname",
    stockTakeHarianController.getStockTakeList,
  );
  userRouter.post(
    "/api/stock/list-stock-take",
    stockTakeHarianController.rekonStockTake,
  );
};

export default stockTakeRoute;
