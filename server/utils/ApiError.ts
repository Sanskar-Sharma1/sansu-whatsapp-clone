/**
 * Operational error with an HTTP status code. Services throw these; the global
 * error handler turns them into `{ error }` responses with the right status.
 * Anything that is NOT an ApiError is treated as an unexpected 500.
 */
export class ApiError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}
