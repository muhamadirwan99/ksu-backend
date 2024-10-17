import { userRouter } from "../api.js";
import tutupKasirController from "../../controller/tutup-kasir-controller.js";

const getTotalPenjualanRoute = () => {
  // Tutup kasir API
  userRouter.post(
    "/api/tutup-kasir/total-penjualan",
    tutupKasirController.getTotalPenjualan,
  );
  userRouter.post(
    "/api/tutup-kasir/create-tutup-kasir",
    tutupKasirController.createTutupKasir,
  );
  userRouter.post(
    "/api/tutup-kasir/list-tutup-kasir",
    tutupKasirController.getListTutupKasir,
  );
  userRouter.post(
    "/api/tutup-kasir/update-tutup-kasir",
    tutupKasirController.updateTutupKasir,
  );
};

export default getTotalPenjualanRoute;
