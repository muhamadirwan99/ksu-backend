import { PrismaClient } from "@prisma/client";

// Konfigurasi logger dengan rotasi log

// Konfigurasi Prisma Client dengan event logging
export const prismaClient = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "event", level: "error" },
    { emit: "event", level: "info" },
    { emit: "event", level: "warn" },
  ],
});

// Event Prisma logging dengan logger Winston
// prismaClient.$on("error", (e) => {
//   logger.error({
//     level: "error",
//     message: e.message,
//     stack: e.stack,
//     target: e.target,
//     timestamp: new Date().toISOString(),
//   });
// });
//
// prismaClient.$on("warn", (e) => {
//   logger.warn({
//     level: "warn",
//     message: e.message,
//     target: e.target,
//     timestamp: new Date().toISOString(),
//   });
// });
//
// prismaClient.$on("info", (e) => {
//   logger.info({
//     level: "info",
//     message: e.message,
//     target: e.target,
//     timestamp: new Date().toISOString(),
//   });
// });
//
// prismaClient.$on("query", (e) => {
//   if (e.duration > 2000) {
//     logger.warn({
//       level: "warn",
//       message: `Slow query: ${e.query}`,
//       params: e.params,
//       duration: e.duration,
//       timestamp: new Date().toISOString(),
//     });
//   } else {
//     logger.info({
//       level: "info",
//       message: `Executed query: ${e.query}`,
//       params: e.params,
//       duration: e.duration,
//       timestamp: new Date().toISOString(),
//     });
//   }
// });
