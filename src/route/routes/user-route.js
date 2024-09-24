import { userRouter } from "../api.js";
import userController from "../../controller/user-controller.js";

const userRoute = () => {
  // User API
  userRouter.post("/api/users/detail-user", userController.get);
  userRouter.post("/api/users/update-user", userController.update);
  userRouter.post("/api/users/remove-user", userController.removeUser);
  userRouter.post("/api/users/logout", userController.logout);
  userRouter.post("/api/users/list-users", userController.listUsers);
};

export default userRoute;
