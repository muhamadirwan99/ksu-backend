class ResponseSuccess {

    constructor(message = "Success message", data = {}) {
        this.success = true;
        this.data = data;
        this.message = message;
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
