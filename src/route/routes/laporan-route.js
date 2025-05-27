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
  userRouter.post(
    "/api/laporan/neraca-lajur",
    laporanController.getLaporanNeracaLajur,
  );
  userRouter.post("/api/laporan/neraca", laporanController.getLaporanNeraca);
};

export default laporanRoute;
