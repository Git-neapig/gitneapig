import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { solveDaily } from "./daily-helper";
const backendRequire = createRequire(resolve("apps/backend/package.json"));
backendRequire("dotenv").config({ path: ".env", quiet: true });
const { PrismaClient } = backendRequire("@prisma/client");
const ids: string[] = [];
async function signup(page: Page) {
  const suffix = randomUUID().slice(0, 8),
    nickname = `Browser-${suffix}`;
  await page.goto("/signup");
  await page.locator(".language-select").selectOption("en");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(`${suffix}@example.test`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Browser-test-password-123");
  await page
    .getByRole("textbox", { name: "Nickname", exact: true })
    .fill(nickname);
  const response = page.waitForResponse((response) =>
    response.url().endsWith("/auth/signup"),
  );
  await page.getByRole("button", { name: "Sign Up", exact: true }).click();
  const result = await response;
  expect(result.status()).toBe(201);
  ids.push((await result.json()).user.id);
  await expect(page).toHaveURL(/\/$/);
  const languageSaved = page.waitForResponse(
    (response) =>
      response.url().endsWith("/profile") &&
      response.request().method() === "PATCH",
  );
  await page.locator(".language-select").selectOption("en");
  expect((await languageSaved).status()).toBe(200);
  return nickname;
}
async function run(page: Page, command: string) {
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill(command);
  await input.press("Enter");
}
test.afterAll(async () => {
  // Delete only accounts created by this worker, never existing user data.
  if (process.env.E2E_DOCKER_PROJECT) {
    execFileSync(
      "docker",
      [
        "compose",
        "--env-file",
        process.env.E2E_DOCKER_ENV_FILE ?? ".env",
        "-p",
        process.env.E2E_DOCKER_PROJECT,
        "exec",
        "-T",
        "backend",
        "node",
        "-e",
        'const {PrismaClient}=require("@prisma/client"); const db=new PrismaClient(); db.user.deleteMany({where:{id:{in:JSON.parse(process.argv[1])}}}).finally(()=>db.$disconnect())',
        JSON.stringify(ids),
      ],
      { stdio: "pipe" },
    );
    return;
  }
  const db = new PrismaClient();
  try {
    await db.user.deleteMany({ where: { id: { in: ids } } });
  } finally {
    await db.$disconnect();
  }
});
test("member lesson rewards, Reference search, bookmarks, one-time API key and logout", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await signup(page);
  await page.goto("/learn/git-repository");
  for (let index = 0; index < 4; index++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  await run(page, "git add README.md");
  await run(page, 'git commit -m "First record"');
  await expect(page).toHaveURL(/stage=RESULT/);
  await expect(page.getByText("XP earned: +100")).toBeVisible();
  await page.goto("/profile");
  await expect(page.locator(".stat-strip")).toContainText("140");
  await page.goto("/reference");
  await expect(page.locator(".reference-command-card")).toHaveCount(8);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page.getByRole("group", { name: "Category", exact: true }).getByRole("button", { name: "Remote", exact: true }).click();
  await expect(page.locator(".reference-command-card")).toHaveCount(4);
  await page
    .getByRole("combobox", { name: "Sort", exact: true })
    .selectOption("NAME_DESC");
  await expect(page.locator(".reference-command-card h2").first()).toHaveText(
    "git remote",
  );
  await page
    .getByRole("searchbox", { name: "Search", exact: true })
    .fill("git push -u");
  await expect(page.locator(".reference-command-card")).toHaveCount(1);
  await page.locator(".reference-card-link").click();
  await page.getByRole("button", { name: "Add bookmark", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toBeVisible();
  await page.goto("/bookmarks");
  await expect(page.locator(".bookmark-list")).toContainText("git push");
  await page
    .getByRole("button", { name: "Remove bookmark", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove", exact: true })
    .click();
  await expect(page.locator(".bookmark-row")).toHaveCount(0);
  await page.goto("/profile/api-keys");
  await page
    .getByRole("textbox", { name: "Key label", exact: true })
    .fill("Browser key");
  await page
    .getByRole("button", { name: "Create API key", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("textbox")).toHaveValue(/^gnp_[\w-]{43}$/);
  const rawKey = await dialog.getByRole("textbox").inputValue();
  expect(
    (
      await context.request.get("/api/v1/public/bookmarks", {
        headers: { "X-API-Key": rawKey },
      })
    ).status(),
  ).toBe(200);
  expect((await context.request.get("/api/v1/public/bookmarks")).status()).toBe(
    401,
  );
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByText("Browser key")).toBeVisible();
  await page.getByRole("button", { name: "Revoke", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Revoke", exact: true })
    .click();
  await expect(page.getByText("Revoked", { exact: true })).toBeVisible();
  expect(
    (
      await context.request.get("/api/v1/public/bookmarks", {
        headers: { "X-API-Key": rawKey },
      })
    ).status(),
  ).toBe(401);
  await page.locator(".account-trigger").focus();
  await page.locator(".account-trigger").press("ArrowDown");
  await page.getByRole("button", { name: "Log Out", exact: true }).click();
  await expect(
    page
      .locator(".header-actions")
      .getByRole("link", { name: "Log In", exact: true }),
  ).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByText("Sign in to continue.")).toBeVisible();
  expect(errors).toEqual([]);
});
test("profile editing, uploaded avatar deletion and locale survive reload", async ({
  page,
  context,
}) => {
  await signup(page);
  await page.goto("/profile/edit");
  await page
    .getByRole("textbox", { name: "Nickname", exact: true })
    .fill(`Edited-${randomUUID().slice(0, 8)}`);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Saved.", { exact: true })).toBeVisible();
  await page
    .getByLabel("Upload image", { exact: true })
    .setInputFiles("docs/references/mascots/characters/primary/avatar.png");
  const uploaded = page.waitForResponse((response) =>
    response.url().endsWith("/profile/avatar"),
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  expect((await uploaded).status()).toBe(201);
  await page.goto("/profile");
  await expect(page.locator(".profile-heading img")).toHaveAttribute(
    "src",
    /^\/uploads\/avatars\//,
  );
  await expect
    .poll(() =>
      page
        .locator(".profile-heading img")
        .evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
        ),
    )
    .toBe(true);
  const uploadUrl = await page
    .locator(".profile-heading img")
    .getAttribute("src");
  await page.goto("/profile/edit");
  await page
    .getByRole("button", { name: "Delete uploaded image", exact: true })
    .click();
  await expect(page.getByText("Saved.", { exact: true })).toBeVisible();
  expect((await context.request.get(uploadUrl!)).status()).toBe(404);
  await page.locator(".language-select").selectOption("ja");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
});

test("six Learn bookmark stages open independently without awarding completion", async ({
  page,
  context,
}) => {
  await signup(page);
  const stages = [
    "SITUATION",
    "WHY",
    "CONCEPT",
    "COMMAND",
    "PRACTICE",
    "RESULT",
  ];
  for (const stage of stages) {
    await page.goto(`/learn/git-repository?stage=${stage}`);
    await page
      .getByRole("button", { name: "Add bookmark", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Remove bookmark", exact: true }),
    ).toBeVisible();
  }
  const bookmarks = await (
    await context.request.get("/api/v1/bookmarks")
  ).json();
  expect(bookmarks.items).toHaveLength(6);
  expect(
    new Set(bookmarks.items.map((item: { stage: string }) => item.stage)).size,
  ).toBe(6);
  const lessons = await (await context.request.get("/api/v1/lessons")).json();
  expect(
    lessons.items.find((item: { id: string }) => item.id === "lesson-1")
      .progress.completed,
  ).toBe(false);
  for (const stage of stages) {
    await page.goto("/bookmarks");
    await page.locator(`.bookmark-row a[href$="stage=${stage}"]`).click();
    await expect(page).toHaveURL(new RegExp(`stage=${stage}$`));
    await expect(
      page.locator(".lesson-stages [aria-current=step]"),
    ).toContainText(
      stage === "WHY" ? "Why" : stage[0] + stage.slice(1).toLowerCase(),
    );
  }
});

test("passed practice survives completion save failure and retries only persistence", async ({
  page,
  context,
}) => {
  await signup(page);
  let requests = 0;
  await page.route("**/api/v1/lessons/lesson-1/complete", async (route) => {
    requests++;
    if (requests === 1)
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "TEST_UNAVAILABLE",
            message: "Test-only persistence failure",
          },
        }),
      });
    else await route.continue();
  });
  await page.goto("/learn/git-repository?stage=PRACTICE");
  await run(page, "git add README.md");
  await run(page, 'git commit -m "First record"');
  await expect(page).toHaveURL(/stage=RESULT/);
  await expect(
    page.getByRole("button", { name: "Retry saving", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  const passedHistory = await page.locator(".terminal-output").innerText();
  await run(page, "git switch -c cannot-undo-pass");
  expect(await page.locator(".terminal-output").innerText()).toBe(
    passedHistory,
  );
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Retry saving", exact: true }).click();
  await expect(page.getByText("XP earned: +100")).toBeVisible();
  expect(requests).toBe(2);
  const duplicate = await context.request.post(
    "/api/v1/lessons/lesson-1/complete",
    { data: {}, headers: { Origin: new URL(page.url()).origin } },
  );
  expect((await duplicate.json()).xpAwarded).toBe(0);
  await page.goto("/profile");
  await expect(page.locator(".stat-strip")).toContainText("140");
});

test("profile menu supports hover boundaries, outside click and Escape", async ({
  page,
  isMobile,
}) => {
  await signup(page);
  const trigger = page.locator(".account-trigger"),
    menu = page.locator(".account-menu-items");
  if (!isMobile) {
    await trigger.hover();
    await expect(menu).toBeVisible();
    await menu.hover();
    await expect(menu).toBeVisible();
    await page.locator(".brand").hover();
    await expect(menu).toHaveCount(0);
  } else {
    await trigger.tap();
    await expect(menu).toBeVisible();
    await page.locator(".brand").tap();
    await expect(menu).toHaveCount(0);
  }
  await trigger.focus();
  await trigger.press("ArrowDown");
  await expect(
    menu.getByRole("link", { name: "Bookmark Integration", exact: true }),
  ).toBeVisible();
  await trigger.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.press("Enter");
  await expect(menu).toBeVisible();
  await page.locator(".brand").click();
  await expect(menu).toHaveCount(0);
});
test("login returns to the protected route without caching authenticated data", async ({
  page,
  context,
}) => {
  const nickname = await signup(page);
  if (process.env.E2E_PWA === "1") {
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => null));
    await page.reload();
  }
  await page.locator(".account-trigger").focus();
  await page.locator(".account-trigger").press("ArrowDown");
  await page.getByRole("button", { name: "Log Out", exact: true }).click();
  await expect(
    page
      .locator(".header-actions")
      .getByRole("link", { name: "Log In", exact: true }),
  ).toBeVisible();
  await page.goto("/profile");
  await page.getByRole("link", { name: "Log In", exact: true }).last().click();
  await expect(page).toHaveURL(/returnTo=%2Fprofile/);
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(`${nickname.slice("Browser-".length)}@example.test`);
  await page
    .getByLabel("Password", { exact: true })
    .fill("Browser-test-password-123");
  await page.getByRole("button", { name: "Log In", exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(
    page.getByRole("heading", { name: nickname, exact: true }),
  ).toBeVisible();
  const cookie = (await context.cookies()).find(
    (cookie) => cookie.name === "gitneapig_session",
  );
  expect(cookie?.httpOnly).toBe(true);
  if (process.env.E2E_ALLOW_SELF_SIGNED === "1")
    expect(cookie?.secure).toBe(true);
  if (process.env.E2E_PWA !== "1") return;
  await page.goto("/learn/merge");
  await expect(
    page.getByRole("heading", { name: "Merge", exact: true }),
  ).toBeVisible();
  await page.goto("/reference");
  await expect(page.locator(".reference-command-card")).toHaveCount(8);
  await page.locator(".account-trigger").focus();
  await page.locator(".account-trigger").press("ArrowDown");
  await page.getByRole("button", { name: "Log Out", exact: true }).click();
  await expect(
    page
      .locator(".header-actions")
      .getByRole("link", { name: "Log In", exact: true }),
  ).toBeVisible();
  const cached = await page.evaluate(async () => {
    const requests: string[] = [];
    for (const name of await caches.keys())
      requests.push(
        ...(await (await caches.open(name)).keys()).map(
          (request) => new URL(request.url).pathname,
        ),
      );
    return requests;
  });
  expect(cached.filter((path) => /^\/api\//.test(path))).toEqual([]);
  expect(cached.some((path) => path.startsWith("/uploads/"))).toBe(false);
  await context.setOffline(true);
  await page.goto("/profile");
  await expect(
    page.getByRole("heading", { name: nickname, exact: true }),
  ).toHaveCount(0);
  await context.setOffline(false);
});
test("two independent users can request, accept and remove a friendship", async ({
  page,
  browser,
  baseURL,
}) => {
  const a = await signup(page),
    second = await browser.newContext({
      baseURL,
      ignoreHTTPSErrors: process.env.E2E_ALLOW_SELF_SIGNED === "1",
    }),
    other = await second.newPage();
  try {
    const b = await signup(other);
    await page.goto("/friends");
    await page.getByRole("searchbox", { name: "Search nicknames" }).fill(b);
    await page.getByRole("button", { name: "Add friend", exact: true }).click();
    await other.goto("/friends");
    await other.getByRole("button", { name: "Accept", exact: true }).click();
    await expect(
      other.locator(".profile-columns").getByText(a, { exact: true }),
    ).toBeVisible();
    await other.getByRole("button", { name: "Remove", exact: true }).click();
    await other
      .getByRole("dialog")
      .getByRole("button", { name: "Remove", exact: true })
      .click();
    await expect(
      other.locator(".profile-columns").getByText(a, { exact: true }),
    ).toHaveCount(0);
  } finally {
    await second.close();
  }
});

test("Daily guest history is not imported; member completion survives a new device and retry", async ({
  page,
  context,
  browser,
  baseURL,
}) => {
  const daily = await (
    await context.request.get("/api/v1/daily-challenge/today")
  ).json();
  await page.goto("/daily-challenge");
  await page.locator(".language-select").selectOption("en");
  await solveDaily(page, daily);
  await expect(page.getByText("This challenge is complete.")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".terminal-input input")).toHaveCount(0);
  const nickname = await signup(page);
  await page.goto("/daily-challenge");
  await expect(page.locator(".terminal-input input")).toBeVisible();
  await solveDaily(page, daily);
  await expect(page.getByText("XP earned: +80")).toBeVisible();
  const other = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: process.env.E2E_ALLOW_SELF_SIGNED === "1",
  });
  try {
    const login = await other.request.post("/api/v1/auth/login", {
      data: {
        email: `${nickname.slice("Browser-".length)}@example.test`,
        password: "Browser-test-password-123",
      },
      headers: { Origin: baseURL! },
    });
    expect(login.status()).toBe(200);
    const second = await other.newPage();
    await second.goto("/daily-challenge");
    await expect(
      second.getByRole("button", { name: "Try again", exact: true }),
    ).toBeVisible();
    await expect(second.locator(".terminal-input input")).toHaveCount(0);
    const before = await (await other.request.get("/api/v1/auth/me")).json();
    await second
      .getByRole("button", { name: "Try again", exact: true })
      .click();
    await solveDaily(second, daily);
    await expect(second.getByText("Progress saved.")).toBeVisible();
    const after = await (await other.request.get("/api/v1/auth/me")).json();
    expect(after.user.xp).toBe(before.user.xp);
  } finally {
    await other.close();
  }
});

test("Reference copies its own example and renders all three localized versions", async ({
  page,
  context,
  browserName,
}, info) => {
  test.skip(
    browserName !== "chromium",
    "Clipboard permission coverage uses Chromium; content and layout are covered across engines.",
  );
  await signup(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/reference/diff");
  const examples = page.locator(".reference-example .command-copy");
  await expect(examples).toHaveCount(2);
  for (let index = 0; index < 2; index++) {
    const example = examples.nth(index);
    await example.getByRole("button").click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await example.locator("pre").innerText(),
    );
  }
  for (const language of ["ko", "en", "ja"]) {
    await page.locator(".language-select").selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/gitneapig-revision/reference-${language}-${info.project.name}.png`,
      fullPage: true,
    });
  }
});
