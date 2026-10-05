import type { Language } from "./index";

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
