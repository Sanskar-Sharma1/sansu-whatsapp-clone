import "dotenv/config";
import { z } from "zod";

/**
 * Single source of truth for environment configuration. Validated once at boot
 * with zod — a missing or malformed secret fails fast (process exits) instead
 * of letting the server run with insecure defaults.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGO_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/whatsapp_clone"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  CLIENT_URL: z.string().min(1).default("http://localhost:5173"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  console.error(`❌ Invalid environment configuration:\n${details}`);
  process.exit(1);
}

const data = parsed.data;

const INSECURE_DEFAULT_SECRET = "supersecret_change_in_production";
if (data.NODE_ENV === "production" && data.JWT_SECRET === INSECURE_DEFAULT_SECRET) {
  console.error("❌ JWT_SECRET is the insecure default in production. Set a strong, unique secret.");
  process.exit(1);
}

export const env = {
  ...data,
  isProduction: data.NODE_ENV === "production",
} as const;
