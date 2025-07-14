import backupScheduler from "../scheduler/backup-scheduler.js";
import { logger } from "../application/logging.js";

class BackupSchedulerController {
  // Get status semua scheduler
  static async getSchedulerStatus(req, res, next) {
    try {
      logger.info("Request status scheduler backup");

      const status = backupScheduler.getTasksStatus();

      res.status(200).json({
        success: true,
        message: "Status scheduler berhasil diambil",
        data: {
          schedulers: status,
          activeCount: Object.values(status).filter((s) => s.running).length,
          totalCount: Object.keys(status).length,
        },
      });
    } catch (error) {
      logger.error(`Error getting scheduler status: ${error.message}`);
      next(error);
    }
  }

  // Start scheduler tertentu
  static async startScheduler(req, res, next) {
    try {
      const { schedulerName } = req.params;

      if (!schedulerName) {
        return res.status(400).json({
          success: false,
          message: "Nama scheduler harus disediakan",
        });
      }

      logger.info(`Request start scheduler: ${schedulerName}`);

      let result;
      switch (schedulerName.toLowerCase()) {
        case "daily":
          backupScheduler.startDailyBackup();
          result = "Scheduler backup harian diaktifkan";
          break;
        case "weekly":
          backupScheduler.startWeeklyBackup();
          result = "Scheduler backup mingguan diaktifkan";
          break;
        case "monthly":
          backupScheduler.startMonthlyBackup();
          result = "Scheduler backup bulanan diaktifkan";
          break;
        case "cleanup":
          backupScheduler.startCleanupScheduler();
          result = "Scheduler pembersihan diaktifkan";
          break;
        case "all":
          backupScheduler.startAllDefaultSchedulers();
          result = "Semua scheduler default diaktifkan";
          break;
        default:
          return res.status(400).json({
            success: false,
            message:
              "Nama scheduler tidak valid. Gunakan: daily, weekly, monthly, cleanup, atau all",
          });
      }

      res.status(200).json({
        success: true,
        message: result,
        data: {
          schedulerName: schedulerName,
          status: "started",
          startedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error starting scheduler: ${error.message}`);
      next(error);
    }
  }

  // Stop scheduler tertentu
  static async stopScheduler(req, res, next) {
    try {
      const { schedulerName } = req.params;

      if (!schedulerName) {
        return res.status(400).json({
          success: false,
          message: "Nama scheduler harus disediakan",
        });
      }

      logger.info(`Request stop scheduler: ${schedulerName}`);

      let result;
      if (schedulerName.toLowerCase() === "all") {
        backupScheduler.stopAllTasks();
        result = "Semua scheduler dihentikan";
      } else {
        const stopped = backupScheduler.stopTask(schedulerName.toLowerCase());
        if (!stopped) {
          return res.status(404).json({
            success: false,
            message: `Scheduler ${schedulerName} tidak ditemukan atau tidak aktif`,
          });
        }
        result = `Scheduler ${schedulerName} dihentikan`;
      }

      res.status(200).json({
        success: true,
        message: result,
        data: {
          schedulerName: schedulerName,
          status: "stopped",
          stoppedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error stopping scheduler: ${error.message}`);
      next(error);
    }
  }

  // Jalankan backup sekarang (test)
  static async runBackupNow(req, res, next) {
    try {
      logger.info("Request backup manual melalui scheduler");

      const result = await backupScheduler.runBackupNow();

      res.status(200).json({
        success: true,
        message: "Backup manual berhasil dijalankan",
        data: result,
      });
    } catch (error) {
      logger.error(`Error running backup now: ${error.message}`);
      next(error);
    }
  }

  // Buat scheduler custom
  static async createCustomScheduler(req, res, next) {
    try {
      const { cronExpression, taskName } = req.body;

      if (!cronExpression || !taskName) {
        return res.status(400).json({
          success: false,
          message: "cronExpression dan taskName harus disediakan",
        });
      }

      // Validasi cron expression sederhana
      const cronParts = cronExpression.split(" ");
      if (cronParts.length !== 5) {
        return res.status(400).json({
          success: false,
          message:
            "Format cron expression tidak valid. Gunakan format: '* * * * *'",
        });
      }

      logger.info(
        `Request buat scheduler custom: ${taskName} (${cronExpression})`
      );

      backupScheduler.startCustomBackup(cronExpression, taskName);

      res.status(200).json({
        success: true,
        message: `Scheduler custom ${taskName} berhasil dibuat`,
        data: {
          taskName: taskName,
          cronExpression: cronExpression,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error creating custom scheduler: ${error.message}`);
      next(error);
    }
  }

  // Restart semua scheduler
  static async restartAllSchedulers(req, res, next) {
    try {
      logger.info("Request restart semua scheduler");

      // Stop semua scheduler dulu
      backupScheduler.stopAllTasks();

      // Tunggu sebentar
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Start semua scheduler default
      backupScheduler.startAllDefaultSchedulers();

      res.status(200).json({
        success: true,
        message: "Semua scheduler berhasil direstart",
        data: {
          restartedAt: new Date(),
          status: backupScheduler.getTasksStatus(),
        },
      });
    } catch (error) {
      logger.error(`Error restarting schedulers: ${error.message}`);
      next(error);
    }
  }
}

export { BackupSchedulerController };
