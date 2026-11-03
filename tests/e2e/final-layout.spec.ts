import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = "docs/implementation/final/evidence";
test("Learn stages, small-height panels and CJK mobile retain visible controls", async ({
  page,
}) => {
  await mkdir(output, { recursive: true });
  await page.setViewportSize({ width: 1586, height: 992 });
  await page.goto("/");
  await page.locator(".language-select").selectOption("en");
  for (const stage of ["SITUATION", "WHY", "CONCEPT", "COMMAND", "PRACTICE"]) {
    await page.goto(`/learn/staging-commit?stage=${stage}`);
    await expect(page.locator(".lesson-stage")).toBeVisible();
    if (stage === "SITUATION")
      await expect(page.locator(".conversation .message")).toHaveCount(2);
    if (stage === "WHY")
      await expect(page.locator(".comparison > div")).toHaveCount(2);
    if (stage === "CONCEPT")
      await expect(page.locator(".lesson-graph svg")).toBeVisible();
    await page.screenshot({
      path: `${output}/learn-${stage.toLowerCase()}.png`,
    });
  }
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill("git add README.md");
  await input.press("Enter");
  await expect(page).toHaveURL(/stage=RESULT/);
  await page.screenshot({ path: `${output}/learn-result.png` });
  for (const [language, width, height] of [
    ["ko", 1280, 620],
    ["ja", 390, 844],
    ["en", 640, 720],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.locator(".language-select").selectOption(language);
    for (const route of [
      "/learn/staging-commit?stage=PRACTICE",
      "/practice",
      "/daily-challenge",
    ]) {
      await page.goto(route);
      await expect(page.locator(".workspace")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const field = page.locator(".terminal-input input");
      await field.scrollIntoViewIfNeeded();
      await expect(field).toBeVisible();
      const fieldBox = await field.boundingBox();
      const navBox = (await page.locator(".lesson-navigation").count())
        ? await page.locator(".lesson-navigation").boundingBox()
        : null;
      if (fieldBox && navBox)
        expect(fieldBox.y + fieldBox.height).toBeLessThanOrEqual(navBox.y);
      await page.screenshot({
        path: `${output}/${route.split("/")[1].split("?")[0]}-${language}-${width}.png`,
        fullPage: true,
      });
    }
  }
});

test("graph and state panels hand scrolling back to the page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 620 });
  await page.goto("/");
  await page.locator(".language-select").selectOption("en");
  await page.goto("/practice");
  const panel = page.locator(".tool-content");
  await panel.hover();
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await page.mouse.wheel(0, -1000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.getByRole("tab", { name: "State", exact: true }).click();
  await panel.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await panel.hover();
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
});
