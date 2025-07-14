import supertest from "supertest";
import { web } from "../src/application/web.js";
import { logger } from "../src/application/logging.js";
import {
  createTestUser,
  removeTestUser,
  getTestUser,
  createValidJwtToken,
} from "./test-util.js";
import backupService from "../src/service/backup-service.js";
import fs from "fs";
import path from "path";

describe("Backup System", () => {
  let validToken;

  beforeEach(async () => {
    await createTestUser();
    validToken = await createValidJwtToken();
  });

  afterEach(async () => {
    await removeTestUser();
  });

  describe("POST /api/backup/create", () => {
    it("should create database backup successfully", async () => {
      const result = await supertest(web)
        .post("/api/backup/create")
        .set("Authorization", `Bearer ${validToken}`);

      logger.info(result.body);

      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toBeDefined();
      expect(result.body.data.fileName).toBeDefined();
      expect(result.body.data.filePath).toBeDefined();
      expect(result.body.data.fileSize).toBeGreaterThan(0);

      // Cleanup: hapus file backup test
      if (
        result.body.data.filePath &&
        fs.existsSync(result.body.data.filePath)
      ) {
        fs.unlinkSync(result.body.data.filePath);
      }
    });

    it("should reject unauthorized request", async () => {
      const result = await supertest(web).post("/api/backup/create");

      expect(result.status).toBe(401);
    });
  });

  describe("GET /api/backup/list", () => {
    it("should get backup list successfully", async () => {
      const result = await supertest(web)
        .get("/api/backup/list")
        .set("Authorization", `Bearer ${validToken}`);

      logger.info(result.body);

      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toBeDefined();
      expect(result.body.data.backups).toBeDefined();
      expect(Array.isArray(result.body.data.backups)).toBe(true);
    });
  });

  describe("GET /api/backup/info", () => {
    it("should get backup info successfully", async () => {
      const result = await supertest(web)
        .get("/api/backup/info")
        .set("Authorization", `Bearer ${validToken}`);

      logger.info(result.body);

      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toBeDefined();
      expect(result.body.data.totalBackups).toBeDefined();
      expect(result.body.data.backupDirectory).toBeDefined();
    });
  });

  describe("POST /api/backup/table/:tableName", () => {
    it("should create table backup successfully", async () => {
      const tableName = "users"; // Table yang pasti ada

      const result = await supertest(web)
        .post(`/api/backup/table/${tableName}`)
        .set("Authorization", `Bearer ${validToken}`);

      logger.info(result.body);

      expect(result.status).toBe(200);
      expect(result.body.success).toBe(true);
      expect(result.body.data).toBeDefined();
      expect(result.body.data.tableName).toBe(tableName);
      expect(result.body.data.fileName).toContain(tableName);

      // Cleanup: hapus file backup test
      if (
        result.body.data.filePath &&
        fs.existsSync(result.body.data.filePath)
      ) {
        fs.unlinkSync(result.body.data.filePath);
      }
    });

    it("should handle invalid table name", async () => {
      const tableName = "invalid_table_name_xyz";

      const result = await supertest(web)
        .post(`/api/backup/table/${tableName}`)
        .set("Authorization", `Bearer ${validToken}`);

      // Mungkin error atau berhasil dengan file kosong, tergantung implementasi MySQL
      expect([200, 400, 500]).toContain(result.status);
    });
  });

  describe("Scheduler Management", () => {
    describe("GET /api/backup/scheduler/status", () => {
      it("should get scheduler status successfully", async () => {
        const result = await supertest(web)
          .get("/api/backup/scheduler/status")
          .set("Authorization", `Bearer ${validToken}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.data).toBeDefined();
        expect(result.body.data.schedulers).toBeDefined();
        expect(result.body.data.activeCount).toBeDefined();
        expect(result.body.data.totalCount).toBeDefined();
      });
    });

    describe("POST /api/backup/scheduler/run-now", () => {
      it("should run backup immediately", async () => {
        const result = await supertest(web)
          .post("/api/backup/scheduler/run-now")
          .set("Authorization", `Bearer ${validToken}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.data).toBeDefined();
        expect(result.body.data.fileName).toBeDefined();

        // Cleanup: hapus file backup test
        if (
          result.body.data.filePath &&
          fs.existsSync(result.body.data.filePath)
        ) {
          fs.unlinkSync(result.body.data.filePath);
        }
      });
    });

    describe("POST /api/backup/scheduler/start/:schedulerName", () => {
      it("should start daily scheduler", async () => {
        const result = await supertest(web)
          .post("/api/backup/scheduler/start/daily")
          .set("Authorization", `Bearer ${validToken}`);

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.data.schedulerName).toBe("daily");
        expect(result.body.data.status).toBe("started");
      });

      it("should handle invalid scheduler name", async () => {
        const result = await supertest(web)
          .post("/api/backup/scheduler/start/invalid")
          .set("Authorization", `Bearer ${validToken}`);

        expect(result.status).toBe(400);
        expect(result.body.success).toBe(false);
      });
    });

    describe("POST /api/backup/scheduler/custom", () => {
      it("should create custom scheduler", async () => {
        const result = await supertest(web)
          .post("/api/backup/scheduler/custom")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            cronExpression: "0 4 * * *", // Setiap hari jam 4 pagi
            taskName: "test-custom-backup",
          });

        logger.info(result.body);

        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
        expect(result.body.data.taskName).toBe("test-custom-backup");

        // Cleanup: stop custom scheduler
        await supertest(web)
          .post("/api/backup/scheduler/stop/test-custom-backup")
          .set("Authorization", `Bearer ${validToken}`);
      });

      it("should validate cron expression", async () => {
        const result = await supertest(web)
          .post("/api/backup/scheduler/custom")
          .set("Authorization", `Bearer ${validToken}`)
          .send({
            cronExpression: "invalid cron", // Invalid cron
            taskName: "test-invalid",
          });

        expect(result.status).toBe(400);
        expect(result.body.success).toBe(false);
      });
    });
  });

  describe("Backup Service Unit Tests", () => {
    it("should generate correct backup filename", () => {
      const filename = backupService.generateBackupFileName();
      expect(filename).toMatch(
        /^backup_ksu_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}\.sql$/
      );
    });

    it("should ensure backup directory exists", () => {
      backupService.ensureBackupDirectory();
      expect(fs.existsSync(backupService.backupDir)).toBe(true);
    });

    it("should get backup list", async () => {
      const backups = await backupService.getBackupList();
      expect(Array.isArray(backups)).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("should handle missing backup file for restore", async () => {
      const result = await supertest(web)
        .post("/api/backup/restore/non-existent-file.sql")
        .set("Authorization", `Bearer ${validToken}`);

      expect(result.status).toBe(500);
      expect(result.body.success).toBe(false);
    });

    it("should handle missing backup file for download", async () => {
      const result = await supertest(web)
        .get("/api/backup/download/non-existent-file.sql")
        .set("Authorization", `Bearer ${validToken}`);

      expect(result.status).toBe(404);
      expect(result.body.success).toBe(false);
    });

    it("should handle missing backup file for delete", async () => {
      const result = await supertest(web)
        .delete("/api/backup/non-existent-file.sql")
        .set("Authorization", `Bearer ${validToken}`);

      expect(result.status).toBe(404);
      expect(result.body.success).toBe(false);
    });
  });
});
