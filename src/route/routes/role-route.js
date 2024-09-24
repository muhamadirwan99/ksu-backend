import { userRouter } from "../api.js";
import roleController from "../../controller/role-controller.js";

const roleRoute = () => {
  // Role API
  userRouter.post("/api/roles/detail-role", roleController.getRole);
  userRouter.post("/api/roles/update-role", roleController.updateRole);
  userRouter.post("/api/roles/remove-role", roleController.removeRole);
  userRouter.post("/api/roles/list-roles", roleController.listRole);
};

export default roleRoute;
