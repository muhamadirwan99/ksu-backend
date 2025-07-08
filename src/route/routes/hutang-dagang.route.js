import { userRouter } from "../api.js";
import hutangDagangController from "../../controller/hutang-dagang-controller.js";
import hutangDagangMonitoringController from "../../controller/hutang-dagang-monitoring-controller.js";
import { requestDeduplication } from "../../middleware/request-deduplication.js";

const hutangDagangRoute = () => {
  // Hutang Dagang API
  userRouter.post(
    "/api/hutang-dagang/bayar-hutang-dagang",
    requestDeduplication, // Tambahkan middleware untuk mencegah duplicate request
    hutangDagangController.bayarHutangDagang
  );
  userRouter.post(
    "/api/hutang-dagang/list-history-bayar-hutang-dagang",
    hutangDagangController.listPembayaranHutangDagang
  );
  userRouter.post(
    "/api/hutang-dagang/list-hutang-dagang",
    hutangDagangController.listHutangDagang
  );

  // Monitoring and troubleshooting endpoints
  userRouter.post(
    "/api/hutang-dagang/check-consistency",
    hutangDagangMonitoringController.checkHutangDagangConsistency
  );
  userRouter.post(
    "/api/hutang-dagang/fix-data",
    hutangDagangMonitoringController.fixHutangDagangData
  );
  userRouter.post(
    "/api/hutang-dagang/summary",
    hutangDagangMonitoringController.getHutangDagangSummary
  );
};

export default hutangDagangRoute;
