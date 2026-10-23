import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { type LessonDefinition } from "@gitneapig/shared";
import { PrismaService } from "../database/prisma.service";
import { ApiError } from "../common/errors";
import { lessonProgress } from "../profile/profile.service";
@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}
  async lessons(userId?: string) {
    const rows = await this.prisma.lesson.findMany({
      orderBy: { order: "asc" },
      include: {
        progress: {
          where: { userId: userId ?? "00000000-0000-0000-0000-000000000000" },
        },
      },
    });
    return {
      items: rows.map((row) => {
        const {
          id,
          slug,
          order,
          title,
          summary,
          difficulty,
          guestAccessible,
          xpReward,
        } = row.content as unknown as LessonDefinition;
        return {
          id,
          slug,
          order,
          title,
          summary,
          difficulty,
          guestAccessible,
          xpReward,
          ...(userId ? { progress: lessonProgress(row, row.progress[0]) } : {}),
        };
      }),
    };
  }
  async lesson(slug: string, userId?: string) {
    const row = await this.prisma.lesson.findUnique({ where: { slug } });
    if (!row)
      throw new ApiError(404, "LESSON_NOT_FOUND", "The lesson was not found.");
    if (!row.guestAccessible && !userId)
      throw new ApiError(
        401,
        "AUTH_REQUIRED",
        "Sign in to access this lesson.",
      );
    return row.content as unknown as LessonDefinition;
  }
  async progress(userId: string, id: string, body: unknown) {
    const { highestReachedStageIndex } = z
      .object({ highestReachedStageIndex: z.number().int().min(0).max(5) })
      .strict()
      .parse(body);
    return this.prisma.serializable(async (tx) => {
      const lesson = await tx.lesson.findUnique({ where: { id } });
      if (!lesson)
        throw new ApiError(
          404,
          "LESSON_NOT_FOUND",
          "The lesson was not found.",
        );
      const existing = await tx.lessonProgress.findUnique({
        where: { userId_lessonId: { userId, lessonId: id } },
      });
      const progress = await tx.lessonProgress.upsert({
        where: { userId_lessonId: { userId, lessonId: id } },
        create: { userId, lessonId: id, highestReachedStageIndex },
        update: {
          highestReachedStageIndex: Math.max(
            highestReachedStageIndex,
            existing?.highestReachedStageIndex ?? 0,
          ),
        },
      });
      return lessonProgress(lesson, progress);
    });
  }
}
