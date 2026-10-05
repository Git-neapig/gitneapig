import { Inject, Injectable } from "@nestjs/common";
import { Prisma, type User } from "@prisma/client";
import { calculateLevel, type CurrentUser, type Language, type PublicUserSummary } from "@gitneapig/shared";
import { hash, verify, argon2id } from "argon2";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { z } from "zod";
import type { Configuration } from "../config";
import { PrismaService } from "../database/prisma.service";
import { ApiError } from "../common/errors";
import { loginSchema, normalizeIdentity, signupSchema } from "../common/validation";

export function currentUser(user: User): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    avatarUrl:
      user.avatarSource === "CUSTOM" && user.avatarPath
        ? `/uploads/${user.avatarPath}`
        : `/mascots/characters/${user.avatarPresetKey ?? "primary"}/avatar.png`,
    language: user.language as Language,
    xp: user.xp,
    level: calculateLevel(user.xp).level,
    streak: user.streak,
    createdAt: user.createdAt.toISOString(),
  };
}
export function publicUser(
  user: User,
  thresholdSeconds = 120,
): PublicUserSummary {
  const { id, nickname, avatarUrl, xp, level } = currentUser(user);
  return {
    id,
    nickname,
    avatarUrl,
    xp,
    level,
    onlineStatus:
      Date.now() - user.lastActiveAt.getTime() <= thresholdSeconds * 1000
        ? "ONLINE"
        : "OFFLINE",
  };
}
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService,
    @Inject("CONFIG") private readonly config: Configuration
  ) {}
  private cookieOptions(maxAge?: number) {
    return {
      httpOnly: true,
      secure: this.config.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      ...(maxAge ? { maxAge } : {}),
    };
  }
  private signed(payload: object, audience: string, seconds: number): string {
    return jwt.sign(payload, this.config.JWT_SECRET, {
      algorithm: "HS256",
      audience,
      issuer: "gitneapig",
      expiresIn: seconds,
    });
  }
  private verified(token: unknown, audience: string): jwt.JwtPayload {
    if (typeof token !== "string")
      throw new ApiError(401, "UNAUTHORIZED", "Sign in to continue.");
    try {
      const payload = jwt.verify(token, this.config.JWT_SECRET, {
        algorithms: ["HS256"],
        audience,
        issuer: "gitneapig",
      });
      if (typeof payload !== "object" || !payload.exp || !payload.iat)
        throw new Error("Invalid payload");
      return payload;
    } catch (error) {
      throw new ApiError(
        401,
        error instanceof jwt.TokenExpiredError
          ? "SESSION_EXPIRED"
          : "UNAUTHORIZED",
        "Sign in to continue.",
      );
    }
  }
  session(response: Response, user: User): void {
    response.cookie(
      "gitneapig_session",
      this.signed({ sub: user.id }, "session", 8 * 3600),
      this.cookieOptions(8 * 3600 * 1000),
    );
  }
  logout(response: Response): void {
    response.clearCookie("gitneapig_session", this.cookieOptions());
    response.clearCookie("gitneapig_onboarding", this.cookieOptions());
  }
  async user(request: Request, optional = false): Promise<User | null> {
    const token = (request.cookies as Record<string, unknown> | undefined)
      ?.gitneapig_session;
    if (!token && optional) return null;
    const payload = this.verified(token, "session");
    if (!z.uuid().safeParse(payload.sub).success)
      throw new ApiError(401, "UNAUTHORIZED", "Sign in to continue.");
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) throw new ApiError(401, "UNAUTHORIZED", "Sign in to continue.");
    return this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });
  }
  async requiredUser(request: Request): Promise<User> {
    return (await this.user(request))!;
  }
  private identityError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = String(error.meta?.target ?? "");
      if (target.includes("Nickname"))
        throw new ApiError(
          409,
          "NICKNAME_TAKEN",
          "This nickname is already used.",
          "nickname",
        );
      if (target.includes("Email"))
        throw new ApiError(
          409,
          "EMAIL_TAKEN",
          "This email is already registered.",
          "email",
        );
      throw new ApiError(
        409,
        "ACCOUNT_EXISTS",
        "This account is already registered.",
      );
    }
    throw error;
  }
  async signup(body: unknown, response: Response) {
    const input = signupSchema.parse(body);
    const passwordHash = await hash(input.password, { type: argon2id });
    try {
      const user = await this.prisma.user.create({
        data: {
          email: input.email,
          normalizedEmail: normalizeIdentity(input.email),
          passwordHash,
          nickname: input.nickname,
          normalizedNickname: normalizeIdentity(input.nickname),
          ...(input.avatarPresetKey
            ? { avatarSource: "PRESET", avatarPresetKey: input.avatarPresetKey }
            : {}),
        },
      });
      this.session(response, user);
      return { user: currentUser(user) };
    } catch (error) {
      this.identityError(error);
    }
  }
  async login(body: unknown, response: Response) {
    const input = loginSchema.parse(body),
      user = await this.prisma.user.findUnique({
        where: { normalizedEmail: normalizeIdentity(input.email) },
      });
    if (
      !user?.passwordHash ||
      !(await verify(user.passwordHash, input.password))
    )
      throw new ApiError(
        401,
        "INVALID_CREDENTIALS",
        "Email or password is incorrect.",
      );
    const active = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });
    this.session(response, active);
    return { user: currentUser(active) };
  }
}
