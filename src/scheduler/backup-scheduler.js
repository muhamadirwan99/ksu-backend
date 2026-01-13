import cron from "node-cron";
import backupService from "../service/backup-service.js";
import { logInfo, logError } from "../application/logging.js";

class BackupScheduler {
  constructor() {
    this.tasks = new Map();
  }

  // Jadwal backup harian (setiap hari jam 2 pagi)
  startDailyBackup() {
    // Cron: 0 19 * * * = setiap hari jam 19:00 UTC (02:00 WIB)
    const task = cron.schedule(
      "0 19 * * *",
      async () => {
        try {
          logInfo("Memulai backup otomatis harian");
          const result = await backupService.createDatabaseBackup();
          logInfo(`Backup otomatis harian berhasil: ${result.fileName}`);
        } catch (error) {
          logError("Error backup otomatis harian", error);
        }
      },
      {
        scheduled: false,
      }
    );

    this.tasks.set("daily", task);
    task.start();
    logInfo("Scheduler backup harian diaktifkan (setiap hari jam 02:00 WIB)");
  }

  // Jadwal backup mingguan (setiap Minggu jam 1 pagi)
  startWeeklyBackup() {
    // Cron: 0 18 * * 0 = setiap Minggu jam 18:00 UTC (01:00 WIB)
    const task = cron.schedule(
      "0 18 * * 0",
      async () => {
        try {
          logInfo("Memulai backup otomatis mingguan");
          const result = await backupService.createDatabaseBackup();
          logInfo(`Backup otomatis mingguan berhasil: ${result.fileName}`);

          // Bersihkan backup lama (lebih dari 30 hari)
          await backupService.cleanOldBackups(30);
        } catch (error) {
          logError(`Error backup otomatis mingguan: ${error.message}`);
        }
      },
      {
        scheduled: false,
      }
    );

    this.tasks.set("weekly", task);
    task.start();
    logInfo(
      "Scheduler backup mingguan diaktifkan (setiap Minggu jam 01:00 WIB)"
    );
  }

  // Jadwal backup bulanan (tanggal 1 setiap bulan jam 1 pagi)
  startMonthlyBackup() {
    // Cron: 0 18 1 * * = tanggal 1 setiap bulan jam 18:00 UTC (01:00 WIB)
    const task = cron.schedule(
      "0 18 1 * *",
      async () => {
        try {
          logInfo("Memulai backup otomatis bulanan");
          const result = await backupService.createDatabaseBackup();
          logInfo(`Backup otomatis bulanan berhasil: ${result.fileName}`);

          // Bersihkan backup lama (lebih dari 90 hari)
          await backupService.cleanOldBackups(90);
        } catch (error) {
          logError(`Error backup otomatis bulanan: ${error.message}`);
        }
      },
      {
        scheduled: false,
      }
    );

    this.tasks.set("monthly", task);
    task.start();
    logInfo(
      "Scheduler backup bulanan diaktifkan (tanggal 1 setiap bulan jam 01:00 WIB)"
    );
  }

  // Jadwal pembersihan backup lama (setiap Senin jam 3 pagi)
  startCleanupScheduler() {
    // Cron: 0 20 * * 1 = setiap Senin jam 20:00 UTC (03:00 WIB)
    // Menghapus file backup yang lebih dari 30 hari
    const task = cron.schedule(
      "0 20 * * 1",
      async () => {
        try {
          logInfo("Memulai pembersihan backup lama otomatis");
          const result = await backupService.cleanOldBackups(30);
          logInfo(
            `Pembersihan backup lama selesai: ${result.deletedCount} file dihapus`
          );
        } catch (error) {
          logError(`Error pembersihan backup lama otomatis: ${error.message}`);
        }
      },
      {
        scheduled: false,
      }
    );

    this.tasks.set("cleanup", task);
    task.start();
    logInfo(
      "Scheduler pembersihan backup diaktifkan (setiap Senin jam 03:00 WIB, hapus file > 30 hari)"
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
          logInfo(`Memulai backup otomatis custom (${taskName})`);
          const result = await backupService.createDatabaseBackup();
          logInfo(`Backup otomatis custom berhasil: ${result.fileName}`);
        } catch (error) {
          logError(
            `Error backup otomatis custom (${taskName}): ${error.message}`
          );
        }
      },
      {
        scheduled: false,
      }
    );

    this.tasks.set(taskName, task);
    task.start();
    logInfo(
      `Scheduler backup custom diaktifkan: ${taskName} (${cronExpression})`
    );
  }

  // Hentikan task tertentu
  stopTask(taskName) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      this.tasks.delete(taskName);
      logInfo(`Scheduler ${taskName} dihentikan`);
      return true;
    }
    return false;
  }

  // Hentikan semua task
  stopAllTasks() {
    this.tasks.forEach((task, name) => {
      task.stop();
      logInfo(`Scheduler ${name} dihentikan`);
    });
    this.tasks.clear();
    logInfo("Semua scheduler backup dihentikan");
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
    logInfo("Semua scheduler backup default telah diaktifkan");
  }

  // Test backup sekarang (untuk testing)
  async runBackupNow() {
    try {
      logInfo("Menjalankan backup test manual");
      const result = await backupService.createDatabaseBackup();
      logInfo(`Backup test berhasil: ${result.fileName}`);
      return result;
    } catch (error) {
      logError(`Error backup test: ${error.message}`);
      throw error;
    }
  }
}

export default new BackupScheduler();
