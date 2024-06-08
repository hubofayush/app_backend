// extending class from Error

class ApiError extends Error {
    // creating constructor
    constructor(
        // getting message,status code,error,stack[],
        statusCode,
        message = "something went wrong",
        stack = "",
        errors = [],
    ) {
        // ovrriding
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.data = null;
        this.sucsess = false;
        this.message = message;

        // stack error
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };
