import express from "express";
import { publicRouter } from "../route/public-api.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import {
  requestLoggingMiddleware,
  userContextMiddleware,
} from "../middleware/request-logging-middleware.js";
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

// Middleware order is important
web.use(cors(corsOptions));
web.use(express.json());

// Add request logging middleware early in the chain
web.use(requestLoggingMiddleware);
web.use(userContextMiddleware);

web.use(publicRouter);
web.use(userRouter);

// Error middleware should be last
web.use(errorMiddleware);
