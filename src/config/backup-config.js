// Konfigurasi untuk sistem backup database
export const BACKUP_CONFIG = {
  // Direktori untuk menyimpan file backup
  BACKUP_DIRECTORY: "backup",

  // Retention policy (dalam hari)
  RETENTION: {
    DAILY_CLEANUP: 30, // Hapus backup harian setelah 30 hari
    WEEKLY_CLEANUP: 90, // Hapus backup mingguan setelah 90 hari
    MONTHLY_CLEANUP: 365, // Hapus backup bulanan setelah 1 tahun
  },

  // Jadwal backup (cron expressions)
  SCHEDULE: {
    DAILY: "0 2 * * *", // Setiap hari jam 02:00 WIB
    WEEKLY: "0 1 * * 0", // Setiap Minggu jam 01:00 WIB
    MONTHLY: "0 1 1 * *", // Tanggal 1 setiap bulan jam 01:00 WIB
    CLEANUP: "0 3 * * 1", // Setiap Senin jam 03:00 WIB
  },

  // Timezone untuk scheduler
  TIMEZONE: "Asia/Jakarta",

  // Format nama file
  FILE_FORMAT: {
    FULL_BACKUP: "backup_ksu_{timestamp}.sql",
    TABLE_BACKUP: "backup_{tableName}_{timestamp}.sql",
    TIMESTAMP_FORMAT: "YYYY-MM-DD_HH-MM-SS",
  },

  // Maksimum ukuran file backup (dalam bytes)
  MAX_BACKUP_SIZE: 1024 * 1024 * 1024, // 1GB

  // Kompression (future feature)
  COMPRESSION: {
    ENABLED: false,
    TYPE: "gzip", // gzip, bzip2
    LEVEL: 6, // 1-9
  },

  // Database specific settings
  DATABASE: {
    // Timeout untuk operasi backup/restore (dalam milidetik)
    TIMEOUT: 30 * 60 * 1000, // 30 menit

    // Option tambahan untuk mysqldump
    MYSQLDUMP_OPTIONS: [
      "--single-transaction",
      "--routines",
      "--triggers",
      "--add-drop-database",
      "--complete-insert",
      "--extended-insert",
    ],

    // Option untuk mysql restore
    MYSQL_OPTIONS: ["--default-character-set=utf8mb4"],
  },

  // Notifikasi (future feature)
  NOTIFICATION: {
    ENABLED: false,
    EMAIL: {
      ON_SUCCESS: false,
      ON_FAILURE: true,
      RECIPIENTS: [],
    },
    WEBHOOK: {
      ENABLED: false,
      URL: "",
    },
  },

  // Logging
  LOGGING: {
    LOG_QUERIES: false,
    LOG_FILE_OPERATIONS: true,
    LOG_SCHEDULER: true,
  },

  // Security
  SECURITY: {
    // Enkripsi file backup (future feature)
    ENCRYPTION: {
      ENABLED: false,
      ALGORITHM: "aes-256-gcm",
    },

    // Validasi file
    VALIDATE_BACKUP: true,

    // Permission file backup
    FILE_PERMISSIONS: 0o600, // Read/write owner only
  },
};

// Helper functions untuk konfigurasi
export const getBackupFileName = (type = "full", tableName = null) => {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .split(".")[0];

  if (type === "table" && tableName) {
    return `backup_${tableName}_${timestamp}.sql`;
  }

  return `backup_ksu_${timestamp}.sql`;
};

export const getMysqldumpCommand = (config, outputFile) => {
  const options = BACKUP_CONFIG.DATABASE.MYSQLDUMP_OPTIONS.join(" ");
  return `mysqldump -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} ${options} ${config.database} > "${outputFile}"`;
};

export const getMysqlRestoreCommand = (config, inputFile) => {
  const options = BACKUP_CONFIG.DATABASE.MYSQL_OPTIONS.join(" ");
  return `mysql -h ${config.host} -P ${config.port} -u ${config.username} -p${config.password} ${options} ${config.database} < "${inputFile}"`;
};

export default BACKUP_CONFIG;
