import express from "express";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { userRouter } from "../route/api.js";
import cors from "cors";
// Start the cron job for depreciation
import "../scheduler/depreciation-scheduler.js";

export const web = express();
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
web.use(cors(corsOptions));
web.use(express.json());

web.use(publicRouter);
web.use(userRouter);

web.use(errorMiddleware);
