import { Injectable } from "@nestjs/common";
import { Prisma, type Bookmark } from "@prisma/client";
import { z } from "zod";
import { PrismaService } from "../database/prisma.service";
import { ApiError } from "../common/errors";
import { bookmarkSchema, paginationSchema } from "../common/validation";
const project = ({ id, targetType, targetId, stage, createdAt }: Bookmark) => ({
  id,
  targetType,
  targetId,
  stage: stage || null,
  createdAt: createdAt.toISOString(),
});
@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}
  private async target(
    tx: Prisma.TransactionClient,
    type: string,
    id: string,
  ): Promise<void> {
    const target =
      type === "LESSON"
        ? await tx.lesson.findUnique({ where: { id } })
        : type === "QUEST"
          ? await tx.quest.findUnique({ where: { id } })
          : await tx.commandReference.findUnique({ where: { id } });
    if (!target)
      throw new ApiError(
        404,
        "BOOKMARK_TARGET_NOT_FOUND",
        "The bookmark target was not found.",
      );
  }
  async list(userId: string, query: unknown) {
    const { page, pageSize, targetType } = paginationSchema
        .extend({
          targetType: z.enum(["LESSON", "QUEST", "COMMAND"]).optional(),
        })
        .parse(query),
      where = { userId, ...(targetType ? { targetType } : {}) },
      [items, totalItems] = await this.prisma.$transaction([
        this.prisma.bookmark.findMany({
          where,
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        this.prisma.bookmark.count({ where }),
      ]);
    return {
      items: items.map(project),
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }
  async get(userId: string, rawId: string) {
    const id = z.uuid().parse(rawId),
      item = await this.prisma.bookmark.findFirst({ where: { id, userId } });
    if (!item)
      throw new ApiError(
        404,
        "BOOKMARK_NOT_FOUND",
        "The bookmark was not found.",
      );
    return project(item);
  }
  async save(userId: string, body: unknown, rawId?: string) {
    const input = bookmarkSchema.parse(body),
      id = rawId ? z.uuid().parse(rawId) : undefined;
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (id && !(await tx.bookmark.findFirst({ where: { id, userId } })))
          throw new ApiError(
            404,
            "BOOKMARK_NOT_FOUND",
            "The bookmark was not found.",
          );
        await this.target(tx, input.targetType, input.targetId);
        return project(
          id
            ? await tx.bookmark.update({ where: { id, userId }, data: input })
            : await tx.bookmark.create({ data: { userId, ...input } }),
        );
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      )
        throw new ApiError(
          409,
          "BOOKMARK_ALREADY_EXISTS",
          "This target is already bookmarked.",
        );
      throw error;
    }
  }
  async delete(userId: string, rawId: string): Promise<void> {
    const id = z.uuid().parse(rawId),
      result = await this.prisma.bookmark.deleteMany({ where: { id, userId } });
    if (!result.count)
      throw new ApiError(
        404,
        "BOOKMARK_NOT_FOUND",
        "The bookmark was not found.",
      );
  }
}
