import rateLimit from "express-rate-limit";

/**
 * Throttles credential endpoints (login / register / google) to slow down
 * brute-force and credential-stuffing attempts.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});
