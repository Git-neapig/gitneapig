import type { Language, LocalizedText } from "./index";
import type { LessonProgressSummary, AchievementSummary, LessonStageType } from "./content";

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
export type UpdateProfileRequest = {
  nickname?: string;
  language?: Language;
  avatarPresetKey?: string;
};
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
export type FriendRequest = {
  id: string;
  sender: PublicUserSummary;
  receiver: PublicUserSummary;
  status: "PENDING" | "ACCEPTED";
  createdAt: string;
};
export type ActivityItem = {
  id: string;
  type:
    | "LESSON_COMPLETED"
    | "QUEST_COMPLETED"
    | "DAILY_CHALLENGE_COMPLETED"
    | "ACHIEVEMENT_UNLOCKED";
  title: LocalizedText;
  xpDelta?: number;
  occurredAt: string;
  targetPath?: string;
};
export type UserProfileResponse = {
  user: CurrentUser;
  stats: {
    lessonsDone: number;
    questsDone: number;
    totalXp: number;
    streak: number;
  };
  lessonProgress: LessonProgressSummary[];
  recentAchievements: AchievementSummary[];
  recentActivity: ActivityItem[];
};
