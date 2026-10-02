import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { resolve } from "node:path";
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== "--output"))
  throw new Error("Usage: pnpm env:init [--output path]");
const target = resolve(args[1] ?? ".env");
const values = parseEnv(
  await readFile(new URL("../.env.example", import.meta.url), "utf8"),
);
values.POSTGRES_PASSWORD = randomBytes(24).toString("hex");
values.JWT_SECRET = randomBytes(48).toString("base64url");
values.API_KEY_HMAC_SECRET = randomBytes(48).toString("base64url");
const credentials = `${encodeURIComponent(values.POSTGRES_USER)}:${encodeURIComponent(values.POSTGRES_PASSWORD)}`;
values.DATABASE_URL = `postgresql://${credentials}@127.0.0.1:5432/${values.POSTGRES_DB}`;
values.TEST_DATABASE_URL = `postgresql://${credentials}@127.0.0.1:5432/${values.POSTGRES_DB}_test`;
await writeFile(
  target,
  Object.entries(values)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join("\n") + "\n",
  { flag: "wx", mode: 0o600 },
);
console.info(
  `Created ${target}. Existing files are never overwritten. Configure 42 OAuth separately.`,
);
