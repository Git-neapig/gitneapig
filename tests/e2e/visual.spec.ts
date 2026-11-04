import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`rendered surfaces, graph and console at ${viewport.width}px`, async ({
    page,
    request,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (!["error", "warning"].includes(message.type())) return;
      // Guest session probing is intentionally a 401 under the API contract.
      if (
        message.location().url.endsWith("/api/v1/auth/me") &&
        /401/.test(message.text())
      )
        return;
      errors.push(message.text());
    });
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    const directory = process.env.E2E_ARTIFACT_DIR ?? "/tmp/gitneapig-e2e";
    await mkdir(directory, { recursive: true });
    const quests = (await (await request.get("/api/v1/quests")).json()).items;
    for (const [name, path] of [
      ["home", "/"],
      ["practice", "/practice?mode=branch"],
      ["learn-practice", "/learn/branch?stage=PRACTICE"],
      ["quest", `/quests/${quests[0].slug}`],
      ["daily", "/daily-challenge"],
    ]) {
      await page.goto(path);
      await page.locator(".language-select").selectOption("en");
      await expect(page).toHaveTitle("GitneaPig");
      await expect(page.locator("main h1")).toBeVisible();
      if (name === "practice") {
        const input = page.getByRole("textbox", {
          name: "Git command",
          exact: true,
        });
        await input.fill("git switch -c visual-check");
        await input.press("Enter");
        await expect(page.locator(".graph-layout")).toContainText(
          "visual-check",
        );
        expect(
          await page.locator(".graph-layout circle").count(),
        ).toBeGreaterThan(0);
      }
      if (name === "quest" || name === "daily")
        await expect(
          page.getByRole("textbox", { name: "Git command", exact: true }),
        ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await expect(page.locator("vite-error-overlay")).toHaveCount(0);
      await expect
        .poll(() =>
          page
            .locator("img")
            .evaluateAll((images) =>
              images.every((img) => img.complete && img.naturalWidth > 0),
            ),
        )
        .toBe(true);
      await page.screenshot({
        path: `${directory}/${name}-${viewport.width}-${info.project.name}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
}
