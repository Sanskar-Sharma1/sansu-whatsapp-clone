import { Types } from "mongoose";
import { ApiError } from "./ApiError";

/**
 * Validates a Mongo ObjectId string up front so a malformed id returns a clean
 * 400 instead of letting Mongoose throw a CastError that surfaces as a 500.
 */
export function assertObjectId(id: unknown, label = "id"): string {
  if (typeof id !== "string" || !Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return id;
}
