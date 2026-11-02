import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { createRequire } from "node:module";
import { resolve } from "node:path";
const backendRequire = createRequire(resolve("apps/backend/package.json"));
backendRequire("dotenv").config({ path: ".env", quiet: true });
const { PrismaClient } = backendRequire("@prisma/client");
const ids: string[] = [];
test.afterAll(async () => {
  const db = new PrismaClient();
  try {
    await db.user.deleteMany({ where: { id: { in: ids } } });
  } finally {
    await db.$disconnect();
  }
});
test("Reference 30-command catalog, filter, bookmark, isolated copy and localized responsive detail", async ({
  page,
  context,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto("/signup");
  const suffix = randomUUID().slice(0, 8);
  const origin = new URL(page.url()).origin;
  const signup = await page.request.post("/api/v1/auth/signup", {
    headers: { Origin: origin },
    data: {
      email: `ref-${suffix}@example.test`,
      nickname: `Ref-${suffix}`,
      password: "Reference-final-123",
    },
  });
  expect(signup.status()).toBe(201);
  ids.push((await signup.json()).user.id);
  expect(
    (
      await page.request.patch("/api/v1/profile", {
        headers: { Origin: origin },
        data: { language: "en" },
      })
    ).status(),
  ).toBe(200);
  await page.goto("/reference");
  await expect(page.locator(".reference-command-card")).toHaveCount(8);
  const catalogResponse = await page.request.get(
    "/api/v1/reference/commands?pageSize=100",
  );
  expect(catalogResponse.status()).toBe(200);
  const catalog = await catalogResponse.json();
  expect(catalog.totalItems).toBe(30);
  for (const item of catalog.items) {
    const detail = await page.request.get(
      `/api/v1/reference/commands/${item.key}`,
    );
    expect(detail.status()).toBe(200);
    expect((await detail.json()).options.length).toBeGreaterThan(0);
  }
  await page.screenshot({
    path: info.outputPath("reference-list-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page).toHaveURL(/page=2/);
  await page
    .getByRole("group", { name: "Category", exact: true })
    .getByRole("button", { name: "Setup", exact: true })
    .click();
  await expect(page.locator(".reference-command-card")).toHaveCount(3);
  await expect(page).toHaveURL(/page=1/);
  await page
    .getByRole("group", { name: "Difficulty", exact: true })
    .getByRole("button", { name: "Advanced", exact: true })
    .click();
  await expect(page.locator(".reference-command-card")).toHaveCount(0);
  await page.goto("/reference?q=--force-with-lease");
  await expect(page.locator(".reference-command-card")).toHaveCount(1);
  await page.locator(".reference-card-link").click();
  await expect(page.locator(".reference-detail-heading h1")).toHaveText(
    "git push",
  );
  await expect(page.locator(".reference-detail-heading .badge")).toHaveText(
    "Beginner",
  );
  await page.getByRole("button", { name: "Add bookmark", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Remove bookmark", exact: true }),
  ).toBeVisible();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  for (const example of await page
    .locator(".reference-example .command-copy")
    .all()) {
    await example.getByRole("button").click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await example.locator("pre").innerText(),
    );
  }
  await page.locator("h1").click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath("reference-push-desktop.png"),
    fullPage: true,
  });
  await page.goto("/reference/reset");
  await expect(page.locator(".reference-detail-heading .badge")).toHaveText(
    "Advanced",
  );
  await expect(page.locator(".reference-support")).toContainText(
    "not executable",
  );
  await expect(page.locator(".reference-support a")).toHaveCount(0);
  for (const language of ["ko", "en", "ja"]) {
    await page.locator(".language-select").selectOption(language);
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".reference-options")).toBeVisible();
    await page.screenshot({
      path: info.outputPath(`reference-reset-mobile-${language}.png`),
      fullPage: true,
    });
  }
  expect(errors).toEqual([]);
});
