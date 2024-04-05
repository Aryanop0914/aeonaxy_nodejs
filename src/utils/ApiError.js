class ApiError extends Error {
  constructor(statusCode, error_message = "Something went wrong") {
    super(error_message);
    this.statusCode = statusCode;
    this.error_message = error_message;
    this.success = false;
  }
}

module.exports = { ApiError };
