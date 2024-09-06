import express from "express";
import userController from "../controller/user-controller.js";
import healthController from "../controller/health-controller.js";
import roleController from "../controller/role-controller.js";

const publicRouter = new express.Router();

// User API
publicRouter.post('/api/users', userController.register);
publicRouter.post('/api/users/login', userController.login);

// Health API
publicRouter.get('/ping', healthController.ping);

export {
    publicRouter
}
