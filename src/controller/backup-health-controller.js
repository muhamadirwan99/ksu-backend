import backupService from "../service/backup-service.js";
import backupScheduler from "../scheduler/backup-scheduler.js";
import { logger } from "../application/logging.js";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

class BackupHealthController {
  // Health check untuk sistem backup
  static async healthCheck(req, res, next) {
    try {
      logger.info("Request health check sistem backup");

      const healthStatus = {
        overall: "healthy",
        timestamp: new Date(),
        checks: {},
        warnings: [],
        errors: [],
      };

      // 1. Check backup directory
      try {
        const backupDirExists = fs.existsSync(backupService.backupDir);
        healthStatus.checks.backupDirectory = {
          status: backupDirExists ? "ok" : "error",
          path: backupService.backupDir,
          exists: backupDirExists,
        };

        if (!backupDirExists) {
          healthStatus.errors.push("Backup directory tidak ditemukan");
          healthStatus.overall = "unhealthy";
        }
      } catch (error) {
        healthStatus.checks.backupDirectory = {
          status: "error",
          error: error.message,
        };
        healthStatus.errors.push(
          `Error checking backup directory: ${error.message}`
        );
        healthStatus.overall = "unhealthy";
      }

      // 2. Check MySQL tools
      try {
        await execAsync("mysqldump --version");
        healthStatus.checks.mysqldump = {
          status: "ok",
          available: true,
        };
      } catch (error) {
        healthStatus.checks.mysqldump = {
          status: "error",
          available: false,
          error: error.message,
        };
        healthStatus.errors.push("mysqldump tidak tersedia");
        healthStatus.overall = "unhealthy";
      }

      try {
        await execAsync("mysql --version");
        healthStatus.checks.mysql = {
          status: "ok",
          available: true,
        };
      } catch (error) {
        healthStatus.checks.mysql = {
          status: "error",
          available: false,
          error: error.message,
        };
        healthStatus.errors.push("mysql client tidak tersedia");
        healthStatus.overall = "unhealthy";
      }

      // 3. Check database connection
      try {
        const databaseUrl = process.env.DATABASE_URL_NEW;
        healthStatus.checks.databaseConfig = {
          status: databaseUrl ? "ok" : "error",
          configured: !!databaseUrl,
        };

        if (!databaseUrl) {
          healthStatus.errors.push("DATABASE_URL_NEW tidak dikonfigurasi");
          healthStatus.overall = "unhealthy";
        }
      } catch (error) {
        healthStatus.checks.databaseConfig = {
          status: "error",
          error: error.message,
        };
        healthStatus.errors.push(
          `Error checking database config: ${error.message}`
        );
        healthStatus.overall = "unhealthy";
      }

      // 4. Check scheduler status
      try {
        const schedulerStatus = backupScheduler.getTasksStatus();
        const activeSchedulers = Object.values(schedulerStatus).filter(
          (s) => s.running
        ).length;
        const totalSchedulers = Object.keys(schedulerStatus).length;

        healthStatus.checks.scheduler = {
          status: activeSchedulers > 0 ? "ok" : "warning",
          activeSchedulers: activeSchedulers,
          totalSchedulers: totalSchedulers,
          schedulers: schedulerStatus,
        };

        if (activeSchedulers === 0) {
          healthStatus.warnings.push("Tidak ada scheduler backup yang aktif");
          if (healthStatus.overall === "healthy") {
            healthStatus.overall = "degraded";
          }
        }
      } catch (error) {
        healthStatus.checks.scheduler = {
          status: "error",
          error: error.message,
        };
        healthStatus.errors.push(`Error checking scheduler: ${error.message}`);
        healthStatus.overall = "unhealthy";
      }

      // 5. Check disk space
      try {
        const diskInfo = await backupService.getDiskSpaceInfo();
        healthStatus.checks.diskSpace = {
          status: "ok",
          info: diskInfo,
        };

        // Parse disk usage (basic check for Unix systems)
        if (diskInfo.includes("%")) {
          const usageMatch = diskInfo.match(/(\d+)%/);
          if (usageMatch && parseInt(usageMatch[1]) > 90) {
            healthStatus.warnings.push("Disk space hampir penuh (>90%)");
            if (healthStatus.overall === "healthy") {
              healthStatus.overall = "degraded";
            }
          }
        }
      } catch (error) {
        healthStatus.checks.diskSpace = {
          status: "warning",
          error: error.message,
        };
        healthStatus.warnings.push(
          `Tidak dapat memeriksa disk space: ${error.message}`
        );
      }

      // 6. Check recent backups
      try {
        const backups = await backupService.getBackupList();
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentBackups = backups.filter(
          (backup) => new Date(backup.createdAt) > oneDayAgo
        );

        healthStatus.checks.recentBackups = {
          status: recentBackups.length > 0 ? "ok" : "warning",
          totalBackups: backups.length,
          recentBackups: recentBackups.length,
          lastBackup: backups[0] || null,
        };

        if (recentBackups.length === 0 && backups.length === 0) {
          healthStatus.warnings.push("Tidak ada backup yang tersedia");
          if (healthStatus.overall === "healthy") {
            healthStatus.overall = "degraded";
          }
        } else if (recentBackups.length === 0) {
          healthStatus.warnings.push("Tidak ada backup dalam 24 jam terakhir");
          if (healthStatus.overall === "healthy") {
            healthStatus.overall = "degraded";
          }
        }
      } catch (error) {
        healthStatus.checks.recentBackups = {
          status: "error",
          error: error.message,
        };
        healthStatus.errors.push(
          `Error checking recent backups: ${error.message}`
        );
        healthStatus.overall = "unhealthy";
      }

      // Determine HTTP status code based on overall health
      let statusCode = 200;
      if (healthStatus.overall === "unhealthy") {
        statusCode = 503; // Service Unavailable
      } else if (healthStatus.overall === "degraded") {
        statusCode = 200; // OK but with warnings
      }

      res.status(statusCode).json({
        success: healthStatus.overall !== "unhealthy",
        message: `Backup system status: ${healthStatus.overall}`,
        data: healthStatus,
      });
    } catch (error) {
      logger.error(`Error in backup health check: ${error.message}`);
      next(error);
    }
  }

