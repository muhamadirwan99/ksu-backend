import { logResponse } from "../service/log-service.js";
import { logWarn } from "../application/logging.js";

class ResponseError extends Error {
  constructor(message = "Error message", data = {}, statusCode = 400) {
    super(message);
    this.success = false;
    this.data = data;
    this.statusCode = statusCode;

    // Log to database asynchronously (don't wait for it)
    logResponse(this.success, this.message, this.data).catch((err) => {
      logWarn("Failed to log response to database", {
        originalError: this.message,
        logError: err.message,
        stack: err.stack,
      });
    });
  }

  getResponse() {
    const { username, ...dataWithoutUsername } = this.data;

    return {
      success: this.success,
      data: dataWithoutUsername,
      message: this.message,
    };
  }
}

export { ResponseError };
