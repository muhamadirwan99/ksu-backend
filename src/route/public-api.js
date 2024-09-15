import express from "express";
import userController from "../controller/user-controller.js";
import healthController from "../controller/health-controller.js";
import roleController from "../controller/role-controller.js";

const publicRouter = new express.Router();

publicRouter.get('/', async (req, res, next) => {
    try {
        res.status(200).json( {
            message: "API is running",
        });
    } catch (e) {
        next(e);
    }
});

// Role API
publicRouter.post('/api/roles/create-role', roleController.createRole);

// User API
publicRouter.post('/api/users', userController.register);
publicRouter.post('/api/users/login', userController.login);

// Health API
publicRouter.get('/ping', healthController.ping);

export {
    publicRouter
}
