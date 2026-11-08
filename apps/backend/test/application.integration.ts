import request from "supertest";
import jwt from "jsonwebtoken";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { createApplication } from "../src/application";
import { parseConfiguration } from "../src/config";
import { PrismaService } from "../src/database/prisma.service";
import { seedContent } from "../src/content/seed";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl || !new URL(databaseUrl).pathname.endsWith("_test"))
  throw new Error(
    "TEST_DATABASE_URL must name a migrated, dedicated *_test database.",
  );
const origin = "http://127.0.0.1:5174",
  secret = "integration-only-secret-with-at-least-32-characters";
let app: NestExpressApplication, db: PrismaService, uploadDir: string;
const userIds: string[] = [];
type Member = { id: string; cookie: string; nickname: string; email: string };
const server = () => app.getHttpServer();
async function member(): Promise<Member> {
  const suffix = randomUUID().slice(0, 8),
    nickname = `Test-${suffix}`,
    email = `${suffix}@example.test`;
  const result = await request(server())
    .post("/api/v1/auth/signup")
    .set("Origin", origin)
    .send({ email, nickname, password: "Test-password-123" })
    .expect(201);
  userIds.push(result.body.user.id);
  return {
    id: result.body.user.id,
    nickname,
    email,
    cookie: result.headers["set-cookie"][0].split(";")[0],
  };
}
beforeAll(async () => {
  uploadDir = await mkdtemp(join(tmpdir(), "gitneapig-avatars-test-"));
  app = await createApplication(
    parseConfiguration({
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl,
      JWT_SECRET: secret,
      API_KEY_HMAC_SECRET: secret,
      APP_ORIGIN: origin,
      AVATAR_UPLOAD_DIR: uploadDir,
    }),
  );
  app.useLogger(false);
  await app.init();
  db = app.get(PrismaService);
  await seedContent(db);
});
afterAll(async () => {
  if (db) await db.user.deleteMany({ where: { id: { in: userIds } } });
  if (app) await app.close();
  if (uploadDir) await rm(uploadDir, { recursive: true, force: true });
});

