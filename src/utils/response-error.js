import { logResponse } from "../service/log-service.js";

class ResponseError extends Error {
  constructor(message = "Error message", data = {}) {
    super(message);
    this.success = false;
    this.data = data;

    logResponse(this.success, this.message, this.data).catch((err) => {
      console.error("Error logging response:", err);
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
