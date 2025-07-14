import { web } from "./application/web.js";
import { logInfo, logError } from "./application/logging.js";
import backupScheduler from "./scheduler/backup-scheduler.js";

web.listen(3000, () => {
  logInfo("Application started successfully", {
    port: 3000,
    environment: process.env.NODE_ENV || "development",
    pid: process.pid,
  });

  // Mulai semua scheduler backup default
  try {
    backupScheduler.startAllDefaultSchedulers();
    logInfo("Backup scheduler initialized successfully");
  } catch (error) {
    logError("Failed to initialize backup scheduler", error, {
      scheduler: "backup-scheduler",
    });
  }
});
