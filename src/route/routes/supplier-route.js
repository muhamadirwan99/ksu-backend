import { userRouter } from "../api.js";
import supplierController from "../../controller/supplier-controller.js";

const supplierRoute = () => {
  // Supplier API
  userRouter.post(
    "/api/suppliers/create-supplier",
    supplierController.createSupplier,
  );
  userRouter.post(
    "/api/suppliers/detail-supplier",
    supplierController.getSupplier,
  );
  userRouter.post(
    "/api/suppliers/update-supplier",
    supplierController.updateSupplier,
  );
  userRouter.post(
    "/api/suppliers/remove-supplier",
    supplierController.removeSupplier,
  );
  userRouter.post(
    "/api/suppliers/list-suppliers",
    supplierController.listSupplier,
  );
};

export default supplierRoute;
