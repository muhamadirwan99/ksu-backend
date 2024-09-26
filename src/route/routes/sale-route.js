import { userRouter } from "../api.js";
import saleController from "../../controller/sale-controller.js";

const saleRoute = () => {
  // Sale API
  userRouter.post("/api/sale/create-sale", saleController.createSale);
  userRouter.post("/api/sale/detail-sale", saleController.detailSale);
  userRouter.post("/api/sale/list-sale", saleController.getSaleList);
};

export default saleRoute;
