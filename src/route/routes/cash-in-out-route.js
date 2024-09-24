import { userRouter } from "../api.js";
import detailCashInOutController from "../../controller/cash_in_out/detail-cash-in-out-controller.js";
import jenisCashInOutController from "../../controller/cash_in_out/jenis-cash-in-out-controller.js";
import cashInOutController from "../../controller/cash_in_out/cash-in-out-controller.js";
import refCashInOutController from "../../controller/cash_in_out/ref-cash-in-out-controller.js";

const cashInOutRoute = () => {
  // Cash In Out API
  userRouter.post(
    "/api/cash-in-out/create-cash",
    cashInOutController.createCashInOut,
  );
  userRouter.post(
    "/api/cash-in-out/detail-cash",
    cashInOutController.getCashInOut,
  );
  userRouter.post(
    "/api/cash-in-out/update-cash",
    cashInOutController.updateCashInOut,
  );
  userRouter.post(
    "/api/cash-in-out/remove-cash",
    cashInOutController.removeCashInOut,
  );
  userRouter.post(
    "/api/cash-in-out/list-cash",
    cashInOutController.listCashInOut,
  );

  // Reference Cash In Out API
  userRouter.post(
    "/api/cash-in-out/create-ref-cash",
    refCashInOutController.createCash,
  );
  userRouter.post(
    "/api/cash-in-out/update-ref-cash",
    refCashInOutController.updateCash,
  );
  userRouter.post(
    "/api/cash-in-out/remove-ref-cash",
    refCashInOutController.removeCash,
  );
  userRouter.post(
    "/api/cash-in-out/list-ref-cash",
    refCashInOutController.listCash,
  );
  userRouter.post(
    "/api/cash-in-out/create-jenis-cash",
    jenisCashInOutController.createJenisCash,
  );
  userRouter.post(
    "/api/cash-in-out/update-jenis-cash",
    jenisCashInOutController.updateJenisCash,
  );
  userRouter.post(
    "/api/cash-in-out/remove-jenis-cash",
    jenisCashInOutController.removeJenisCash,
  );
  userRouter.post(
    "/api/cash-in-out/list-jenis-cash",
    jenisCashInOutController.listJenisCash,
  );
  userRouter.post(
    "/api/cash-in-out/create-detail-cash",
    detailCashInOutController.createDetailCash,
  );
  userRouter.post(
    "/api/cash-in-out/update-detail-cash",
    detailCashInOutController.updateDetailCash,
  );
  userRouter.post(
    "/api/cash-in-out/remove-detail-cash",
    detailCashInOutController.removeDetailCash,
  );
  userRouter.post(
    "/api/cash-in-out/list-detail-cash",
    detailCashInOutController.listDetailCash,
  );
};

export default cashInOutRoute;
