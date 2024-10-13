import { userRouter } from "../api.js";
import returController from "../../controller/retur-controller.js";

const returRoute = () => {
  // Retur API
  userRouter.post("/api/retur/create-retur", returController.createRetur);
  userRouter.post("/api/retur/detail-retur", returController.detailRetur);
  userRouter.post("/api/retur/list-retur", returController.getReturList);
  userRouter.post("/api/retur/remove-retur", returController.removeRetur);
};

export default returRoute;
