import laporanController from "../../controller/laporan-controller.js";
import { userRouter } from "../api.js";

const laporanRoute = () => {
  // User API
  userRouter.post(
    "/api/laporan/hasil-usaha",
    laporanController.getLaporanHasilUsaha,
  );
};

export default laporanRoute;
