import express from "express";
import { authMiddleware } from "../middleware/auth-middleware.js";
import cashInOutRoute from "./routes/cash-in-out-route.js";
import anggotaRoute from "./routes/anggota-route.js";
import productRoute from "./routes/product-route.js";
import roleRoute from "./routes/role-route.js";
import userRoute from "./routes/user-route.js";
import purchaseRoute from "./routes/purchase-route.js";
import supplierRoute from "./routes/supplier-route.js";
import divisiRoute from "./routes/divisi-route.js";

const userRouter = new express.Router();
userRouter.use(authMiddleware);

userRoute();
roleRoute();
divisiRoute();
supplierRoute();
productRoute();
anggotaRoute();
cashInOutRoute();
purchaseRoute();

export { userRouter };
