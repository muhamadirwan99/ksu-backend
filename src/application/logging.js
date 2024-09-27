import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.json(), // Format JSON untuk log terstruktur
  ),
  transports: [
    // Rotasi log harian
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log", // Nama file dengan tanggal
      datePattern: "YYYY-MM-DD", // Pola tanggal untuk log baru
      maxSize: "20m", // Maksimal ukuran file log sebelum rotasi
      maxFiles: "14d", // Menyimpan log selama 14 hari sebelum dihapus
      zippedArchive: true, // Mengarsipkan log yang sudah dirotasi
    }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
