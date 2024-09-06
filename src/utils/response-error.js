class ResponseError extends Error {

    constructor(message = "Error message", data = {}) {
        super(message);
        this.success = false;
        this.data = data;
    }

    getResponse() {
        return {
            success: this.success,
            data: this.data,
            message: this.message
        };
    }
}

export { ResponseError };