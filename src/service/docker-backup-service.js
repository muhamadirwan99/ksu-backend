import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { logger } from "../application/logging.js";

const execAsync = promisify(exec);

class DockerBackupService {
  constructor() {
    // Support both development and Docker environments
    this.backupDir =
      process.env.BACKUP_DIRECTORY || path.join(process.cwd(), "backup");
    this.ensureBackupDirectory();

    // Database configuration for Docker
    this.dbConfig = {
      host: process.env.BACKUP_MYSQL_HOST || this.parseFromDatabaseUrl("host"),
      port: process.env.BACKUP_MYSQL_PORT || this.parseFromDatabaseUrl("port"),
      user: process.env.BACKUP_MYSQL_USER || this.parseFromDatabaseUrl("user"),
      password:
        process.env.BACKUP_MYSQL_PASSWORD ||
        this.parseFromDatabaseUrl("password"),
      database:
        process.env.BACKUP_MYSQL_DATABASE ||
        this.parseFromDatabaseUrl("database"),
    };
  }

  // Parse database config from DATABASE_URL if environment variables not set
  parseFromDatabaseUrl(field) {
    try {
      const databaseUrl =
        process.env.DATABASE_URL || process.env.DATABASE_URL_NEW;
      if (!databaseUrl) return null;

      const url = new URL(databaseUrl);
      switch (field) {
        case "host":
          return url.hostname;
        case "port":
          return url.port || "3306";
        case "user":
          return url.username;
        case "password":
          return url.password;
        case "database":
          return url.pathname.substring(1);
        default:
          return null;
      }
    } catch (error) {
      logger.error(`Error parsing database URL for ${field}:`, error);
      return null;
    }
  }

