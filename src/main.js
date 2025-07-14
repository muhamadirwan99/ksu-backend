import { web } from "./application/web.js";
import { logger } from "./application/logging.js";
import backupScheduler from "./scheduler/backup-scheduler.js";

web.listen(3000, () => {
  logger.info("App start");

  // Mulai semua scheduler backup default
  try {
    backupScheduler.startAllDefaultSchedulers();
    logger.info("Backup scheduler initialized successfully");
  } catch (error) {
    logger.error(`Failed to initialize backup scheduler: ${error.message}`);
  }
});
