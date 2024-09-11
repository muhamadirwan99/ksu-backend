import express from "express";
import userController from "../controller/user-controller.js";
import {authMiddleware} from "../middleware/auth-middleware.js";
import roleController from "../controller/role-controller.js";

const userRouter = new express.Router();
userRouter.use(authMiddleware);

// User API
userRouter.post('/api/users/detail-user', userController.get);
userRouter.post('/api/users/update-user', userController.update);
userRouter.post('/api/users/logout', userController.logout);
userRouter.post('/api/users/list-users', userController.listUsers);

// Role API
userRouter.post('/api/references/register-role', roleController.registerRole);
userRouter.post('/api/references/detail-role', roleController.getRole);
userRouter.post('/api/references/update-role', roleController.updateRole);
userRouter.post('/api/references/remove-role', roleController.removeRole);
userRouter.post('/api/references/list-roles', roleController.listRole);

export {
    userRouter
}