  // Pastikan direktori backup ada
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info(`Backup directory created: ${this.backupDir}`);
    }
  }

  // Generate nama file backup dengan timestamp
  generateBackupFileName(prefix = "backup_ksu") {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
    return `${prefix}_${timestamp}.sql`;
  }

  // Backup database untuk Docker environment
  async createDatabaseBackup() {
    try {
      this.ensureBackupDirectory();

      const fileName = this.generateBackupFileName();
      const filePath = path.join(this.backupDir, fileName);

      logger.info(`Memulai backup database: ${fileName}`);

      // Validate database configuration
      if (
        !this.dbConfig.host ||
        !this.dbConfig.user ||
        !this.dbConfig.database
      ) {
        throw new Error("Database configuration incomplete");
      }

      // Check if running in Docker container
      const isDocker = fs.existsSync("/.dockerenv");

      let mysqldumpCmd;

      if (isDocker) {
        // Running in Docker container - use container network
        mysqldumpCmd = `mysqldump -h ${this.dbConfig.host} -P ${this.dbConfig.port} -u ${this.dbConfig.user}`;
      } else {
        // Running locally - use external host
        mysqldumpCmd = `mysqldump -h ${this.dbConfig.host} -P ${this.dbConfig.port} -u ${this.dbConfig.user}`;
      }

      // Add password if available
      if (this.dbConfig.password) {
        mysqldumpCmd += ` -p${this.dbConfig.password}`;
      }

      // Add database and output
      mysqldumpCmd += ` ${this.dbConfig.database} > "${filePath}"`;

      logger.info(
        `Executing backup command for ${isDocker ? "Docker" : "Local"} environment`
      );

      const { stdout, stderr } = await execAsync(mysqldumpCmd);

      if (stderr && !stderr.includes("Warning")) {
        throw new Error(`Backup failed: ${stderr}`);
      }

      // Verify backup file was created
      if (!fs.existsSync(filePath)) {
        throw new Error("Backup file was not created");
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      logger.info(`Backup database berhasil: ${fileName} (${fileSizeMB} MB)`);

      return {
        success: true,
        fileName,
        filePath,
        fileSize: stats.size,
        fileSizeMB,
        createdAt: new Date(),
        environment: isDocker ? "docker" : "local",
      };
    } catch (error) {
      logger.error(`Error saat backup database: ${error.message}`);
      throw error;
    }
  }

  // Backup table specific untuk Docker
  async createTableBackup(tableName) {
    try {
      this.ensureBackupDirectory();

      const fileName = this.generateBackupFileName(`backup_${tableName}`);
      const filePath = path.join(this.backupDir, fileName);

      logger.info(`Memulai backup table ${tableName}: ${fileName}`);

      const isDocker = fs.existsSync("/.dockerenv");

      let mysqldumpCmd = `mysqldump -h ${this.dbConfig.host} -P ${this.dbConfig.port} -u ${this.dbConfig.user}`;

      if (this.dbConfig.password) {
        mysqldumpCmd += ` -p${this.dbConfig.password}`;
      }

      mysqldumpCmd += ` ${this.dbConfig.database} ${tableName} > "${filePath}"`;

      const { stdout, stderr } = await execAsync(mysqldumpCmd);

      if (stderr && !stderr.includes("Warning")) {
        throw new Error(`Table backup failed: ${stderr}`);
      }

      const stats = fs.statSync(filePath);
      const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

      logger.info(
        `Backup table ${tableName} berhasil: ${fileName} (${fileSizeMB} MB)`
      );

      return {
        success: true,
        tableName,
        fileName,
        filePath,
        fileSize: stats.size,
        fileSizeMB,
        createdAt: new Date(),
        environment: isDocker ? "docker" : "local",
      };
    } catch (error) {
      logger.error(`Error saat backup table ${tableName}: ${error.message}`);
      throw error;
    }
  }

  // Restore database untuk Docker
  async restoreDatabase(backupFileName) {
    try {
      const filePath = path.join(this.backupDir, backupFileName);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File backup tidak ditemukan: ${backupFileName}`);
      }

      logger.info(`Memulai restore database dari: ${backupFileName}`);

      let mysqlCmd = `mysql -h ${this.dbConfig.host} -P ${this.dbConfig.port} -u ${this.dbConfig.user}`;

      if (this.dbConfig.password) {
        mysqlCmd += ` -p${this.dbConfig.password}`;
      }

      mysqlCmd += ` ${this.dbConfig.database} < "${filePath}"`;

      const { stdout, stderr } = await execAsync(mysqlCmd);

      if (stderr && !stderr.includes("Warning")) {
        throw new Error(`Restore failed: ${stderr}`);
      }

      logger.info(`Restore database berhasil dari: ${backupFileName}`);

      return {
        success: true,
        backupFileName,
        restoredAt: new Date(),
      };
    } catch (error) {
      logger.error(`Error saat restore database: ${error.message}`);
      throw error;
    }
  }

  // Get backup list dengan info tambahan
  async getBackupList() {
    try {
      this.ensureBackupDirectory();

      const files = fs.readdirSync(this.backupDir);
      const backupFiles = files.filter((file) => file.endsWith(".sql"));

      const backups = backupFiles.map((fileName) => {
        const filePath = path.join(this.backupDir, fileName);
        const stats = fs.statSync(filePath);

        return {
          fileName,
          filePath,
          fileSize: stats.size,
          fileSizeMB: (stats.size / (1024 * 1024)).toFixed(2),
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
        };
      });

      // Sort by creation date (newest first)
      backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        backups,
        total: backups.length,
      };
    } catch (error) {
      logger.error(`Error getting backup list: ${error.message}`);
      throw error;
    }
  }

  // Get backup info dengan disk usage
  async getBackupInfo() {
    try {
      const backupList = await this.getBackupList();

      // Calculate total size
      const totalSize = backupList.backups.reduce(
        (sum, backup) => sum + backup.fileSize,
        0
      );
      const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

      // Get disk usage
      let diskInfo = "N/A";
      try {
        const { stdout } = await execAsync("df -h .");
        diskInfo = stdout.trim();
      } catch (error) {
        // Fallback for Windows
        try {
          const { stdout } = await execAsync("dir /-c");
          diskInfo = "Windows disk info available via dir command";
        } catch {
          diskInfo = "Disk info not available";
        }
      }

      return {
        backupDirectory: this.backupDir,
        totalBackups: backupList.total,
        totalSize,
        totalSizeMB,
        latestBackup: backupList.backups[0] || null,
        diskInfo,
        environment: fs.existsSync("/.dockerenv") ? "docker" : "local",
        dbConfig: {
          host: this.dbConfig.host,
          port: this.dbConfig.port,
          database: this.dbConfig.database,
        },
      };
    } catch (error) {
      logger.error(`Error getting backup info: ${error.message}`);
      throw error;
    }
  }

  // Delete backup file
  async deleteBackup(backupFileName) {
    try {
      const filePath = path.join(this.backupDir, backupFileName);

      if (!fs.existsSync(filePath)) {
        throw new Error(`File backup tidak ditemukan: ${backupFileName}`);
      }

      fs.unlinkSync(filePath);
      logger.info(`Backup file deleted: ${backupFileName}`);

      return {
        success: true,
        deletedFile: backupFileName,
        deletedAt: new Date(),
      };
    } catch (error) {
      logger.error(`Error deleting backup: ${error.message}`);
      throw error;
    }
  }

  // Cleanup old backups based on retention policy
  async cleanupOldBackups(retentionDays = 30) {
    try {
      const backupList = await this.getBackupList();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const filesToDelete = backupList.backups.filter(
        (backup) => new Date(backup.createdAt) < cutoffDate
      );

      let deletedCount = 0;
      for (const backup of filesToDelete) {
        try {
          await this.deleteBackup(backup.fileName);
          deletedCount++;
        } catch (error) {
          logger.warn(
            `Failed to delete old backup ${backup.fileName}: ${error.message}`
          );
        }
      }

      logger.info(
        `Cleanup completed. Deleted ${deletedCount} old backup files`
      );

      return {
        success: true,
        deletedCount,
        retentionDays,
        cleanupDate: new Date(),
      };
    } catch (error) {
      logger.error(`Error during cleanup: ${error.message}`);
      throw error;
    }
  }
}

export const dockerBackupService = new DockerBackupService();
