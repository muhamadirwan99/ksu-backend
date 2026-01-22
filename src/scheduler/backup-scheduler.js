import cron from "node-cron";
import backupService from "../service/backup-service.js";
import { logInfo, logError } from "../application/logging.js";

class BackupScheduler {
  constructor() {
    this.tasks = new Map();
    // Setting default timezone agar tidak perlu konversi manual ke UTC
    this.timezone = "Asia/Jakarta";
  }

  /**
   * Private Helper untuk membuat task cron dengan aman dan rapi
   */
  _scheduleTask(taskName, cronExpression, callback) {
    // Hentikan task lama jika ada (untuk menghindari duplikasi)
    if (this.tasks.has(taskName)) {
      this.stopTask(taskName);
    }

    // Validasi cron expression
    if (!cron.validate(cronExpression)) {
      logError(`Invalid cron expression for ${taskName}: ${cronExpression}`);
      return;
    }

    const task = cron.schedule(
      cronExpression,
      async () => {
        try {
          await callback();
        } catch (error) {
          logError(`Error pada scheduler ${taskName}:`, error);
        }
      },
      {
        scheduled: false, // Kita start manual di bawah
        timezone: this.timezone, // KUNCI: Pakai timezone Jakarta
      },
    );

    this.tasks.set(taskName, task);
    task.start();
    logInfo(
      `Scheduler '${taskName}' aktif. Jadwal: ${cronExpression} (${this.timezone})`,
    );
  }

  // ==========================================
  // PUBLIC METHODS
  // ==========================================

  // Jadwal backup harian (Setiap hari jam 02:00 WIB)
  startDailyBackup() {
    // Tidak perlu ubah ke UTC (19:00). Cukup tulis jam 2 pagi.
    this._scheduleTask("daily", "0 2 * * *", async () => {
      logInfo("Memulai backup otomatis harian");
      const result = await backupService.createDatabaseBackup();
      logInfo(`Backup harian berhasil: ${result.fileName}`);
    });
  }

  // Jadwal backup mingguan (Setiap Minggu jam 01:00 WIB)
  startWeeklyBackup() {
    this._scheduleTask("weekly", "0 1 * * 0", async () => {
      logInfo("Memulai backup otomatis mingguan");
      const result = await backupService.createDatabaseBackup();
      logInfo(`Backup mingguan berhasil: ${result.fileName}`);

      // Bersihkan backup lama (> 30 hari) setelah backup sukses
      await backupService.cleanOldBackups(30);
    });
  }

  // Jadwal backup bulanan (Tanggal 1 jam 01:00 WIB)
  startMonthlyBackup() {
    this._scheduleTask("monthly", "0 1 1 * *", async () => {
      logInfo("Memulai backup otomatis bulanan");
      const result = await backupService.createDatabaseBackup();
      logInfo(`Backup bulanan berhasil: ${result.fileName}`);

      // Bersihkan backup lama (> 90 hari)
      await backupService.cleanOldBackups(90);
    });
  }

  // Jadwal pembersihan khusus (Setiap Senin jam 03:00 WIB)
  startCleanupScheduler() {
    this._scheduleTask("cleanup", "0 3 * * 1", async () => {
      logInfo("Memulai pembersihan backup lama otomatis (Weekly Cleanup)");
      const result = await backupService.cleanOldBackups(30);
      logInfo(`Pembersihan selesai: ${result.deletedCount} file dihapus`);
    });
  }

  // Jadwal backup custom
  startCustomBackup(cronExpression, taskName = "custom") {
    this._scheduleTask(taskName, cronExpression, async () => {
      logInfo(`Memulai backup custom (${taskName})`);
      const result = await backupService.createDatabaseBackup();
      logInfo(`Backup custom berhasil: ${result.fileName}`);
    });
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
    for (const [name, task] of this.tasks) {
      task.stop();
      logInfo(`Scheduler ${name} dihentikan`);
    }
    this.tasks.clear();
    logInfo("Semua scheduler backup dihentikan");
  }

  // Dapatkan status semua task
  getTasksStatus() {
    const status = {};
    for (const [name, task] of this.tasks) {
      status[name] = {
        running: true, // task.running di node-cron kadang tidak reliable, tapi jika ada di map berarti active
        timezone: this.timezone,
      };
    }
    return status;
  }

  // Mulai semua scheduler default
  startAllDefaultSchedulers() {
    this.startDailyBackup();
    this.startWeeklyBackup();
    this.startMonthlyBackup();
    this.startCleanupScheduler();
    logInfo("Semua scheduler backup default telah diinisialisasi");
  }

  // Test backup manual
  async runBackupNow() {
    try {
      logInfo("Menjalankan backup manual (Test)");
      const result = await backupService.createDatabaseBackup();
      logInfo(`Backup manual berhasil: ${result.fileName}`);
      return result;
    } catch (error) {
      logError("Error backup manual:", error);
      throw error;
    }
  }
}

export default new BackupScheduler();
