class ApiError extends Error {
  constructor({
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
  }) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSONResponse() {
    return {
      success: false,
      status: this.statusCode,
      message: this.message,
      errors: this.errors,
    };
  }
}

export default ApiError;
