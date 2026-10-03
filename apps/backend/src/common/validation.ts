import { z } from "zod";
import { lessonStageTypes } from "@gitneapig/shared";
export const nicknameSchema = z
  .string()
  .trim()
  .min(3)
  .max(20)
  .refine(
    (value) =>
      ![...value].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127),
  );
export const emailSchema = z.string().trim().max(254).email();
export const passwordSchema = z.string().min(8).max(128);
export const languageSchema = z.enum(["ko", "en", "ja"]);
export const avatarPresetSchema = z.enum([
  "primary",
  "cream",
  "grey-white",
  "orange-black",
]);
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    nickname: nicknameSchema,
    avatarPresetKey: avatarPresetSchema.optional(),
  })
  .strict();
export const loginSchema = z
  .object({ email: emailSchema, password: passwordSchema })
  .strict();
export const profileSchema = z
  .object({
    nickname: nicknameSchema.optional(),
    language: languageSchema.optional(),
    avatarPresetKey: z
      .union([avatarPresetSchema, z.literal("default")])
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);
export const completionSchema = z
  .object({ contentVersion: z.string().min(1).max(100).optional() })
  .strict();
export const bookmarkSchema = z
  .object({
    targetType: z.enum(["LESSON", "QUEST", "COMMAND"]),
    targetId: z.string().min(1).max(100),
    stage: z.enum(lessonStageTypes).nullable().optional(),
  })
  .strict()
  .refine((value) => value.targetType === "LESSON" || value.stage == null, {
    message: "Stages are only valid for lessons",
    path: ["stage"],
  })
  .transform((value) => ({
    ...value,
    stage: value.targetType === "LESSON" ? (value.stage ?? "SITUATION") : "",
  }));
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(12),
});
export const normalizeIdentity = (value: string): string =>
  value.trim().toLowerCase();
export function safeReturnTo(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    [...value].some((c) => c.charCodeAt(0) < 32)
  )
    return "/";
  try {
    const decoded = decodeURIComponent(value);
    if (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      [...decoded].some((c) => c.charCodeAt(0) < 32)
    )
      return "/";
    const parsed = new URL(value, "https://gitneapig.invalid");
    if (
      parsed.origin !== "https://gitneapig.invalid" ||
      parsed.pathname.startsWith("/api/")
    )
      return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}
