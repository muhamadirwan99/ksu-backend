import cron from "node-cron";
import backupService from "../service/backup-service.js";
import { logger } from "../application/logging.js";

class BackupScheduler {
  constructor() {
    this.tasks = new Map();
  }

  // Jadwal backup harian (setiap hari jam 2 pagi)
  startDailyBackup() {
    // Cron: 0 2 * * * = setiap hari jam 2:00 AM
    const task = cron.schedule(
      "0 2 * * *",
      async () => {
        try {
          logger.info("Memulai backup otomatis harian");
          const result = await backupService.createDatabaseBackup();
          logger.info(`Backup otomatis harian berhasil: ${result.fileName}`);
        } catch (error) {
          logger.error(`Error backup otomatis harian: ${error.message}`);
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Jakarta",
      }
    );

    this.tasks.set("daily", task);
    task.start();
    logger.info(
      "Scheduler backup harian diaktifkan (setiap hari jam 02:00 WIB)"
    );
  }

  // Jadwal backup mingguan (setiap Minggu jam 1 pagi)
  startWeeklyBackup() {
    // Cron: 0 1 * * 0 = setiap Minggu jam 1:00 AM
    const task = cron.schedule(
      "0 1 * * 0",
      async () => {
        try {
          logger.info("Memulai backup otomatis mingguan");
          const result = await backupService.createDatabaseBackup();
          logger.info(`Backup otomatis mingguan berhasil: ${result.fileName}`);

          // Bersihkan backup lama (lebih dari 30 hari)
          await backupService.cleanOldBackups(30);
        } catch (error) {
          logger.error(`Error backup otomatis mingguan: ${error.message}`);
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Jakarta",
      }
    );

    this.tasks.set("weekly", task);
    task.start();
    logger.info(
      "Scheduler backup mingguan diaktifkan (setiap Minggu jam 01:00 WIB)"
    );
  }

  // Jadwal backup bulanan (tanggal 1 setiap bulan jam 1 pagi)
  startMonthlyBackup() {
    // Cron: 0 1 1 * * = tanggal 1 setiap bulan jam 1:00 AM
    const task = cron.schedule(
      "0 1 1 * *",
      async () => {
        try {
          logger.info("Memulai backup otomatis bulanan");
          const result = await backupService.createDatabaseBackup();
          logger.info(`Backup otomatis bulanan berhasil: ${result.fileName}`);

          // Bersihkan backup lama (lebih dari 90 hari)
          await backupService.cleanOldBackups(90);
        } catch (error) {
          logger.error(`Error backup otomatis bulanan: ${error.message}`);
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Jakarta",
      }
    );

    this.tasks.set("monthly", task);
    task.start();
    logger.info(
      "Scheduler backup bulanan diaktifkan (tanggal 1 setiap bulan jam 01:00 WIB)"
    );
  }

  // Jadwal pembersihan backup lama (setiap Senin jam 3 pagi)
  startCleanupScheduler() {
    // Cron: 0 3 * * 1 = setiap Senin jam 3:00 AM
    const task = cron.schedule(
      "0 3 * * 1",
      async () => {
        try {
          logger.info("Memulai pembersihan backup lama otomatis");
          const result = await backupService.cleanOldBackups(30);
          logger.info(
            `Pembersihan backup lama selesai: ${result.deletedCount} file dihapus`
          );
        } catch (error) {
          logger.error(
            `Error pembersihan backup lama otomatis: ${error.message}`
          );
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Jakarta",
      }
    );

    this.tasks.set("cleanup", task);
    task.start();
    logger.info(
      "Scheduler pembersihan backup diaktifkan (setiap Senin jam 03:00 WIB)"
    );
  }

  // Jadwal backup custom dengan interval
  startCustomBackup(cronExpression, taskName = "custom") {
    if (this.tasks.has(taskName)) {
      this.stopTask(taskName);
    }

    const task = cron.schedule(
      cronExpression,
      async () => {
        try {
          logger.info(`Memulai backup otomatis custom (${taskName})`);
          const result = await backupService.createDatabaseBackup();
          logger.info(`Backup otomatis custom berhasil: ${result.fileName}`);
        } catch (error) {
          logger.error(
            `Error backup otomatis custom (${taskName}): ${error.message}`
          );
        }
      },
      {
        scheduled: false,
        timezone: "Asia/Jakarta",
      }
    );

    this.tasks.set(taskName, task);
    task.start();
    logger.info(
      `Scheduler backup custom diaktifkan: ${taskName} (${cronExpression})`
    );
  }

  // Hentikan task tertentu
  stopTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      this.tasks.delete(taskName);
      logger.info(`Scheduler ${taskName} dihentikan`);
      return true;
    }
    return false;
  }

  // Hentikan semua task
  stopAllTasks() {
    this.tasks.forEach((task, name) => {
      task.stop();
      logger.info(`Scheduler ${name} dihentikan`);
    });
    this.tasks.clear();
    logger.info("Semua scheduler backup dihentikan");
  }

  // Dapatkan status semua task
  getTasksStatus() {
    const status = {};
    this.tasks.forEach((task, name) => {
      status[name] = {
        running: task.running,
        scheduled: task.scheduled,
      };
    });
    return status;
  }

  // Mulai semua scheduler default
  startAllDefaultSchedulers() {
    this.startDailyBackup();
    this.startWeeklyBackup();
    this.startMonthlyBackup();
    this.startCleanupScheduler();
    logger.info("Semua scheduler backup default telah diaktifkan");
  }

  // Test backup sekarang (untuk testing)
  async runBackupNow() {
    try {
      logger.info("Menjalankan backup test manual");
      const result = await backupService.createDatabaseBackup();
      logger.info(`Backup test berhasil: ${result.fileName}`);
      return result;
    } catch (error) {
      logger.error(`Error backup test: ${error.message}`);
      throw error;
    }
  }
}

export default new BackupScheduler();
