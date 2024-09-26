import { userRouter } from "../api.js";
import purchaseController from "../../controller/purchase-controller.js";

const purchaseRoute = () => {
  // Purchase API
  userRouter.post(
    "/api/purchase/create-purchase",
    purchaseController.createPurchase,
  );
  userRouter.post(
    "/api/purchase/detail-purchase",
    purchaseController.detailPurchase,
  );
  userRouter.post(
    "/api/purchase/list-purchase",
    purchaseController.getPurchaseList,
  );
  userRouter.post(
    "/api/purchase/remove-purchase",
    purchaseController.removePurchase,
  );
};

export default purchaseRoute;
