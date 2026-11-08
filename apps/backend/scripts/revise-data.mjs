import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

config({ path: "../../.env", quiet: true });
const require = createRequire(import.meta.url);
if (process.argv.includes("--test")) {
  const url = new URL(process.env.DATABASE_URL);
  if (!url.pathname.endsWith("_test")) url.pathname += "_test";
  process.env.DATABASE_URL = url.toString();
}
const db = new PrismaClient();
try {
  const before =
    await db.$queryRaw`SELECT id, "userId", "targetType", "targetId", "createdAt" FROM "Bookmark" ORDER BY id`;
  const accounts = await db.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, xp: true, streak: true },
  });
  const progress = await db.lessonProgress.findMany({
    orderBy: [{ userId: "asc" }, { lessonId: "asc" }],
  });
  const migration = spawnSync(
    process.execPath,
    [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
    { stdio: "inherit", env: process.env },
  );
  if (migration.status !== 0) throw new Error("Migration failed");
  const seed = spawnSync(
    process.execPath,
    [require.resolve("tsx/cli"), "prisma/seed.ts"],
    { stdio: "inherit", env: process.env },
  );
  if (seed.status !== 0) throw new Error("Content seed failed");
  const after =
    await db.$queryRaw`SELECT id, "userId", "targetType", "targetId", "createdAt" FROM "Bookmark" ORDER BY id`;
  const accountAfter = await db.user.findMany({
    orderBy: { id: "asc" },
    select: { id: true, xp: true, streak: true },
  });
  const progressAfter = await db.lessonProgress.findMany({
    orderBy: [{ userId: "asc" }, { lessonId: "asc" }],
  });
  if (
    JSON.stringify(before) !== JSON.stringify(after) ||
    JSON.stringify(accounts) !== JSON.stringify(accountAfter) ||
    JSON.stringify(progress) !== JSON.stringify(progressAfter)
  )
    throw new Error("Preservation verification failed");
  console.log(
    `Preserved ${before.length} bookmarks (IDs/timestamps), ${accounts.length} accounts (XP/streak), ${progress.length} lesson progress records.`,
  );
} catch (error) {
  console.error(error.code ?? error.message);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
