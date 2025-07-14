import { userRouter } from "../api.js";
import { BackupController } from "../../controller/backup-controller.js";
import { BackupSchedulerController } from "../../controller/backup-scheduler-controller.js";
import { BackupHealthController } from "../../controller/backup-health-controller.js";

const backupRoute = () => {
  // Backup Management Routes
  userRouter.post("/api/backup/create", BackupController.createBackup);
  userRouter.get("/api/backup/list", BackupController.getBackupList);
  userRouter.get("/api/backup/info", BackupController.getBackupInfo);
  userRouter.post("/api/backup/clean", BackupController.cleanOldBackups);
  userRouter.get(
    "/api/backup/download/:fileName",
    BackupController.downloadBackup
  );
  userRouter.delete("/api/backup/:fileName", BackupController.deleteBackup);

  // Table-specific backup
  userRouter.post(
    "/api/backup/table/:tableName",
    BackupController.createTableBackup
  );

  // Restore functionality
  userRouter.post(
    "/api/backup/restore/:fileName",
    BackupController.restoreBackup
  );

  // Scheduler Management Routes
  userRouter.get(
    "/api/backup/scheduler/status",
    BackupSchedulerController.getSchedulerStatus
  );
  userRouter.post(
    "/api/backup/scheduler/start/:schedulerName",
    BackupSchedulerController.startScheduler
  );
  userRouter.post(
    "/api/backup/scheduler/stop/:schedulerName",
    BackupSchedulerController.stopScheduler
  );
  userRouter.post(
    "/api/backup/scheduler/restart",
    BackupSchedulerController.restartAllSchedulers
  );
  userRouter.post(
    "/api/backup/scheduler/custom",
    BackupSchedulerController.createCustomScheduler
  );
  userRouter.post(
    "/api/backup/scheduler/run-now",
    BackupSchedulerController.runBackupNow
  );

  // Health Check Routes
  userRouter.get("/api/backup/health", BackupHealthController.healthCheck);
  userRouter.get("/api/backup/status", BackupHealthController.quickStatus);
  userRouter.post("/api/backup/test", BackupHealthController.testBackup);
};

export default backupRoute;
