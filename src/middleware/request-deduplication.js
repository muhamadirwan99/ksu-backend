import { ResponseError } from "../utils/response-error.js";
import { logger } from "../application/logging.js";

// Simple in-memory cache untuk request deduplication
// Dalam production, sebaiknya gunakan Redis
const activeRequests = new Map();

const requestDeduplication = (req, res, next) => {
  // Generate request key berdasarkan method, path, dan body
  const requestKey = `${req.method}:${req.path}:${JSON.stringify(req.body)}`;

  // Check apakah request yang sama sedang diproses
  if (activeRequests.has(requestKey)) {
    logger.warn(`Duplicate request detected: ${requestKey}`);
    throw new ResponseError("Request sedang diproses, silakan tunggu", 409);
  }

  // Tandai request sebagai sedang diproses
  activeRequests.set(requestKey, Date.now());

  // Set timeout untuk auto-cleanup (5 menit)
  const timeout = setTimeout(
    () => {
      activeRequests.delete(requestKey);
    },
    5 * 60 * 1000
  );

  // Override res.end untuk cleanup ketika response selesai
  const originalEnd = res.end;
  res.end = function (...args) {
    // Cleanup request dari cache
    activeRequests.delete(requestKey);
    clearTimeout(timeout);

    // Call original end function
    originalEnd.apply(this, args);
  };

  next();
};

// Cleanup periodic untuk request yang sudah lama (safety measure)
setInterval(
  () => {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 menit

    for (const [key, timestamp] of activeRequests.entries()) {
      if (now - timestamp > maxAge) {
        activeRequests.delete(key);
        logger.warn(`Cleaning up stale request: ${key}`);
      }
    }
  },
  5 * 60 * 1000
); // Check setiap 5 menit

export { requestDeduplication };
