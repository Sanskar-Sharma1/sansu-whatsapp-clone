import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async controller so a rejected promise is forwarded to Express's
 * error handler via `next(err)` instead of becoming an unhandled rejection.
 * Lets controllers `throw` (e.g. ApiError) and stay free of try/catch.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => unknown
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
