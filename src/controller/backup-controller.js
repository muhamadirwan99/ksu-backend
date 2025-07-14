import backupService from "../service/backup-service.js";
import { logger } from "../application/logging.js";

class BackupController {
  // Membuat backup database manual
  static async createBackup(req, res, next) {
    try {
      logger.info("Request backup database manual");

      const result = await backupService.createDatabaseBackup();

      res.status(200).json({
        success: true,
        message: "Backup database berhasil dibuat",
        data: result,
      });
    } catch (error) {
      logger.error(`Error creating backup: ${error.message}`);
      next(error);
    }
  }

  // Mendapatkan daftar backup yang tersedia
  static async getBackupList(req, res, next) {
    try {
      logger.info("Request daftar backup");

      const backups = await backupService.getBackupList();

      res.status(200).json({
        success: true,
        message: "Daftar backup berhasil diambil",
        data: {
          backups: backups,
          total: backups.length,
        },
      });
    } catch (error) {
      logger.error(`Error getting backup list: ${error.message}`);
      next(error);
    }
  }

  // Restore database dari backup
  static async restoreBackup(req, res, next) {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({
          success: false,
          message: "Nama file backup harus disediakan",
        });
      }

      logger.info(`Request restore database dari: ${fileName}`);

      const result = await backupService.restoreDatabase(fileName);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      logger.error(`Error restoring backup: ${error.message}`);
      next(error);
    }
  }

  // Hapus backup lama
  static async cleanOldBackups(req, res, next) {
    try {
      const { days } = req.query;
      const daysToKeep = parseInt(days) || 30;

      logger.info(`Request pembersihan backup lama (${daysToKeep} hari)`);

      const result = await backupService.cleanOldBackups(daysToKeep);

      res.status(200).json({
        success: true,
        message: `Pembersihan backup lama berhasil. ${result.deletedCount} file dihapus.`,
        data: result,
      });
    } catch (error) {
      logger.error(`Error cleaning old backups: ${error.message}`);
      next(error);
    }
  }

  // Backup table tertentu
  static async createTableBackup(req, res, next) {
    try {
      const { tableName } = req.params;

      if (!tableName) {
        return res.status(400).json({
          success: false,
          message: "Nama table harus disediakan",
        });
      }

      logger.info(`Request backup table: ${tableName}`);

      const result = await backupService.createTableBackup(tableName);

      res.status(200).json({
        success: true,
        message: `Backup table ${tableName} berhasil dibuat`,
        data: result,
      });
    } catch (error) {
      logger.error(`Error creating table backup: ${error.message}`);
      next(error);
    }
  }

  // Download file backup
  static async downloadBackup(req, res, next) {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({
          success: false,
          message: "Nama file backup harus disediakan",
        });
      }

      const backups = await backupService.getBackupList();
      const backup = backups.find((b) => b.fileName === fileName);

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: "File backup tidak ditemukan",
        });
      }

      logger.info(`Request download backup: ${fileName}`);

      // Set headers untuk download
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Type", "application/sql");
      res.setHeader("Content-Length", backup.fileSize);

      // Stream file ke response
      const fs = await import("fs");
      const readStream = fs.createReadStream(backup.filePath);

      readStream.on("error", (error) => {
        logger.error(`Error streaming backup file: ${error.message}`);
        res.status(500).json({
          success: false,
          message: "Error saat mendownload file backup",
        });
      });

      readStream.pipe(res);
    } catch (error) {
      logger.error(`Error downloading backup: ${error.message}`);
      next(error);
    }
  }

  // Mendapatkan info storage backup
  static async getBackupInfo(req, res, next) {
    try {
      logger.info("Request info backup");

      const backups = await backupService.getBackupList();
      const diskInfo = await backupService.getDiskSpaceInfo();

      // Hitung total size semua backup
      const totalSize = backups.reduce(
        (sum, backup) => sum + backup.fileSize,
        0
      );
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

      res.status(200).json({
        success: true,
        message: "Info backup berhasil diambil",
        data: {
          totalBackups: backups.length,
          totalSize: totalSize,
          totalSizeMB: totalSizeMB,
          latestBackup: backups[0] || null,
          diskInfo: diskInfo,
          backupDirectory: backupService.backupDir,
        },
      });
    } catch (error) {
      logger.error(`Error getting backup info: ${error.message}`);
      next(error);
    }
  }

  // Hapus backup tertentu
  static async deleteBackup(req, res, next) {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({
          success: false,
          message: "Nama file backup harus disediakan",
        });
      }

      const backups = await backupService.getBackupList();
      const backup = backups.find((b) => b.fileName === fileName);

      if (!backup) {
        return res.status(404).json({
          success: false,
          message: "File backup tidak ditemukan",
        });
      }

      logger.info(`Request hapus backup: ${fileName}`);

      const fs = await import("fs");
      fs.unlinkSync(backup.filePath);

      res.status(200).json({
        success: true,
        message: `Backup ${fileName} berhasil dihapus`,
        data: {
          deletedFile: fileName,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error deleting backup: ${error.message}`);
      next(error);
    }
  }
}

export { BackupController };
