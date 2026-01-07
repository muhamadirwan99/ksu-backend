import { userRouter } from "../api.js";
import stockTakeHarianController from "../../controller/stock-take-controller.js";

const stockTakeRoute = () => {
  // Stock Opname API
  userRouter.post(
    "/api/stock/create-stock-opname",
    stockTakeHarianController.createStockTake
  );
  userRouter.post(
    "/api/stock/history-stock-opname",
    stockTakeHarianController.getStockTakeList
  );
  userRouter.post(
    "/api/stock/list-stock-take",
    stockTakeHarianController.rekonStockTake
  );
  userRouter.post(
    "/api/stock/detail-stock-take",
    stockTakeHarianController.detailRekonStockTake
  );

  // Stock Opname Harian API (NEW)
  userRouter.post(
    "/api/stock/get-products-for-daily-so",
    stockTakeHarianController.getDailySOProducts
  );
  userRouter.post(
    "/api/stock/batch-save-daily-so",
    stockTakeHarianController.batchSaveDailySO
  );
  userRouter.post(
    "/api/stock/check-so-status",
    stockTakeHarianController.checkSOStatus
  );
};

export default stockTakeRoute;
