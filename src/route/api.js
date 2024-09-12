import express from "express";
import userController from "../controller/user-controller.js";
import {authMiddleware} from "../middleware/auth-middleware.js";
import roleController from "../controller/role-controller.js";
import divisiController from "../controller/divisi-controller.js";

const userRouter = new express.Router();
userRouter.use(authMiddleware);

// User API
userRouter.post('/api/users/detail-user', userController.get);
userRouter.post('/api/users/update-user', userController.update);
userRouter.post('/api/users/logout', userController.logout);
userRouter.post('/api/users/list-users', userController.listUsers);

// Role API
userRouter.post('/api/roles/register-role', roleController.registerRole);
userRouter.post('/api/roles/detail-role', roleController.getRole);
userRouter.post('/api/roles/update-role', roleController.updateRole);
userRouter.post('/api/roles/remove-role', roleController.removeRole);
userRouter.post('/api/roles/list-roles', roleController.listRole);

// Divisi API
userRouter.post('/api/divisi/add-divisi', divisiController.addDivisi);
userRouter.post('/api/divisi/get-divisi', divisiController.getDivisi);
userRouter.post('/api/divisi/update-divisi', divisiController.updateDivisi);
userRouter.post('/api/divisi/remove-divisi', divisiController.removeDivisi);
userRouter.post('/api/divisi/list-divisi', divisiController.listDivisi);

export {
    userRouter
}