  // Quick status check (minimal)
  static async quickStatus(req, res, next) {
    try {
      const backups = await backupService.getBackupList();
      const schedulerStatus = backupScheduler.getTasksStatus();
      const activeSchedulers = Object.values(schedulerStatus).filter(
        (s) => s.running
      ).length;

      res.status(200).json({
        success: true,
        message: "Quick backup status",
        data: {
          totalBackups: backups.length,
          latestBackup: backups[0] || null,
          activeSchedulers: activeSchedulers,
          backupDirectory: backupService.backupDir,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error(`Error in quick status check: ${error.message}`);
      next(error);
    }
  }

  // Test backup functionality
  static async testBackup(req, res, next) {
    try {
      logger.info("Request test backup functionality");

      const testResults = {
        overall: "success",
        tests: {},
        errors: [],
      };

      // Test 1: Create backup directory
      try {
        backupService.ensureBackupDirectory();
        testResults.tests.createDirectory = {
          status: "pass",
          message: "Backup directory created/verified",
        };
      } catch (error) {
        testResults.tests.createDirectory = {
          status: "fail",
          error: error.message,
        };
        testResults.errors.push("Cannot create backup directory");
        testResults.overall = "failed";
      }

      // Test 2: Generate backup filename
      try {
        const filename = backupService.generateBackupFileName();
        testResults.tests.generateFilename = {
          status: "pass",
          filename: filename,
          message: "Backup filename generated successfully",
        };
      } catch (error) {
        testResults.tests.generateFilename = {
          status: "fail",
          error: error.message,
        };
        testResults.errors.push("Cannot generate backup filename");
        testResults.overall = "failed";
      }

      // Test 3: Check MySQL tools
      try {
        await execAsync("mysqldump --version");
        testResults.tests.mysqldumpAvailable = {
          status: "pass",
          message: "mysqldump is available",
        };
      } catch (error) {
        testResults.tests.mysqldumpAvailable = {
          status: "fail",
          error: error.message,
        };
        testResults.errors.push("mysqldump not available");
        testResults.overall = "failed";
      }

      // Test 4: Get backup list
      try {
        const backups = await backupService.getBackupList();
        testResults.tests.getBackupList = {
          status: "pass",
          count: backups.length,
          message: "Backup list retrieved successfully",
        };
      } catch (error) {
        testResults.tests.getBackupList = {
          status: "fail",
          error: error.message,
        };
        testResults.errors.push("Cannot get backup list");
        testResults.overall = "failed";
      }

      // Test 5: Scheduler status
      try {
        const schedulerStatus = backupScheduler.getTasksStatus();
        testResults.tests.schedulerStatus = {
          status: "pass",
          schedulers: schedulerStatus,
          message: "Scheduler status retrieved successfully",
        };
      } catch (error) {
        testResults.tests.schedulerStatus = {
          status: "fail",
          error: error.message,
        };
        testResults.errors.push("Cannot get scheduler status");
        testResults.overall = "failed";
      }

      const statusCode = testResults.overall === "success" ? 200 : 500;

      res.status(statusCode).json({
        success: testResults.overall === "success",
        message: `Backup system test ${testResults.overall}`,
        data: testResults,
      });
    } catch (error) {
      logger.error(`Error in backup test: ${error.message}`);
      next(error);
    }
  }
}

export { BackupHealthController };
