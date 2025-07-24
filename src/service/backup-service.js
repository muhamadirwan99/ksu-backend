import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { logger } from "../application/logging.js";
import { prismaClient } from "../application/database.js";

const execAsync = promisify(exec);

class BackupService {
  constructor() {
    // Gunakan path backups yang sudah dimapping di Docker
    this.backupDir = path.join(process.cwd(), "backups");
    this.ensureBackupDirectory();

    // Log path backup untuk debugging
    logger.info(`Backup directory initialized: ${this.backupDir}`);
  }

  // Pastikan direktori backup ada
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Created backup directory: ${this.backupDir}`);
    } else {
      logger.info(`Backup directory exists: ${this.backupDir}`);
    }
  }

  // Generate nama file backup dengan timestamp WIB (manual +7 jam)
  generateBackupFileName() {
    // Buat timestamp dengan offset manual +7 jam untuk WIB
    const now = new Date();
    const wibTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    const year = wibTime.getUTCFullYear();
    const month = String(wibTime.getUTCMonth() + 1).padStart(2, "0");
    const day = String(wibTime.getUTCDate()).padStart(2, "0");
    const hours = String(wibTime.getUTCHours()).padStart(2, "0");
    const minutes = String(wibTime.getUTCMinutes()).padStart(2, "0");
    const seconds = String(wibTime.getUTCSeconds()).padStart(2, "0");

    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    return `backup_ksu_${timestamp}_WIB.sql`;
  }

  // Backup database menggunakan mysqldump
  async createDatabaseBackup() {
    try {
      const databaseUrl = process.env.DATABASE_URL_NEW;
      if (!databaseUrl) {
        throw new Error(
          "DATABASE_URL_NEW tidak ditemukan di environment variables"
        );
      }

      // Parse database URL
      const url = new URL(databaseUrl);
      const dbConfig = {
        host: url.hostname,
        port: url.port || 3306,
        username: url.username,
        password: decodeURIComponent(url.password), // Decode URL-encoded characters
        database: url.pathname.slice(1), // Remove leading slash
      };

      const backupFileName = this.generateBackupFileName();
      const backupPath = path.join(this.backupDir, backupFileName);

      logger.info(`Backup akan disimpan di: ${backupPath}`);

      // Escape password for shell command to handle special characters
      const escapedPassword = dbConfig.password.replace(/'/g, "'\"'\"'");

      // Perintah mysqldump with properly escaped password
      const mysqldumpCommand = `mysqldump -h "${dbConfig.host}" -P ${dbConfig.port} -u "${dbConfig.username}" -p'${escapedPassword}' --single-transaction --routines --triggers "${dbConfig.database}" > "${backupPath}"`;

      logger.info(`Memulai backup database: ${backupFileName}`);
      logger.debug(
        `Command: ${mysqldumpCommand.replace(/-p'[^']*'/, "-p'***'")}`
      ); // Hide password in log

      // Eksekusi mysqldump
      await execAsync(mysqldumpCommand);

      // Verifikasi file backup dibuat
      if (!fs.existsSync(backupPath)) {
        throw new Error("File backup tidak berhasil dibuat");
      }

      const stats = fs.statSync(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      logger.info(
        `Backup database berhasil: ${backupFileName} (${fileSizeInMB} MB)`
      );

      // Simpan informasi backup ke database
      await this.saveBackupInfo(backupFileName, backupPath, stats.size);

      return {
        success: true,
        fileName: backupFileName,
        filePath: backupPath,
        fileSize: stats.size,
        fileSizeMB: fileSizeInMB,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error(`Error saat backup database: ${error.message}`);
      throw error;
    }
  }

