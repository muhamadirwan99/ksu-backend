import express from "express";
import userController from "../controller/user-controller.js";
import healthController from "../controller/health-controller.js";
import roleController from "../controller/role-controller.js";
import depreciationController from "../controller/depreciation-controller.js";
import { BackupController } from "../controller/backup-controller.js";
import { BackupSchedulerController } from "../controller/backup-scheduler-controller.js";
import { BackupHealthController } from "../controller/backup-health-controller.js";

const publicRouter = new express.Router();

publicRouter.get("/", async (req, res, next) => {
  try {
    res.status(200).json({
      message: "API is running",
    });
  } catch (e) {
    next(e);
  }
});

// Role API
publicRouter.post("/api/roles/create-role", roleController.createRole);

// User API
publicRouter.post("/api/users", userController.register);
publicRouter.post("/api/users/login", userController.login);

// Health API
publicRouter.get("/ping", healthController.ping);

publicRouter.post(
  "/api/depreciation/calculate-depreciation",
  depreciationController.getDepreciation
);

// Backup Management Routes
publicRouter.post("/api/backup/create", BackupController.createBackup);
publicRouter.get("/api/backup/list", BackupController.getBackupList);
publicRouter.get("/api/backup/info", BackupController.getBackupInfo);
publicRouter.post("/api/backup/clean", BackupController.cleanOldBackups);
publicRouter.get(
  "/api/backup/download/:fileName",
  BackupController.downloadBackup
);
publicRouter.delete("/api/backup/:fileName", BackupController.deleteBackup);

// Table-specific backup
publicRouter.post(
  "/api/backup/table/:tableName",
  BackupController.createTableBackup
);

// Restore functionality
publicRouter.post(
  "/api/backup/restore/:fileName",
  BackupController.restoreBackup
);

// Scheduler Management Routes
publicRouter.get(
  "/api/backup/scheduler/status",
  BackupSchedulerController.getSchedulerStatus
);
publicRouter.post(
  "/api/backup/scheduler/start/:schedulerName",
  BackupSchedulerController.startScheduler
);
publicRouter.post(
  "/api/backup/scheduler/stop/:schedulerName",
  BackupSchedulerController.stopScheduler
);
publicRouter.post(
  "/api/backup/scheduler/restart",
  BackupSchedulerController.restartAllSchedulers
);
publicRouter.post(
  "/api/backup/scheduler/custom",
  BackupSchedulerController.createCustomScheduler
);
publicRouter.post(
  "/api/backup/scheduler/run-now",
  BackupSchedulerController.runBackupNow
);

// Health Check Routes
publicRouter.get("/api/backup/health", BackupHealthController.healthCheck);
publicRouter.get("/api/backup/status", BackupHealthController.quickStatus);
publicRouter.post("/api/backup/test", BackupHealthController.testBackup);

export { publicRouter };
