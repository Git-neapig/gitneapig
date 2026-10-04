import { z } from "zod";

const configuration = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ORIGIN: z.url().default("http://127.0.0.1:5173"),
  APP_TIME_ZONE: z.literal("Asia/Seoul").default("Asia/Seoul"),
  BACKEND_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().startsWith("postgresql://"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.literal("8h").default("8h"),
  API_KEY_HMAC_SECRET: z.string().min(32),
  OAUTH_42_CLIENT_ID: z.string().optional(),
  OAUTH_42_CLIENT_SECRET: z.string().optional(),
  OAUTH_42_REDIRECT_URI: z.url().optional(),
  AVATAR_UPLOAD_DIR: z.string().default("/app/uploads/avatars"),
  AVATAR_MAX_SIZE_MB: z.coerce.number().positive().max(2).default(2),
  PUBLIC_API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(60),
  PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(60),
  ONLINE_STATUS_THRESHOLD_SECONDS: z.coerce
    .number()
    .int()
    .positive()
    .default(120),
});
export type Configuration = z.infer<typeof configuration>;
export function parseConfiguration(
  env: Record<string, string | undefined>,
): Configuration {
  const parsed = configuration.safeParse(env);
  if (!parsed.success)
    throw new Error(
      `Invalid environment fields: ${parsed.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  const result = parsed.data;
  if (
    result.NODE_ENV === "production" &&
    [result.JWT_SECRET, result.API_KEY_HMAC_SECRET].some((secret) =>
      /local-development|change.?me|replace|example/i.test(secret),
    )
  )
    throw new Error("Production secrets must not use example values");
  const origin = new URL(result.APP_ORIGIN);
  if (
    origin.origin !== result.APP_ORIGIN ||
    (result.NODE_ENV === "production" && origin.protocol !== "https:")
  )
    throw new Error(
      "APP_ORIGIN must be an exact origin; production requires HTTPS",
    );
  return result;
}
