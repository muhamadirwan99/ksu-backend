import { ResponseError } from "../utils/response-error.js";
import { logError } from "../application/logging.js";
import jwt from "jsonwebtoken";

const errorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  // Extract user context for logging
  let userContext = {};
  try {
    const authHeader = req.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const secretKey = process.env.JWT_SECRET_KEY;

      if (token && secretKey) {
        const decodedToken = jwt.verify(token, secretKey);
        userContext = {
          username: decodedToken.username,
          userId: decodedToken.userId || decodedToken.id,
        };

        // Add username to error data for response logging
        err.data = err.data || {};
        err.data.username = decodedToken.username;
      }
    }
  } catch (jwtError) {
    // If JWT verification fails, continue without user context
    userContext = { tokenError: jwtError.message };
  }

  // Log the error with full context
  logError("Request error occurred", err, {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    userContext,
    errorData: err.data,
    statusCode: err.statusCode || 500,
    userAgent: req.get("User-Agent"),
    ip: req.ip || req.connection.remoteAddress,
  });

  // Send error response
  const statusCode = err.statusCode || 500;
  const errorResponse = new ResponseError(err.message, err.data).getResponse();

  res.status(statusCode).json(errorResponse).end();
};

export { errorMiddleware };
