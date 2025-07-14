import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () => {
        // Format timestamp dengan timezone WIB
        return new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
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
    winston.format.json() // Format JSON untuk log terstruktur
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
