import { userRouter } from "../api.js";
import stockTrackingController from "../../controller/stock-tracking-controller.js";

const stockTrackingRoute = () => {
  // Track stock discrepancy untuk produk tertentu
  userRouter.post(
    "/api/stock/track-discrepancy",
    stockTrackingController.trackStockDiscrepancy
  );

  // Cari semua produk yang memiliki selisih
  userRouter.post(
    "/api/stock/find-products-with-discrepancy",
    stockTrackingController.findProductsWithDiscrepancy
  );

  // Analisis penyebab selisih
  userRouter.post(
    "/api/stock/analyze-cause-discrepancy",
    stockTrackingController.analyzeCauseOfDiscrepancy
  );
};

export default stockTrackingRoute;
