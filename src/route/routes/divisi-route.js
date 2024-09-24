import { userRouter } from "../api.js";
import divisiController from "../../controller/divisi-controller.js";

const divisiRoute = () => {
  // Divisi API
  userRouter.post("/api/divisi/create-divisi", divisiController.createDivisi);
  userRouter.post("/api/divisi/detail-divisi", divisiController.getDivisi);
  userRouter.post("/api/divisi/update-divisi", divisiController.updateDivisi);
  userRouter.post("/api/divisi/remove-divisi", divisiController.removeDivisi);
  userRouter.post("/api/divisi/list-divisi", divisiController.listDivisi);
};

export default divisiRoute;
