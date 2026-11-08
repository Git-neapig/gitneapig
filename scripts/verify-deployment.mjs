import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { request as httpsRequest } from "node:https";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { parseArgs } from "node:util";
import { setTimeout as delay } from "node:timers/promises";

const { values } = parseArgs({
  options: {
    origin: { type: "string", default: "https://localhost:8443" },
    project: { type: "string" },
    "env-file": { type: "string", default: ".env" },
    certificate: { type: "string" },
  },
});
assert(
  values.project && values.certificate,
  "Specify --project and --certificate for a disposable local evaluation stack.",
);
const origin = new URL(values.origin).origin;
assert(
  new URL(origin).protocol === "https:" &&
    ["localhost", "127.0.0.1"].includes(new URL(origin).hostname),
  "Only local HTTPS stacks are supported.",
);
const ca = await readFile(values.certificate);
const compose = (...args) =>
  execFileSync(
    "docker",
    [
      "compose",
      "--env-file",
      values["env-file"],
      "-p",
      values.project,
      ...args,
    ],
    { stdio: "pipe" },
  );
let cookie = "",
  userId;
async function call(path, method = "GET", body, extraHeaders = {}) {
  const headers = {
    Origin: origin,
    ...(cookie ? { Cookie: cookie } : {}),
    ...extraHeaders,
  };
  if (body !== undefined && !(body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const input = new Request(origin + path, {
    method,
    headers,
    body:
      body instanceof FormData
        ? body
        : body === undefined
          ? undefined
          : JSON.stringify(body),
  });
  const bytes = Buffer.from(await input.arrayBuffer());
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      input.url,
      { method, headers: Object.fromEntries(input.headers), ca },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const bytes = Buffer.concat(chunks);
          const data = response.headers["content-type"]?.includes(
            "application/json",
          )
            ? JSON.parse(bytes.toString())
            : null;
          resolve({
            status: response.statusCode,
            headers: response.headers,
            bytes,
            data,
          });
        });
      },
    );
    request.on("error", reject);
    request.setTimeout(10000, () =>
      request.destroy(new Error("HTTPS request timed out")),
    );
    request.end(bytes);
  });
}
try {
  const home = await call("/");
  assert.equal(home.status, 200);
  assert.match(
    home.headers["content-security-policy"],
    /frame-ancestors 'none'/,
  );
  assert.equal(home.headers["x-content-type-options"], "nosniff");
  const docs = await call("/api/docs-json");
  assert.equal(docs.status, 200);
  for (const [path, methods] of [
    ["/api/v1/public/bookmarks", ["get", "post"]],
    ["/api/v1/public/bookmarks/{id}", ["get", "put", "delete"]],
  ])
    for (const method of methods)
      assert(
        docs.data.paths[path]?.[method],
        `Missing documentation: ${method} ${path}`,
      );
  const suffix = randomUUID().slice(0, 8);
  const account = await call("/api/v1/auth/signup", "POST", {
    email: `${suffix}@example.test`,
    nickname: `Volume-${suffix}`,
    password: "Local-verification-password-123",
  });
  assert.equal(account.status, 201);
  userId = account.data.user.id;
  const session = account.headers["set-cookie"].find((value) =>
    value.startsWith("gitneapig_session="),
  );
  for (const flag of [/HttpOnly/, /Secure/, /SameSite=Lax/, /Max-Age=28800/])
    assert.match(session, flag);
  cookie = session.split(";")[0];
  assert.equal(
    (
      await call(
        "/api/v1/profile",
        "PATCH",
        { nickname: `Volume-${suffix}` },
        { Origin: "https://invalid.example" },
      )
    ).status,
    403,
  );
  const form = new FormData();
  form.set(
    "avatar",
    new Blob(
      [await readFile("docs/references/mascots/characters/primary/avatar.png")],
      { type: "image/png" },
    ),
    "avatar.png",
  );
  const upload = await call("/api/v1/profile/avatar", "POST", form);
  assert.equal(upload.status, 201);
  const avatar = upload.data.user.avatarUrl;
  assert.match(avatar, /^\/uploads\/avatars\/[0-9a-f-]+\.png$/);
  const before = await call(avatar);
  assert.equal(before.status, 200);
  assert.match(before.headers["cache-control"], /no-store/);
  console.log(
    "HTTPS certificate, security headers, OpenAPI, cookies, Origin and avatar upload: PASS",
  );
  compose("up", "-d", "--force-recreate", "backend", "frontend");
  let healthy = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      healthy = (await call("/api/v1/health")).status === 200;
    } catch {
      /* Wait for only this evaluation stack. */
    }
    if (healthy) break;
    await delay(1000);
  }
  assert(healthy, "The recreated backend did not become healthy.");
  const after = await call(avatar);
  assert.equal(after.status, 200);
  assert.deepEqual(after.bytes, before.bytes);
  assert.equal((await call("/api/v1/profile")).data.user.id, userId);
  assert.equal(
    (await call("/api/v1/profile", "PATCH", { avatarPresetKey: "default" }))
      .status,
    200,
  );
  assert.equal((await call(avatar)).status, 404);
  console.log(
    "Database and avatar survive container replacement; default replacement removes old image: PASS",
  );
} finally {
  if (userId) {
    await call("/api/v1/profile", "PATCH", {
      avatarPresetKey: "default",
    }).catch(() => {});
    compose(
      "exec",
      "-T",
      "backend",
      "node",
      "-e",
      'const {PrismaClient}=require("@prisma/client");const db=new PrismaClient();db.user.delete({where:{id:process.argv[1]}}).finally(()=>db.$disconnect());',
      userId,
    );
  }
}
