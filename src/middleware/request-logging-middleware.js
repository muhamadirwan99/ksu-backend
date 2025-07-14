import { logInfo } from "../application/logging.js";
import { nanoid } from "nanoid";

// Middleware untuk menambahkan request context ke logging
export const requestLoggingMiddleware = (req, res, next) => {
  // Generate unique request ID
  req.requestId = nanoid(10);

  // Start time untuk measuring response time
  req.startTime = Date.now();

  // Log incoming request
  logInfo("Incoming request", {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress,
    headers: {
      authorization: req.get("Authorization") ? "Bearer [REDACTED]" : undefined,
      "content-type": req.get("Content-Type"),
      "x-forwarded-for": req.get("X-Forwarded-For"),
    },
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (data) {
    const responseTime = Date.now() - req.startTime;

    // Log response (without sensitive data)
    logInfo("Outgoing response", {
      requestId: req.requestId,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      success: data?.success || false,
      message: data?.message || "Response sent",
    });

    return originalJson.call(this, data);
  };

  next();
};

// Middleware untuk menambahkan user context dari JWT
export const userContextMiddleware = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      if (token) {
        // Note: Actual JWT verification should be done in auth middleware
        // This is just for adding context to logs
        req.userContext = {
          hasToken: true,
          tokenLength: token.length,
        };
      }
    }
  } catch (error) {
    // Don't fail the request if user context extraction fails
    req.userContext = { hasToken: false };
  }

  next();
};
