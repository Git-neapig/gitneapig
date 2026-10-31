import { Injectable } from "@nestjs/common";
import type { AchievementDefinition, AchievementSummary, LessonProgressSummary } from "@gitneapig/shared";
import { PrismaService } from "../database/prisma.service";
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
  constructor(private readonly prisma: PrismaService
  ) {}
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
