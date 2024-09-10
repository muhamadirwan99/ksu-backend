import {logResponse} from "../service/log-service.js";

class ResponseSuccess {

    constructor(message = "Success message", data = {}) {
        this.success = true;
        this.data = data;
        this.message = message;

        logResponse(this.success, this.message, this.data).catch(err => {
            console.error("Error logging response:", err);
        });
    }

    getResponse() {
        return {
            success: this.success,
            data: this.data,
            message: this.message
        };
    }
}

export { ResponseSuccess };
