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
test("six account routes share summary and sticky navigation; stage tabs and avatar feedback", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1672, height: 941 });
  await page.goto("/signup");
  const suffix = randomUUID().slice(0, 8);
  const response = await page.request.post("/api/v1/auth/signup", {
    headers: { Origin: new URL(page.url()).origin },
    data: {
      email: `${suffix}@example.test`,
      nickname: `Final-${suffix}`,
      password: "Account-final-test-123",
    },
  });
  expect(response.status()).toBe(201);
  ids.push((await response.json()).user.id);
  expect(
    (
      await page.request.patch("/api/v1/profile", {
        headers: { Origin: new URL(page.url()).origin },
        data: { language: "en" },
      })
    ).status(),
  ).toBe(200);
  await page.goto("/profile");
  for (const route of [
    "/profile",
    "/profile/edit",
    "/friends",
    "/bookmarks",
    "/profile/achievements",
    "/profile/api-keys",
  ]) {
    await page.goto(route);
    await expect(page.locator(".profile-heading h1")).toHaveText(
      `Final-${suffix}`,
    );
    await expect(page.locator(".account-navigation a.active")).toHaveAttribute(
      "href",
      route,
    );
    await expect(page.locator(".account-navigation a")).toHaveCount(6);
  }
  await expect(page.locator(".integration-guide")).toHaveCount(0);
  for (const stage of ["SITUATION", "PRACTICE"]) {
    expect(
      (
        await page.request.post("/api/v1/bookmarks", {
          headers: { Origin: new URL(page.url()).origin },
          data: { targetType: "LESSON", targetId: "lesson-1", stage },
        })
      ).status(),
    ).toBe(201);
  }
  await page.locator('.account-navigation a[href="/bookmarks"]').click();
  await expect(page.locator(".bookmark-row")).toHaveCount(2);
  await expect(
    page.locator('.bookmark-row a[href$="?stage=PRACTICE"]'),
  ).toHaveCount(1);
  await page.screenshot({
    path: testInfo.outputPath("account-bookmarks-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Quests", exact: true }).click();
  await expect(page.locator(".bookmark-row")).toHaveCount(0);
  await page.goBack();
  await expect(page.locator(".account-navigation a.active")).toHaveAttribute(
    "href",
    "/profile/api-keys",
  );
  await page.goto("/profile/edit");
  await page
    .locator('input[type="file"]')
    .setInputFiles("docs/references/mascots/logo/navbar-mascot.png");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator(".settings-form [role=status]")).toContainText(
    "Saved",
  );
  await expect(page.locator(".settings-form [role=status]")).toHaveCount(0, {
    timeout: 3000,
  });
  await expect(page.locator(".profile-heading img")).toHaveAttribute(
    "src",
    /^\/uploads\//,
  );
  await page
    .getByRole("button", { name: "Delete uploaded image", exact: true })
    .click();
  await expect(page.locator(".profile-heading img")).not.toHaveAttribute(
    "src",
    /^\/uploads\//,
  );
  await expect(page.locator(".settings-form [role=status]")).toHaveCount(0);
  await page.mouse.wheel(0, 600);
  await expect
    .poll(async () =>
      Math.round(
        (await page.locator(".account-navigation").boundingBox())?.y ?? -1,
      ),
    )
    .toBe(64);
  await expect
    .poll(async () =>
      Math.round((await page.locator(".app-header").boundingBox())?.y ?? -1),
    )
    .toBe(0);
  await page
    .locator(".account-navigation")
    .screenshot({ path: testInfo.outputPath("account-navigation-sticky.png") });
  await page.screenshot({ path: testInfo.outputPath("account-sticky.png") });
});

test("consecutive avatar saves restart feedback and account routes fit mobile locales", async ({
  page,
}, testInfo) => {
  await page.goto("/signup");
  const suffix = randomUUID().slice(0, 8);
  const origin = new URL(page.url()).origin;
  const created = await page.request.post("/api/v1/auth/signup", {
    headers: { Origin: origin },
    data: {
      email: `${suffix}@example.test`,
      nickname: `Mobile-${suffix}`,
      password: "Account-final-test-123",
    },
  });
  expect(created.status()).toBe(201);
  ids.push((await created.json()).user.id);
  expect(
    (
      await page.request.patch("/api/v1/profile", {
        headers: { Origin: origin },
        data: { language: "en" },
      })
    ).status(),
  ).toBe(200);
  await page.goto("/profile/edit");
  const status = page.locator(".settings-form [role=status]");
  async function upload() {
    await page
      .locator('input[type="file"]')
      .setInputFiles("docs/references/mascots/logo/navbar-mascot.png");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(status).toHaveText("Saved.");
  }
  await upload();
  // The pause deliberately crosses the first timer's deadline after the second upload.
  await page.waitForTimeout(1100);
  await upload();
  await page.waitForTimeout(1100);
  await expect(status).toHaveText("Saved.");
  await expect(status).toHaveCount(0, { timeout: 1500 });
  await page
    .getByRole("button", { name: "Delete uploaded image", exact: true })
    .click();
  await expect(page.locator(".profile-heading img")).not.toHaveAttribute(
    "src",
    /^\/uploads\//,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  for (const language of ["ko", "en", "ja"]) {
    expect(
      (
        await page.request.patch("/api/v1/profile", {
          headers: { Origin: origin },
          data: { language },
        })
      ).status(),
    ).toBe(200);
    for (const route of [
      "/profile",
      "/profile/edit",
      "/friends",
      "/bookmarks",
      "/profile/achievements",
      "/profile/api-keys",
    ]) {
      await page.goto(route);
      await expect(page.locator(".profile-heading h1")).toHaveText(
        `Mobile-${suffix}`,
      );
      expect(
        (await page.locator(".profile-heading > div").boundingBox())?.width,
      ).toBeGreaterThan(200);
      const active = page.locator(".account-navigation a.active");
      await expect(active).toHaveAttribute("href", route);
      await active.scrollIntoViewIfNeeded();
      await expect(active).toBeInViewport();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
    await page.screenshot({
      path: testInfo.outputPath(`account-mobile-${language}.png`),
      fullPage: true,
    });
  }
});
