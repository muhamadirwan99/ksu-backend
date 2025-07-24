import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

// Determine if running in Docker
const isDocker =
  process.env.NODE_ENV === "production" || process.env.DOCKER_ENV === "true";

// Custom format untuk menambahkan metadata konteks
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: () => {
      // Format timestamp dengan manual offset WIB (+7 jam)
      const now = new Date();
      const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      return wib.toLocaleString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
  }),
  winston.format.errors({ stack: true }), // Include stack trace untuk errors
  winston.format.json()
);

// Console format yang lebih readable untuk development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: () => {
      const now = new Date();
      const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      return wib.toLocaleString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    },
  }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create transports array based on environment
const transports = [];

// Always add file transports (akan di-mount ke host via Docker volume)
transports.push(
  // Rotasi log harian untuk semua level
  new DailyRotateFile({
    filename: path.join("logs", "application-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
    level: "info",
  }),
  // File terpisah untuk error logs
  new DailyRotateFile({
    filename: path.join("logs", "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d", // Keep error logs longer
    zippedArchive: true,
    level: "error",
  })
);

// Console transport configuration
if (isDocker) {
  // Dalam Docker, gunakan stdout/stderr untuk integrasi dengan Docker logs
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
        })
      ),
      level: process.env.LOG_LEVEL || "info",
    })
  );
} else {
  // Untuk development local, gunakan format yang lebih readable
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
      level: "debug",
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Environment-based log level
  format: customFormat,
  defaultMeta: {
    service: "ksu-backend",
    environment: process.env.NODE_ENV || "development",
    container: isDocker ? "docker" : "local",
  },
  transports,
  // Handle uncaught exceptions dan unhandled rejections
  exceptionHandlers: [
    new DailyRotateFile({
      filename: path.join("logs", "exceptions-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      zippedArchive: true,
    }),
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: path.join("logs", "rejections-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "30d",
      zippedArchive: true,
    }),
  ],
});

// Utility function untuk logging dengan context
export const logWithContext = (level, message, meta = {}) => {
  logger.log(level, message, {
    ...meta,
    timestamp: new Date().toISOString(),
    pid: process.pid,
  });
};

// Specific logging functions
export const logInfo = (message, meta = {}) =>
  logWithContext("info", message, meta);
export const logError = (message, error = null, meta = {}) => {
  const errorMeta = error
    ? {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name,
        },
      }
    : {};

  logWithContext("error", message, { ...meta, ...errorMeta });
};
export const logWarn = (message, meta = {}) =>
  logWithContext("warn", message, meta);
export const logDebug = (message, meta = {}) =>
  logWithContext("debug", message, meta);
