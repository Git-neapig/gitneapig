import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";
import { PrismaService } from "../database/prisma.service";
import { ApiError } from "../common/errors";
import { publicUser } from "../auth/auth.service";
import { paginationSchema } from "../common/validation";
import type { Configuration } from "../config";
@Injectable()
export class FriendsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject("CONFIG") private readonly config: Configuration,
  ) {}
  async list(userId: string, pending = false) {
    const rows = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userLowId: userId }, { userHighId: userId }],
        status: pending ? "PENDING" : "ACCEPTED",
      },
      orderBy: { createdAt: "desc" },
      include: { userLow: true, userHigh: true },
    });
    return {
      items: rows.map((row) =>
        pending
          ? {
              id: row.id,
              sender: publicUser(
                row.requesterId === row.userLowId ? row.userLow : row.userHigh,
                this.config.ONLINE_STATUS_THRESHOLD_SECONDS,
              ),
              receiver: publicUser(
                row.requesterId === row.userLowId ? row.userHigh : row.userLow,
                this.config.ONLINE_STATUS_THRESHOLD_SECONDS,
              ),
              status: row.status,
              createdAt: row.createdAt.toISOString(),
            }
          : publicUser(
              row.userLowId === userId ? row.userHigh : row.userLow,
              this.config.ONLINE_STATUS_THRESHOLD_SECONDS,
            ),
      ),
    };
  }
  async search(userId: string, query: unknown) {
    const { q, page, pageSize } = paginationSchema
      .extend({ q: z.string().trim().min(1).max(100) })
      .parse(query);
    const where = {
      id: { not: userId },
      normalizedNickname: { contains: q.toLowerCase() },
    };
    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: [{ normalizedNickname: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: items.map((user) =>
        publicUser(user, this.config.ONLINE_STATUS_THRESHOLD_SECONDS),
      ),
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }
  async request(userId: string, body: unknown) {
    const { userId: targetId } = z
      .object({ userId: z.uuid() })
      .strict()
      .parse(body);
    if (targetId === userId)
      throw new ApiError(
        400,
        "CANNOT_FRIEND_SELF",
        "You cannot send yourself a friend request.",
      );
    const [userLowId, userHighId] = [userId, targetId].sort();
    return this.prisma.serializable(async (tx) => {
      if (!(await tx.user.findUnique({ where: { id: targetId } })))
        throw new ApiError(404, "USER_NOT_FOUND", "The user was not found.");
      const existing = await tx.friendship.findUnique({
        where: { userLowId_userHighId: { userLowId, userHighId } },
      });
      if (existing)
        throw new ApiError(
          409,
          "FRIENDSHIP_EXISTS",
          "A relationship already exists.",
        );
      const row = await tx.friendship.create({
        data: { userLowId, userHighId, requesterId: userId },
        include: { userLow: true, userHigh: true },
      });
      return {
        id: row.id,
        sender: publicUser(
          row.requesterId === row.userLowId ? row.userLow : row.userHigh,
        ),
        receiver: publicUser(
          row.requesterId === row.userLowId ? row.userHigh : row.userLow,
        ),
        status: row.status,
        createdAt: row.createdAt.toISOString(),
      };
    });
  }
  async accept(userId: string, rawId: string): Promise<void> {
    const id = z.uuid().parse(rawId);
    const updated = await this.prisma.friendship.updateMany({
      where: {
        id,
        requesterId: { not: userId },
        OR: [{ userLowId: userId }, { userHighId: userId }],
        status: "PENDING",
      },
      data: { status: "ACCEPTED" },
    });
    if (!updated.count)
      throw new ApiError(
        404,
        "FRIEND_REQUEST_NOT_FOUND",
        "No incoming request was found.",
      );
  }
  async cancel(userId: string, rawId: string): Promise<void> {
    const id = z.uuid().parse(rawId),
      deleted = await this.prisma.friendship.deleteMany({
        where: {
          id,
          status: "PENDING",
          OR: [{ userLowId: userId }, { userHighId: userId }],
        },
      });
    if (!deleted.count)
      throw new ApiError(
        404,
        "FRIEND_REQUEST_NOT_FOUND",
        "No pending request was found.",
      );
  }
  async remove(userId: string, rawId: string): Promise<void> {
    const targetId = z.uuid().parse(rawId),
      [userLowId, userHighId] = [userId, targetId].sort();
    const deleted = await this.prisma.friendship.deleteMany({
      where: { userLowId, userHighId, status: "ACCEPTED" },
    });
    if (!deleted.count)
      throw new ApiError(404, "FRIEND_NOT_FOUND", "No friendship was found.");
  }
}
