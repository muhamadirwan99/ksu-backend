import { logResponse } from "../service/log-service.js";
import { logWarn } from "../application/logging.js";

class ResponseSuccess {
  constructor(message = "Success message", data = {}) {
    this.success = true;
    this.data = data;
    this.message = message;

    // Log to database asynchronously (only if enabled)
    if (process.env.ENABLE_DATABASE_LOGGING !== "false") {
      logResponse(this.success, this.message, this.data).catch((err) => {
        logWarn("Failed to log success response to database", {
          originalMessage: this.message,
          logError: err.message,
          stack: err.stack,
        });
      });
    }
  }

  getResponse() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
    };
  }
}

export { ResponseSuccess };
