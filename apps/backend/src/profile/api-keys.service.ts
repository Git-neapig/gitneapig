import {
  Inject,
  Injectable,
} from "@nestjs/common";
import { createHmac, randomBytes } from "node:crypto";
import type { ApiKey } from "@prisma/client";
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
@Injectable()
export class ApiKeysService {
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
}
