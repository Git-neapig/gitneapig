import type { Language } from "./index";
import type { LessonStageType } from "./content";

export type CurrentUser = {
  id: string;
  email: string | null;
  nickname: string;
  avatarUrl: string;
  language: Language;
  xp: number;
  level: number;
  streak: number;
  createdAt: string;
};
export type PublicUserSummary = Pick<
  CurrentUser,
  "id" | "nickname" | "avatarUrl" | "xp" | "level"
> & { onlineStatus?: "ONLINE" | "OFFLINE" };
export type AuthResponse = { user: CurrentUser };
export type SignUpRequest = {
  email: string;
  password: string;
  nickname: string;
  avatarPresetKey?: string;
};
export type LoginRequest = Pick<SignUpRequest, "email" | "password">;
export type CompletionRequest = { contentVersion?: string };
export type CompletionResponse = {
  completed: boolean;
  firstCompletion: boolean;
  xpAwarded: number;
};
export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
};
export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
export type BookmarkTargetType = "LESSON" | "QUEST" | "COMMAND";
export type Bookmark = {
  id: string;
  targetType: BookmarkTargetType;
  targetId: string;
  stage: LessonStageType | null;
  createdAt: string;
};
export type CreateBookmarkRequest = Pick<
  Bookmark,
  "targetType" | "targetId"
> & { stage?: LessonStageType | null };