  // Simpan informasi backup ke database
  async saveBackupInfo(fileName, filePath, fileSize) {
    try {
      // Jika tabel backup_logs belum ada, kita akan membuat log sederhana
      // Untuk sementara, kita log ke response_logs
      await prismaClient.responseLog.create({
        data: {
          success: true,
          message: `Database backup created: ${fileName}`,
          data: {
            type: "database_backup",
            fileName: fileName,
            filePath: filePath,
            fileSize: fileSize,
            fileSizeMB: (fileSize / (1024 * 1024)).toFixed(2),
          },
          created_at: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error menyimpan info backup: ${error.message}`);
    }
  }

  // Mendapatkan daftar backup yang tersedia
  async getBackupList() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files
        .filter((file) => file.endsWith(".sql"))
        .map((file) => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            fileName: file,
            filePath: filePath,
            fileSize: stats.size,
            fileSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
          };
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first

      return backupFiles;
    } catch (error) {
      logger.error(`Error mendapatkan daftar backup: ${error.message}`);
      throw error;
    }
  }

  // Hapus backup lama (lebih dari X hari)
  async cleanOldBackups(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = new Date();
      let deletedCount = 0;

      for (const file of files) {
        if (file.endsWith(".sql")) {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          const fileAge = (now - stats.birthtime) / (1000 * 60 * 60 * 24); // days

          if (fileAge > daysToKeep) {
            fs.unlinkSync(filePath);
            deletedCount++;
            logger.info(
              `Backup lama dihapus: ${file} (umur: ${fileAge.toFixed(1)} hari)`
            );
          }
        }
      }

      logger.info(`Pembersihan backup selesai. ${deletedCount} file dihapus.`);
      return { deletedCount };
    } catch (error) {
      logger.error(`Error membersihkan backup lama: ${error.message}`);
      throw error;
    }
  }

  // Restore database dari backup
  async restoreDatabase(backupFileName) {
    try {
      const backupPath = path.join(this.backupDir, backupFileName);

      if (!fs.existsSync(backupPath)) {
        throw new Error(`File backup tidak ditemukan: ${backupFileName}`);
      }

      const databaseUrl = process.env.DATABASE_URL_NEW;
      if (!databaseUrl) {
        throw new Error(
          "DATABASE_URL_NEW tidak ditemukan di environment variables"
        );
      }

      // Parse database URL
      const url = new URL(databaseUrl);
      const dbConfig = {
        host: url.hostname,
        port: url.port || 3306,
        username: url.username,
        password: decodeURIComponent(url.password), // Decode URL-encoded characters
        database: url.pathname.slice(1),
      };

      // Escape password for shell command to handle special characters
      const escapedPassword = dbConfig.password.replace(/'/g, "'\"'\"'");

      // Perintah mysql restore with properly escaped password
      const restoreCommand = `mysql -h "${dbConfig.host}" -P ${dbConfig.port} -u "${dbConfig.username}" -p'${escapedPassword}' "${dbConfig.database}" < "${backupPath}"`;

      logger.info(`Memulai restore database dari: ${backupFileName}`);

      await execAsync(restoreCommand);

      logger.info(`Restore database berhasil dari: ${backupFileName}`);

      // Log restore info
      await prismaClient.responseLog.create({
        data: {
          success: true,
          message: `Database restored from backup: ${backupFileName}`,
          data: {
            type: "database_restore",
            fileName: backupFileName,
            restoredAt: new Date(),
          },
          created_at: new Date(),
        },
      });

      return {
        success: true,
        message: `Database berhasil di-restore dari ${backupFileName}`,
        restoredAt: new Date(),
      };
    } catch (error) {
      logger.error(`Error saat restore database: ${error.message}`);
      throw error;
    }
  }

  // Backup data tertentu (table specific)
  async createTableBackup(tableName) {
    try {
      const databaseUrl = process.env.DATABASE_URL_NEW;
      if (!databaseUrl) {
        throw new Error(
          "DATABASE_URL_NEW tidak ditemukan di environment variables"
        );
      }

      const url = new URL(databaseUrl);
      const dbConfig = {
        host: url.hostname,
        port: url.port || 3306,
        username: url.username,
        password: decodeURIComponent(url.password), // Decode URL-encoded characters
        database: url.pathname.slice(1),
      };

      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
      const backupFileName = `backup_${tableName}_${timestamp}.sql`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Escape password for shell command to handle special characters
      const escapedPassword = dbConfig.password.replace(/'/g, "'\"'\"'");

      const mysqldumpCommand = `mysqldump -h "${dbConfig.host}" -P ${dbConfig.port} -u "${dbConfig.username}" -p'${escapedPassword}' "${dbConfig.database}" "${tableName}" > "${backupPath}"`;

      logger.info(`Memulai backup table ${tableName}: ${backupFileName}`);

      await execAsync(mysqldumpCommand);

      const stats = fs.statSync(backupPath);
      const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      logger.info(
        `Backup table ${tableName} berhasil: ${backupFileName} (${fileSizeInMB} MB)`
      );

      return {
        success: true,
        tableName: tableName,
        fileName: backupFileName,
        filePath: backupPath,
        fileSize: stats.size,
        fileSizeMB: fileSizeInMB,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error(`Error saat backup table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  // Mendapatkan status disk space
  async getDiskSpaceInfo() {
    try {
      const { stdout } = await execAsync(`df -h "${this.backupDir}"`);
      return stdout;
    } catch (error) {
      // Fallback untuk Windows
      try {
        const { stdout } = await execAsync(`dir "${this.backupDir}" /-c`);
        return stdout;
      } catch (winError) {
        logger.error(`Error mendapatkan info disk space: ${error.message}`);
        return "Informasi disk space tidak tersedia";
      }
    }
  }
}

export default new BackupService();
