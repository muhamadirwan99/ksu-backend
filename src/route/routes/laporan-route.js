import laporanController from "../../controller/laporan-controller.js";
import { userRouter } from "../api.js";

const laporanRoute = () => {
  // Laporan API
  userRouter.post(
    "/api/laporan/hasil-usaha",
    laporanController.getLaporanHasilUsaha,
  );
  userRouter.post(
    "/api/laporan/realisasi-pendapatan",
    laporanController.getLaporanRealisasiPendapatan,
  );
};

export default laporanRoute;
