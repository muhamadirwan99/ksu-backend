import { userRouter } from "../api.js";
import hutangAnggotaController from "../../controller/hutang-anggota-controller.js";

const hutangAnggotaRoute = () => {
  // Hutang Anggota API
  userRouter.post(
    "/api/hutang-anggota/bayar-hutang-anggota",
    hutangAnggotaController.bayarHutangAnggota,
  );
  userRouter.post(
    "/api/hutang-anggota/list-history-bayar-hutang-anggota",
    hutangAnggotaController.listPembayaranHutangAnggota,
  );
  userRouter.post(
    "/api/hutang-anggota/list-hutang-anggota",
    hutangAnggotaController.listHutangAnggota,
  );
};

export default hutangAnggotaRoute;
