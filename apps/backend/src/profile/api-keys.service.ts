import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { createHmac, randomBytes } from "node:crypto";
import type { ApiKey } from "@prisma/client";
import type { Request, Response } from "express";
import { z } from "zod";
import type { Configuration } from "../config";
import { PrismaService } from "../database/prisma.service";
import { ApiError } from "../common/errors";
const summary = (key: ApiKey) => ({
  id: key.id,
  label: key.label,
  createdAt: key.createdAt.toISOString(),
  revokedAt: key.revokedAt?.toISOString() ?? null,
});
export type PublicApiRequest = Request & {
  apiUserId: string;
  apiKeyId: string;
};
@Injectable()
export class ApiKeysService {
  private readonly windows = new Map<
    string,
    { started: number; count: number }
  >();
  constructor(
    private readonly prisma: PrismaService,
    @Inject("CONFIG") private readonly config: Configuration,
  ) {}
  private hash(raw: string) {
    return createHmac("sha256", this.config.API_KEY_HMAC_SECRET)
      .update(raw)
      .digest("hex");
  }
  async list(userId: string) {
    return {
      items: (
        await this.prisma.apiKey.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        })
      ).map(summary),
    };
  }
  async create(userId: string, body: unknown) {
    const { label } = z
        .object({ label: z.string().trim().min(1).max(80) })
        .strict()
        .parse(body),
      apiKey = `gnp_${randomBytes(32).toString("base64url")}`;
    const key = await this.prisma.apiKey.create({
      data: { userId, label, keyHash: this.hash(apiKey) },
    });
    return { apiKey, record: summary(key) };
  }
  async revoke(userId: string, rawId: string): Promise<void> {
    const id = z.uuid().parse(rawId),
      key = await this.prisma.apiKey.findFirst({ where: { id, userId } });
    if (!key)
      throw new ApiError(
        404,
        "API_KEY_NOT_FOUND",
        "The API key was not found.",
      );
    await this.prisma.apiKey.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  async authenticate(
    request: PublicApiRequest,
    response: Response,
  ): Promise<void> {
    const raw = request.headers["x-api-key"];
    if (raw === undefined)
      throw new ApiError(401, "API_KEY_REQUIRED", "Provide X-API-Key.");
    if (typeof raw !== "string" || !/^gnp_[A-Za-z0-9_-]{43}$/.test(raw))
      throw new ApiError(401, "INVALID_API_KEY", "The API key is invalid.");
    const key = await this.prisma.apiKey.findUnique({
      where: { keyHash: this.hash(raw) },
    });
    if (!key)
      throw new ApiError(401, "INVALID_API_KEY", "The API key is invalid.");
    if (key.revokedAt)
      throw new ApiError(
        401,
        "API_KEY_REVOKED",
        "The API key has been revoked.",
      );
    const now = Date.now(),
      windowMs = this.config.PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS * 1000;
    for (const [id, window] of this.windows)
      if (now >= window.started + windowMs) this.windows.delete(id);
    const window = this.windows.get(key.id) ?? { started: now, count: 0 };
    if (window.count >= this.config.PUBLIC_API_RATE_LIMIT_MAX) {
      response.setHeader(
        "Retry-After",
        Math.max(1, Math.ceil((window.started + windowMs - now) / 1000)),
      );
      throw new ApiError(
        429,
        "RATE_LIMIT_EXCEEDED",
        "API key rate limit exceeded.",
      );
    }
    window.count++;
    this.windows.set(key.id, window);
    request.apiUserId = key.userId;
    request.apiKeyId = key.id;
    await this.prisma.user.update({
      where: { id: key.userId },
      data: { lastActiveAt: new Date() },
    });
  }
}
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly keys: ApiKeysService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    await this.keys.authenticate(
      context.switchToHttp().getRequest<PublicApiRequest>(),
      context.switchToHttp().getResponse<Response>(),
    );
    return true;
  }
}
