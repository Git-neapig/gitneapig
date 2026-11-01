import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  referenceRegistry,
  type DailyChallengeTemplate,
  type DailyChallengeDefinition,
  type LessonDefinition,
  type QuestDefinition,
  type CommandReferenceDefinition,
} from "@gitneapig/shared";
import { referenceOptions } from "./reference-options";
import { dailyTemplates } from "./daily";
import { PrismaService } from "../database/prisma.service";
import { ApiError } from "../common/errors";
import { paginationSchema } from "../common/validation";
import { lessonProgress } from "../profile/profile.service";
import { seoulDateKey } from "../progress/rewards.service";
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
  async quests(userId?: string) {
    const rows = await this.prisma.quest.findMany({
      orderBy: { order: "asc" },
      include: {
        progress: {
          where: { userId: userId ?? "00000000-0000-0000-0000-000000000000" },
        },
      },
    });
    const completed = new Set(
      rows.filter((r) => r.progress[0]?.completedAt).map((r) => r.id),
    );
    return {
      items: rows.map((row) => {
        const definition = row.content as unknown as QuestDefinition;
        return {
          id: row.id,
          slug: row.slug,
          order: row.order,
          title: definition.title,
          summary: definition.summary,
          xpReward: row.xpReward,
          unlockRule: definition.unlockRule,
          completed: completed.has(row.id),
          available:
            !definition.unlockRule.prerequisiteQuestId ||
            completed.has(definition.unlockRule.prerequisiteQuestId),
        };
      }),
    };
  }
  async quest(slug: string, userId?: string) {
    const row = await this.prisma.quest.findUnique({ where: { slug } });
    if (!row)
      throw new ApiError(404, "QUEST_NOT_FOUND", "The quest was not found.");
    const definition = row.content as unknown as QuestDefinition,
      prerequisite = definition.unlockRule.prerequisiteQuestId;
    if (
      userId &&
      prerequisite &&
      !(
        await this.prisma.questProgress.findUnique({
          where: { userId_questId: { userId, questId: prerequisite } },
        })
      )?.completedAt
    )
      throw new ApiError(
        403,
        "QUEST_LOCKED",
        "Complete the preceding quest first.",
      );
    return definition;
  }
  async today(): Promise<DailyChallengeDefinition> {
    const dateKey = seoulDateKey();
    let row = await this.prisma.dailyChallenge.findUnique({
      where: { dateKey },
    });
    if (!row) {
      const templates = await this.prisma.dailyChallengeTemplate.findMany({
        where: { active: true },
        orderBy: { templateKey: "asc" },
      });
      if (!templates.length)
        throw new ApiError(
          503,
          "CONTENT_UNAVAILABLE",
          "Daily challenges are not seeded.",
        );
      const selected =
        templates[
          createHash("sha256").update(dateKey).digest().readUInt32BE(0) %
            templates.length
        ];
      const {
        title,
        description,
        difficulty,
        topic,
        initialState,
        successConditions,
        hints,
        xpReward,
      } = selected.content as unknown as DailyChallengeTemplate;
      const definition = {
        title,
        description,
        difficulty,
        topic,
        initialState,
        successConditions,
        hints,
        xpReward,
      };
      try {
        row = await this.prisma.dailyChallenge.create({
          data: {
            dateKey,
            xpReward: selected.xpReward,
            content: definition as unknown as Prisma.InputJsonValue,
          },
        });
      } catch (error) {
        if (
          !(error instanceof Prisma.PrismaClientKnownRequestError) ||
          error.code !== "P2002"
        )
          throw error;
        row = await this.prisma.dailyChallenge.findUniqueOrThrow({
          where: { dateKey },
        });
      }
    }
    const snapshot = row.content as unknown as Omit<
      DailyChallengeDefinition,
      "id" | "dateKey"
    >;
    const currentTemplate = dailyTemplates.find(
      (template) =>
        template.title.en === snapshot.title.en &&
        template.topic.en === snapshot.topic.en,
    );
    return {
      ...snapshot,
      hints: currentTemplate?.hints ?? snapshot.hints,
      id: row.id,
      dateKey: row.dateKey,
      xpReward: row.xpReward,
    };
  }
  async dailyProgress(userId: string, challengeId: string) {
    const challenge = await this.prisma.dailyChallenge.findUnique({
      where: { id: z.uuid().parse(challengeId) },
    });
    if (!challenge)
      throw new ApiError(
        404,
        "CHALLENGE_NOT_FOUND",
        "The challenge was not found.",
      );
    const progress = await this.prisma.dailyChallengeProgress.findUnique({
      where: {
        userId_challengeId_dateKey: {
          userId,
          challengeId,
          dateKey: challenge.dateKey,
        },
      },
    });
    return {
      challengeId,
      dateKey: challenge.dateKey,
      completed: !!progress,
      completedAt: progress?.completedAt.toISOString() ?? null,
    };
  }
  async reference(query: unknown) {
    const input = paginationSchema
      .extend({
        q: z.string().trim().max(100).default(""),
        category: z
          .enum([
            "SETUP",
            "INSPECT",
            "STAGE",
            "COMMIT",
            "BRANCH",
            "MERGE",
            "REMOTE",
          ])
          .optional(),
        difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
        sort: z
          .enum(["NAME_ASC", "NAME_DESC", "DIFFICULTY_ASC", "DIFFICULTY_DESC"])
          .default("NAME_ASC"),
      })
      .parse(query);
    const rows = await this.prisma.commandReference.findMany();
    const rank = { BEGINNER: 0, INTERMEDIATE: 1, ADVANCED: 2 };
    const items = rows
      .flatMap((row) => {
        const core = referenceRegistry.find((command) => command.key === row.key);
        if (!core) return [];
        return [{ ...core, id: row.id, difficulty: row.difficulty as keyof typeof rank,
          searchContent: JSON.stringify([row.whenToUse, (referenceOptions[core.key] ?? []), core.syntax]),
        }];
      })
      .filter(
        (item) =>
          (!input.category || item.category === input.category) &&
          (!input.difficulty || item.difficulty === input.difficulty) &&
          `${item.name} ${Object.values(item.shortDescription).join(" ")} ${item.searchContent}`
            .toLowerCase()
            .includes(input.q.toLowerCase()),
      );
    items.sort((a, b) => {
      const comparison = input.sort.startsWith("DIFFICULTY")
        ? rank[a.difficulty] - rank[b.difficulty] ||
          a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name);
      return input.sort.endsWith("DESC") ? -comparison : comparison;
    });
    return {
      items: items
        .slice((input.page - 1) * input.pageSize, input.page * input.pageSize)
        .map(({ shortExample: _shortExample, searchContent: _searchContent, ...item }) => item),
      page: input.page,
      pageSize: input.pageSize,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / input.pageSize),
    };
  }
  async referenceDetail(key: string) {
    const core = referenceRegistry.find((c) => c.key === key),
      row = await this.prisma.commandReference.findUnique({ where: { key } });
    if (!core || !row)
      throw new ApiError(
        404,
        "COMMAND_NOT_FOUND",
        "The command was not found.",
      );
    return { core, reference: row as unknown as CommandReferenceDefinition, options: (referenceOptions[core.key] ?? []) };
  }
}
