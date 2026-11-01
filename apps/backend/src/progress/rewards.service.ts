import { Injectable } from "@nestjs/common";
import type { AchievementRule, CompletionResponse, QuestDefinition } from "@gitneapig/shared";
import { z } from "zod";
import { PrismaService } from "../database/prisma.service";
import { ApiError } from "../common/errors";
import { completionSchema } from "../common/validation";
export function seoulDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}
export function nextStreak(
  previous: { streak: number; streakLastActivityDateKey: string | null },
  today: string,
): number {
  if (previous.streakLastActivityDateKey === today) return previous.streak;
  const yesterday = seoulDateKey(
    new Date(new Date(`${today}T00:00:00+09:00`).getTime() - 86_400_000),
  );
  return previous.streakLastActivityDateKey === yesterday
    ? previous.streak + 1
    : 1;
}
@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}
  async complete(
    userId: string,
    kind: "LESSON" | "QUEST",
    rawId: string,
    body: unknown,
  ): Promise<CompletionResponse> {
    completionSchema.parse(body ?? {});
    const id =
        z.string().min(1).max(100).parse(rawId),
      now = new Date(),
      dateKey = seoulDateKey(now);
    return this.prisma.serializable(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      let reward: number;
      if (kind === "LESSON") {
        const lesson = await tx.lesson.findUnique({ where: { id } });
        if (!lesson)
          throw new ApiError(
            404,
            "LESSON_NOT_FOUND",
            "The lesson was not found.",
          );
        const previous = await tx.lessonProgress.findUnique({
          where: { userId_lessonId: { userId, lessonId: id } },
        });
        if (previous?.completedAt && previous.xpAwarded)
          return { completed: true, firstCompletion: false, xpAwarded: 0 };
        await tx.lessonProgress.upsert({
          where: { userId_lessonId: { userId, lessonId: id } },
          create: {
            userId,
            lessonId: id,
            highestReachedStageIndex: 5,
            completedAt: now,
            xpAwarded: true,
          },
          update: {
            highestReachedStageIndex: 5,
            completedAt: previous?.completedAt ?? now,
            xpAwarded: true,
          },
        });
        reward = lesson.xpReward;
      } else {
        const quest = await tx.quest.findUnique({ where: { id } });
        if (!quest)
          throw new ApiError(
            404,
            "QUEST_NOT_FOUND",
            "The quest was not found.",
          );
        const previous = await tx.questProgress.findUnique({
          where: { userId_questId: { userId, questId: id } },
        });
        if (previous?.completedAt && previous.xpAwarded)
          return { completed: true, firstCompletion: false, xpAwarded: 0 };
        const prerequisite = (quest.content as unknown as QuestDefinition)
          .unlockRule.prerequisiteQuestId;
        if (
          prerequisite &&
          !(
            await tx.questProgress.findUnique({
              where: { userId_questId: { userId, questId: prerequisite } },
            })
          )?.completedAt
        )
          throw new ApiError(
            403,
            "QUEST_LOCKED",
            "Complete the preceding quest first.",
          );
        await tx.questProgress.upsert({
          where: { userId_questId: { userId, questId: id } },
          create: { userId, questId: id, completedAt: now, xpAwarded: true },
          update: {
            completedAt: previous?.completedAt ?? now,
            xpAwarded: true,
          },
        });
        reward = quest.xpReward;
      }
      const streak = nextStreak(user, dateKey);
      const [lessonCount, questCount, dailyCount, achievements, unlocked] =
        await Promise.all([
          tx.lessonProgress.count({
            where: { userId, completedAt: { not: null } },
          }),
          tx.questProgress.count({
            where: { userId, completedAt: { not: null } },
          }),
          tx.dailyChallengeProgress.count({ where: { userId } }),
          tx.achievement.findMany(),
          tx.userAchievement.findMany({ where: { userId } }),
        ]);
      let achievementXp = 0;
      for (const achievement of achievements) {
        if (unlocked.some((row) => row.achievementId === achievement.id))
          continue;
        const rule = achievement.rule as unknown as AchievementRule;
        const qualifies =
          rule.type === "LESSON_COMPLETION_COUNT"
            ? lessonCount >= rule.count
            : rule.type === "QUEST_COMPLETION_COUNT"
              ? questCount >= rule.count
              : rule.type === "DAILY_COMPLETION_COUNT"
                ? dailyCount >= rule.count
                : rule.type === "STREAK_AT_LEAST" && streak >= rule.days;
        if (!qualifies) continue;
        await tx.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            unlockedAt: now,
            xpAwarded: true,
          },
        });
        achievementXp += achievement.xpReward;
      }
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: reward + achievementXp },
          streak,
          streakLastActivityDateKey: dateKey,
        },
      });
      return { completed: true, firstCompletion: true, xpAwarded: reward };
    });
  }
}
