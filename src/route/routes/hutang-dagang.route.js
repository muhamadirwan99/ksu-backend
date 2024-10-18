import { userRouter } from "../api.js";
import hutangDagangController from "../../controller/hutang-dagang-controller.js";

const hutangDagangRoute = () => {
  // Hutang Dagang API
  userRouter.post(
    "/api/hutang-dagang/bayar-hutang-dagang",
    hutangDagangController.bayarHutangDagang,
  );
  userRouter.post(
    "/api/hutang-dagang/list-history-bayar-hutang-dagang",
    hutangDagangController.listPembayaranHutangDagang,
  );
  userRouter.post(
    "/api/hutang-dagang/list-hutang-dagang",
    hutangDagangController.listHutangDagang,
  );
};

export default hutangDagangRoute;