describe("real HTTP and PostgreSQL integration", () => {
  it("keeps stage bookmarks distinct, defaults legacy requests, and preserves identity on update", async () => {
    const a = await member();
    const createdKey = await request(server())
      .post("/api/v1/profile/api-keys")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({ label: "Stage test" })
      .expect(201);
    const key = createdKey.body.apiKey;
    const legacy = await request(server())
      .post("/api/v1/public/bookmarks")
      .set("X-API-Key", key)
      .send({ targetType: "LESSON", targetId: "lesson-1" })
      .expect(201);
    expect(legacy.body.stage).toBe("SITUATION");
    for (const stage of ["WHY", "CONCEPT", "COMMAND", "PRACTICE", "RESULT"]) {
      const result = await request(server())
        .post("/api/v1/bookmarks")
        .set("Origin", origin)
        .set("Cookie", a.cookie)
        .send({ targetType: "LESSON", targetId: "lesson-1", stage })
        .expect(201);
      expect(result.body.stage).toBe(stage);
    }
    await request(server())
      .post("/api/v1/public/bookmarks")
      .set("X-API-Key", key)
      .send({ targetType: "LESSON", targetId: "lesson-1", stage: "PRACTICE" })
      .expect(409);
    await request(server())
      .post("/api/v1/bookmarks")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({ targetType: "QUEST", targetId: "quest-1", stage: "PRACTICE" })
      .expect(400);
    await request(server())
      .post("/api/v1/public/bookmarks")
      .set("X-API-Key", key)
      .send({ targetType: "LESSON", targetId: "lesson-1", stage: "invalid" })
      .expect(400);
    const list = await request(server())
      .get("/api/v1/public/bookmarks")
      .set("X-API-Key", key)
      .expect(200);
    expect(list.body.totalItems).toBe(6);
    const update = await request(server())
      .put(`/api/v1/public/bookmarks/${legacy.body.id}`)
      .set("X-API-Key", key)
      .send({ targetType: "LESSON", targetId: "lesson-2", stage: "WHY" })
      .expect(200);
    expect(update.body).toMatchObject({
      id: legacy.body.id,
      createdAt: legacy.body.createdAt,
      stage: "WHY",
    });
    const normalized = await request(server())
      .put(`/api/v1/public/bookmarks/${legacy.body.id}`)
      .set("X-API-Key", key)
      .send({ targetType: "QUEST", targetId: "quest-1" })
      .expect(200);
    expect(normalized.body.stage).toBeNull();
    const filtered = await request(server())
      .get("/api/v1/public/bookmarks?targetType=LESSON&pageSize=2&page=2")
      .set("X-API-Key", key)
      .expect(200);
    expect(filtered.body).toMatchObject({
      totalItems: 5,
      totalPages: 3,
      page: 2,
    });
    expect(filtered.body.items).toHaveLength(2);
    expect(
      filtered.body.items.every(
        (item: { targetType: string }) => item.targetType === "LESSON",
      ),
    ).toBe(true);
    const quests = await request(server())
      .get("/api/v1/bookmarks?targetType=QUEST")
      .set("Cookie", a.cookie)
      .expect(200);
    expect(quests.body.totalItems).toBe(1);
    expect(quests.body.items[0].id).toBe(legacy.body.id);
    await request(server())
      .get("/api/v1/public/bookmarks?targetType=INVALID")
      .set("X-API-Key", key)
      .expect(400);
  });
  it("persists Daily completion across independent logins without leaking another member's state", async () => {
    const a = await member(),
      b = await member();
    const daily = (
      await request(server()).get("/api/v1/daily-challenge/today").expect(200)
    ).body;
    const path = `/api/v1/daily-challenge/${daily.id}/progress`;
    await request(server()).get(path).expect(401);
    expect(
      (await request(server()).get(path).set("Cookie", a.cookie).expect(200))
        .body.completed,
    ).toBe(false);
    await request(server())
      .post(`/api/v1/daily-challenge/${daily.id}/complete`)
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({})
      .expect(200);
    const login = await request(server())
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({ email: a.email, password: "Test-password-123" })
      .expect(200);
    const secondCookie = login.headers["set-cookie"][0].split(";")[0];
    const saved = await request(server())
      .get(path)
      .set("Cookie", secondCookie)
      .expect(200);
    expect(saved.body.completed).toBe(true);
    expect(saved.body.completedAt).toBeTruthy();
    expect(saved.headers["cache-control"]).toBe("no-store");
    expect(
      (await request(server()).get(path).set("Cookie", b.cookie).expect(200))
        .body.completed,
    ).toBe(false);
    expect(
      (
        await request(server())
          .post(`/api/v1/daily-challenge/${daily.id}/complete`)
          .set("Origin", origin)
          .set("Cookie", secondCookie)
          .send({})
          .expect(200)
      ).body.xpAwarded,
    ).toBe(0);
  });
  it("keeps unconfigured OAuth on the localized login page with a safe return path", async () => {
    const result = await request(server())
      .get("/api/v1/auth/42?returnTo=https://invalid.example")
      .expect(302);
    expect(result.headers.location).toBe(
      "/login?oauthError=unavailable&returnTo=%2F",
    );
  });
  it("rolls back completion, achievement and streak writes when the real database rejects XP overflow", async () => {
    const a = await member();
    await db.user.update({ where: { id: a.id }, data: { xp: 2147483640 } });
    await request(server())
      .post("/api/v1/lessons/lesson-1/complete")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({})
      .expect(500);
    expect(await db.lessonProgress.count({ where: { userId: a.id } })).toBe(0);
    expect(await db.userAchievement.count({ where: { userId: a.id } })).toBe(0);
    const unchanged = await db.user.findUniqueOrThrow({ where: { id: a.id } });
    expect(unchanged.xp).toBe(2147483640);
    expect(unchanged.streak).toBe(0);
    await db.user.update({ where: { id: a.id }, data: { xp: 0 } });
    await request(server())
      .post("/api/v1/lessons/lesson-1/complete")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({})
      .expect(200);
  });
  it("awards a concurrently completed quest and its achievement only once", async () => {
    const a = await member();
    const results = await Promise.all(
      Array.from({ length: 2 }, () =>
        request(server())
          .post("/api/v1/quests/quest-1/complete")
          .set("Origin", origin)
          .set("Cookie", a.cookie)
          .send({})
          .expect(200),
      ),
    );
    expect(results.map((r) => r.body.xpAwarded).sort((a, b) => a - b)).toEqual([
      0, 140,
    ]);
    expect(await db.questProgress.count({ where: { userId: a.id } })).toBe(1);
    expect(await db.userAchievement.count({ where: { userId: a.id } })).toBe(1);
  });
  it("returns safe 4xx errors for malformed JSON and missing avatar files", async () => {
    const missing = await request(server())
      .get("/uploads/avatars/00000000-0000-0000-0000-000000000000.png")
      .expect(404);
    expect(missing.body.error.code).toBe("NOT_FOUND");
    expect(missing.text).not.toContain(uploadDir);
    expect(missing.headers["cache-control"]).toBe("no-store");
    await request(server())
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .set("Content-Type", "application/json")
      .send('{"email":')
      .expect(400);
  });
  it("connects to PostgreSQL and repeat seeding preserves catalog identity", async () => {
    await request(server()).get("/api/v1/health").expect(200);
    const before = await db.dailyChallengeTemplate.findMany({
      orderBy: { templateKey: "asc" },
    });
    await seedContent(db);
    expect(
      (
        await db.dailyChallengeTemplate.findMany({
          orderBy: { templateKey: "asc" },
        })
      ).map((row) => row.id),
    ).toEqual(before.map((row) => row.id));
    expect(await db.lesson.count()).toBe(5);
    expect(await db.quest.count()).toBe(5);
    expect(await db.achievement.count()).toBe(10);
  });
  it("requires exact Origin for unsafe internal requests", async () => {
    for (const bad of ["", "null", "https://evil.example", `${origin}/`]) {
      const call = request(server()).post("/api/v1/auth/logout");
      if (bad) call.set("Origin", bad);
      expect((await call.expect(403)).body.error.code).toBe("FORBIDDEN");
    }
    await request(server())
      .post("/api/v1/auth/logout")
      .set("Origin", origin)
      .expect(204);
  });
  it("uses Argon2id, normalized unique identities and safe account projections", async () => {
    const a = await member();
    expect(
      (await db.user.findUniqueOrThrow({ where: { id: a.id } })).passwordHash,
    ).toMatch(/^\$argon2id\$/);
    const me = await request(server())
      .get("/api/v1/auth/me")
      .set("Cookie", a.cookie)
      .expect(200);
    expect(me.headers["cache-control"]).toBe("no-store");
    expect(me.body.user.passwordHash).toBeUndefined();
    expect(me.body.user.normalizedEmail).toBeUndefined();
    const logged = await request(server())
      .post("/api/v1/auth/login")
      .set("Origin", origin)
      .send({
        email: ` ${a.email.toUpperCase()} `,
        password: "Test-password-123",
      })
      .expect(200);
    expect(logged.headers["set-cookie"][0]).toMatch(/HttpOnly/);
    expect(logged.headers["set-cookie"][0]).toMatch(/SameSite=Lax/);
    expect(logged.headers["set-cookie"][0]).toMatch(/Max-Age=28800/);
    await request(server())
      .post("/api/v1/auth/signup")
      .set("Origin", origin)
      .send({
        email: a.email.toUpperCase(),
        nickname: "Different-Test",
        password: "Test-password-123",
      })
      .expect(409);
    const b = await member();
    expect(
      (
        await request(server())
          .patch("/api/v1/profile")
          .set("Origin", origin)
          .set("Cookie", b.cookie)
          .send({ nickname: a.nickname.toUpperCase() })
          .expect(409)
      ).body.error.code,
    ).toBe("NICKNAME_TAKEN");
  });
  it("expires sessions without sliding renewal", async () => {
    const a = await member(),
      expired = jwt.sign({ sub: a.id }, secret, {
        audience: "session",
        issuer: "gitneapig",
        expiresIn: -1,
      });
    expect(
      (
        await request(server())
          .get("/api/v1/auth/me")
          .set("Cookie", `gitneapig_session=${expired}`)
          .expect(401)
      ).body.error.code,
    ).toBe("SESSION_EXPIRED");
    expect(
      (
        await request(server())
          .get("/api/v1/auth/me")
          .set("Cookie", a.cookie)
          .expect(200)
      ).headers["set-cookie"],
    ).toBeUndefined();
  });
  it("protects Lesson 4-5 and Reference and marks only public lesson responses cacheable", async () => {
    const list = await request(server()).get("/api/v1/lessons").expect(200);
    expect(list.headers["x-gitneapig-cache"]).toBe("public-lesson");
    expect(list.body.items[3].stages).toBeUndefined();
    await request(server())
      .get(`/api/v1/lessons/${list.body.items[3].slug}`)
      .expect(401);
    await request(server()).get("/api/v1/reference/commands").expect(401);
    const a = await member();
    const privateList = await request(server())
      .get("/api/v1/lessons")
      .set("Cookie", a.cookie)
      .expect(200);
    expect(privateList.headers["x-gitneapig-cache"]).toBeUndefined();
    expect(privateList.headers["cache-control"]).toBe("no-store");
    const detail = await request(server())
      .get(`/api/v1/lessons/${list.body.items[3].slug}`)
      .set("Cookie", a.cookie)
      .expect(200);
    expect(detail.body.stages).toHaveLength(6);
    expect(detail.headers["cache-control"]).toBe("no-store");
  });
  it("preserves monotonic stages and awards completion and achievement XP once under concurrency", async () => {
    const a = await member();
    for (const index of [4, 2])
      await request(server())
        .patch("/api/v1/lessons/lesson-1/progress")
        .set("Origin", origin)
        .set("Cookie", a.cookie)
        .send({ highestReachedStageIndex: index })
        .expect(200);
    expect(
      (
        await db.lessonProgress.findUniqueOrThrow({
          where: { userId_lessonId: { userId: a.id, lessonId: "lesson-1" } },
        })
      ).highestReachedStageIndex,
    ).toBe(4);
    const outcomes = await Promise.all(
      Array.from({ length: 2 }, () =>
        request(server())
          .post("/api/v1/lessons/lesson-1/complete")
          .set("Origin", origin)
          .set("Cookie", a.cookie)
          .send({})
          .expect(200),
      ),
    );
    expect(
      outcomes.map((result) => result.body.xpAwarded).sort((a, b) => a - b),
    ).toEqual([0, 100]);
    const achievements = await db.userAchievement.findMany({
      where: { userId: a.id },
      include: { achievement: true },
    });
    const user = await db.user.findUniqueOrThrow({ where: { id: a.id } });
    expect(user.xp).toBe(
      100 +
        achievements.reduce((sum, row) => sum + row.achievement.xpReward, 0),
    );
    expect(user.streak).toBe(1);
    await request(server())
      .post("/api/v1/lessons/lesson-1/complete")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({ userId: a.id, xp: 99999 })
      .expect(400);
    await seedContent(db);
    expect((await db.user.findUniqueOrThrow({ where: { id: a.id } })).xp).toBe(
      user.xp,
    );
  });
  it("does not lose XP on simultaneous different completions and enforces quest prerequisites", async () => {
    const a = await member();
    await request(server())
      .post("/api/v1/quests/quest-2/complete")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({})
      .expect(403);
    await Promise.all(
      ["lesson-1", "lesson-2"].map((id) =>
        request(server())
          .post(`/api/v1/lessons/${id}/complete`)
          .set("Origin", origin)
          .set("Cookie", a.cookie)
          .send({})
          .expect(200),
      ),
    );
    const rewards = await db.userAchievement.findMany({
      where: { userId: a.id },
      include: { achievement: true },
    });
    expect((await db.user.findUniqueOrThrow({ where: { id: a.id } })).xp).toBe(
      240 + rewards.reduce((sum, row) => sum + row.achievement.xpReward, 0),
    );
  });
  it("assigns one daily challenge concurrently and awards its reward once", async () => {
    const results = await Promise.all(
      Array.from({ length: 4 }, () =>
        request(server()).get("/api/v1/daily-challenge/today").expect(200),
      ),
    );
    expect(new Set(results.map((row) => row.body.id)).size).toBe(1);
    expect(results[0].body.hints).toHaveLength(3);
    const a = await member(),
      id = results[0].body.id;
    const completions = await Promise.all(
      Array.from({ length: 2 }, () =>
        request(server())
          .post(`/api/v1/daily-challenge/${id}/complete`)
          .set("Origin", origin)
          .set("Cookie", a.cookie)
          .send({})
          .expect(200),
      ),
    );
    expect(completions.reduce((sum, row) => sum + row.body.xpAwarded, 0)).toBe(
      80,
    );
  });
  it("keeps one canonical friendship pair and restricts acceptance to its receiver", async () => {
    const a = await member(),
      b = await member(),
      c = await member();
    const outcomes = await Promise.all(
      [
        [a, b],
        [b, a],
      ].map(([from, to]) =>
        request(server())
          .post("/api/v1/friends/requests")
          .set("Origin", origin)
          .set("Cookie", from.cookie)
          .send({ userId: to.id }),
      ),
    );
    expect(outcomes.map((row) => row.status).sort()).toEqual([201, 409]);
    const row = await db.friendship.findFirstOrThrow({
      where: {
        userLowId: [a.id, b.id].sort()[0],
        userHighId: [a.id, b.id].sort()[1],
      },
    });
    const sender = row.requesterId === a.id ? a : b,
      receiver = sender === a ? b : a;
    await request(server())
      .post(`/api/v1/friends/requests/${row.id}/accept`)
      .set("Origin", origin)
      .set("Cookie", sender.cookie)
      .expect(404);
    await request(server())
      .delete(`/api/v1/friends/requests/${row.id}`)
      .set("Origin", origin)
      .set("Cookie", c.cookie)
      .expect(404);
    await request(server())
      .post(`/api/v1/friends/requests/${row.id}/accept`)
      .set("Origin", origin)
      .set("Cookie", receiver.cookie)
      .expect(204);
    const list = await request(server())
      .get("/api/v1/friends")
      .set("Cookie", receiver.cookie)
      .expect(200);
    expect(list.body.items[0].email).toBeUndefined();
    expect(list.body.items[0].onlineStatus).toBe("ONLINE");
    await request(server())
      .delete(`/api/v1/friends/${sender.id}`)
      .set("Origin", origin)
      .set("Cookie", receiver.cookie)
      .expect(204);
  });
  it("scopes public bookmark CRUD to the key owner, rate-limits each key and retains soft revocation", async () => {
    const a = await member(),
      b = await member();
    const created = await request(server())
      .post("/api/v1/profile/api-keys")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({ label: "Integration" })
      .expect(201);
    const key = created.body.apiKey,
      keyId = created.body.record.id;
    expect(key).toMatch(/^gnp_[\w-]{43}$/);
    expect(
      (await db.apiKey.findUniqueOrThrow({ where: { id: keyId } })).keyHash,
    ).not.toContain(key);
    await request(server())
      .get("/api/v1/public/bookmarks")
      .set("Cookie", a.cookie)
      .expect(401);
    const bookmark = await request(server())
      .post("/api/v1/public/bookmarks")
      .set("X-API-Key", key)
      .set("Cookie", b.cookie)
      .send({ targetType: "LESSON", targetId: "lesson-1" })
      .expect(201);
    const id = bookmark.body.id;
    expect(
      (await db.bookmark.findUniqueOrThrow({ where: { id } })).userId,
    ).toBe(a.id);
    await request(server())
      .delete(`/api/v1/bookmarks/${id}`)
      .set("Origin", origin)
      .set("Cookie", b.cookie)
      .expect(404);
    await request(server())
      .get(`/api/v1/public/bookmarks/${id}`)
      .set("X-API-Key", key)
      .expect(200);
    await request(server())
      .put(`/api/v1/public/bookmarks/${id}`)
      .set("X-API-Key", key)
      .send({ targetType: "QUEST", targetId: "quest-1" })
      .expect(200);
    await request(server())
      .delete(`/api/v1/public/bookmarks/${id}`)
      .set("X-API-Key", key)
      .expect(204);
    for (let index = 4; index < 60; index++)
      await request(server())
        .get("/api/v1/public/bookmarks")
        .set("X-API-Key", key)
        .expect(200);
    const limited = await request(server())
      .get("/api/v1/public/bookmarks")
      .set("X-API-Key", key)
      .expect(429);
    expect(Number(limited.headers["retry-after"])).toBeGreaterThan(0);
    for (let index = 0; index < 2; index++)
      await request(server())
        .delete(`/api/v1/profile/api-keys/${keyId}`)
        .set("Origin", origin)
        .set("Cookie", a.cookie)
        .expect(204);
    expect(
      (
        await request(server())
          .get("/api/v1/public/bookmarks")
          .set("X-API-Key", key)
          .expect(401)
      ).body.error.code,
    ).toBe("API_KEY_REVOKED");
    const keys = await request(server())
      .get("/api/v1/profile/api-keys")
      .set("Cookie", a.cookie)
      .expect(200);
    expect(keys.body.items[0].revokedAt).toBeTruthy();
    expect(keys.body.items[0].keyHash).toBeUndefined();
    expect(keys.body.items[0].apiKey).toBeUndefined();
  });
  it("validates image bytes and removes replaced custom avatar files", async () => {
    const a = await member(),
      png = await sharp({
        create: { width: 32, height: 32, channels: 3, background: "#44aa88" },
      })
        .png()
        .toBuffer();
    await request(server())
      .post("/api/v1/profile/avatar")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .attach("avatar", Buffer.from("<svg/>"), {
        filename: "fake.png",
        contentType: "image/png",
      })
      .expect(400);
    const uploaded = await request(server())
      .post("/api/v1/profile/avatar")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .attach("avatar", png, {
        filename: "../../unsafe.png",
        contentType: "image/png",
      })
      .expect(201);
    const path = uploaded.body.user.avatarUrl;
    expect(path).toMatch(/^\/uploads\/avatars\/[0-9a-f-]+\.png$/);
    await request(server())
      .get(path)
      .expect("Content-Type", /image\/png/)
      .expect(200);
    await request(server())
      .patch("/api/v1/profile")
      .set("Origin", origin)
      .set("Cookie", a.cookie)
      .send({ avatarPresetKey: "cream" })
      .expect(200);
    expect(await readdir(uploadDir)).not.toContain(path.split("/").pop());
  });
  it("rejects OAuth state mismatch and onboards only a correctly scoped signed context", async () => {
    await request(server())
      .get("/api/v1/auth/42/callback?state=bad&code=bad")
      .expect(302)
      .expect("Location", "/login?oauthError=42");
    const subject = String(Date.now()),
      nickname = `OAuth-${randomUUID().slice(0, 8)}`;
    const pending = jwt.sign(
      { sub: subject, returnTo: "//evil.example" },
      secret,
      { audience: "onboarding", issuer: "gitneapig", expiresIn: "15m" },
    );
    await request(server())
      .post("/api/v1/auth/42/onboarding")
      .set("Origin", origin)
      .set("Cookie", `gitneapig_onboarding=${pending}`)
      .field("nickname", nickname)
      .field("avatarPresetKey", "primary")
      .expect(303)
      .expect("Location", "/");
    const user = await db.user.findUniqueOrThrow({
      where: { oauth42Subject: subject },
    });
    userIds.push(user.id);
    expect(user.email).toBeNull();
    expect(user.passwordHash).toBeNull();
  });
});
