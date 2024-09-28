import { userRouter } from "../api.js";
import stockTakeHarianController from "../../controller/stock-take-controller.js";

const stockTakeRoute = () => {
  // Role API
  userRouter.post(
    "/api/stocktake/create-stocktake",
    stockTakeHarianController.createStockTake,
  );
  userRouter.post(
    "/api/stocktake/list-stocktakes",
    stockTakeHarianController.getStockTakeList,
  );
};

export default stockTakeRoute;
