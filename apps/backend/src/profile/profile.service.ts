import { Injectable } from "@nestjs/common";
import { Prisma, type User } from "@prisma/client";
import type {
  AchievementDefinition,
  AchievementSummary,
  ActivityItem,
  DailyChallengeDefinition,
  LessonDefinition,
  LessonProgressSummary,
  QuestDefinition,
  UserProfileResponse,
} from "@gitneapig/shared";
import { currentUser } from "../auth/auth.service";
import { PrismaService } from "../database/prisma.service";
import { profileSchema, normalizeIdentity } from "../common/validation";
import { ApiError } from "../common/errors";
import { AvatarStorage } from "./avatar.storage";
export function lessonProgress(
  lesson: { id: string; slug: string },
  progress?: { highestReachedStageIndex: number; completedAt: Date | null },
): LessonProgressSummary {
  const index = progress?.highestReachedStageIndex ?? 0;
  return {
    lessonId: lesson.id,
    slug: lesson.slug,
    highestReachedStageIndex: index as 0 | 1 | 2 | 3 | 4 | 5,
    completed: !!progress?.completedAt,
    progressPercent: progress?.completedAt
      ? 100
      : Math.floor((index / 6) * 100),
    completedAt: progress?.completedAt?.toISOString() ?? null,
  };
}
@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatars: AvatarStorage,
  ) {}
  async profile(user: User): Promise<UserProfileResponse> {
    const [lessons, quests, daily, unlocked] = await Promise.all([
      this.prisma.lesson.findMany({
        orderBy: { order: "asc" },
        include: { progress: { where: { userId: user.id } } },
      }),
      this.prisma.questProgress.findMany({
        where: { userId: user.id, completedAt: { not: null } },
        include: { quest: true },
      }),
      this.prisma.dailyChallengeProgress.findMany({
        where: { userId: user.id },
        orderBy: { completedAt: "desc" },
        take: 10,
        include: { challenge: true },
      }),
      this.prisma.userAchievement.findMany({
        where: { userId: user.id },
        orderBy: { unlockedAt: "desc" },
        include: { achievement: true },
      }),
    ]);
    const progress = lessons.map((l) => lessonProgress(l, l.progress[0]));
    const recentAchievements: AchievementSummary[] = unlocked
      .slice(0, 3)
      .map((row) => {
        const definition = row.achievement
          .content as unknown as AchievementDefinition;
        return {
          achievementId: row.achievementId,
          key: definition.key,
          title: definition.title,
          description: definition.description,
          xpReward: row.achievement.xpReward,
          unlocked: true,
          unlockedAt: row.unlockedAt.toISOString(),
        };
      });
    const activity: ActivityItem[] = [];
    for (const lesson of lessons)
      if (lesson.progress[0]?.completedAt)
        activity.push({
          id: `lesson-${lesson.id}`,
          type: "LESSON_COMPLETED",
          title: (lesson.content as unknown as LessonDefinition).title,
          xpDelta: lesson.xpReward,
          occurredAt: lesson.progress[0].completedAt.toISOString(),
          targetPath: `/learn/${lesson.slug}`,
        });
    for (const row of quests)
      activity.push({
        id: `quest-${row.questId}`,
        type: "QUEST_COMPLETED",
        title: (row.quest.content as unknown as QuestDefinition).title,
        xpDelta: row.quest.xpReward,
        occurredAt: row.completedAt!.toISOString(),
        targetPath: `/quests/${row.quest.slug}`,
      });
    for (const row of daily)
      activity.push({
        id: `daily-${row.challengeId}`,
        type: "DAILY_CHALLENGE_COMPLETED",
        title: (row.challenge.content as unknown as DailyChallengeDefinition)
          .title,
        xpDelta: row.challenge.xpReward,
        occurredAt: row.completedAt.toISOString(),
        targetPath: "/daily-challenge",
      });
    for (const row of unlocked)
      activity.push({
        id: `achievement-${row.achievementId}`,
        type: "ACHIEVEMENT_UNLOCKED",
        title: (row.achievement.content as unknown as AchievementDefinition)
          .title,
        xpDelta: row.achievement.xpReward,
        occurredAt: row.unlockedAt.toISOString(),
        targetPath: "/profile/achievements",
      });
    activity.sort(
      (a, b) =>
        b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id),
    );
    return {
      user: currentUser(user),
      stats: {
        lessonsDone: progress.filter((l) => l.completed).length,
        questsDone: quests.length,
        totalXp: user.xp,
        streak: user.streak,
      },
      lessonProgress: progress,
      recentAchievements,
      recentActivity: activity.slice(0, 10),
    };
  }
  async update(user: User, body: unknown) {
    const input = profileSchema.parse(body);
    let oldAvatar: string | null = null;
    try {
      const result = await this.prisma.serializable(async (tx) => {
        const previous = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
        });
        if (input.nickname) {
          const owner = await tx.user.findUnique({
            where: { normalizedNickname: normalizeIdentity(input.nickname) },
          });
          if (owner && owner.id !== user.id)
            throw new ApiError(
              409,
              "NICKNAME_TAKEN",
              "This nickname is already used.",
              "nickname",
            );
        }
        const updated = await tx.user.update({
          where: { id: user.id },
          data: {
            ...(input.nickname
              ? {
                  nickname: input.nickname,
                  normalizedNickname: normalizeIdentity(input.nickname),
                }
              : {}),
            ...(input.language ? { language: input.language } : {}),
            ...(input.avatarPresetKey
              ? {
                  avatarSource:
                    input.avatarPresetKey === "default" ? "DEFAULT" : "PRESET",
                  avatarPresetKey:
                    input.avatarPresetKey === "default"
                      ? null
                      : input.avatarPresetKey,
                  avatarPath: null,
                }
              : {}),
          },
        });
        return {
          updated,
          old: input.avatarPresetKey ? previous.avatarPath : null,
        };
      });
      oldAvatar = result.old;
      await this.avatars.remove(oldAvatar);
      return { user: currentUser(result.updated) };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ApiError(
          409,
          "NICKNAME_TAKEN",
          "This nickname is already used.",
          "nickname",
        );
      throw error;
    }
  }
  async upload(user: User, file?: Express.Multer.File) {
    if (!file)
      throw new ApiError(400, "VALIDATION_ERROR", "Choose an image.", "avatar");
    const newPath = await this.avatars.save(file);
    let result: { old: string | null; updated: User };
    try {
      result = await this.prisma.serializable(async (tx) => {
        const previous = await tx.user.findUniqueOrThrow({
          where: { id: user.id },
        });
        const updated = await tx.user.update({
          where: { id: user.id },
          data: {
            avatarSource: "CUSTOM",
            avatarPresetKey: null,
            avatarPath: newPath,
          },
        });
        return { updated, old: previous.avatarPath };
      });
    } catch (error) {
      await this.avatars.remove(newPath);
      throw error;
    }
    await this.avatars.remove(result.old);
    return { user: currentUser(result.updated) };
  }
  async achievements(
    userId?: string,
  ): Promise<{ items: AchievementSummary[] }> {
    const rows = await this.prisma.achievement.findMany({
      orderBy: { id: "asc" },
      include: {
        users: {
          where: { userId: userId ?? "00000000-0000-0000-0000-000000000000" },
        },
      },
    });
    return {
      items: rows.map((row) => {
        const definition = row.content as unknown as AchievementDefinition;
        return {
          achievementId: row.id,
          key: row.key,
          title: definition.title,
          description: definition.description,
          xpReward: row.xpReward,
          unlocked: row.users.length > 0,
          unlockedAt: row.users[0]?.unlockedAt.toISOString() ?? null,
        };
      }),
    };
  }
}
