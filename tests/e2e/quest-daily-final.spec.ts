import { test, expect, type Page } from "@playwright/test";
import type { DailyChallengeDefinition } from "@gitneapig/shared";
import { mkdir } from "node:fs/promises";
import { solveDaily } from "./daily-helper";

const output = process.env.E2E_ARTIFACT_DIR ?? "/tmp/gitneapig-final";
async function run(page: Page, command: string) {
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill(command);
  await input.press("Enter");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator(".language-select").selectOption("en");
  await mkdir(output, { recursive: true });
});

test("Quest hints number each objective and preserve state", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1586, height: 992 });
  await page.goto("/quests/feature-branch");
  await expect(page.locator(".quest-hint-guidance")).toContainText(
    "three levels",
  );
  await run(page, " ");
  await expect(page.locator(".team-messages .message")).toHaveCount(1);
  for (let level = 1; level <= 3; level++) {
    await run(page, "hint");
    await expect(page.locator(".team-messages .message").last()).toContainText(
      `(${level}/3)`,
    );
  }
  await run(page, "hint");
  await expect(page.locator(".team-messages .message")).toHaveCount(4);
  await expect(page.locator(".objective-list .is-complete")).toHaveCount(0);
  await run(page, "git status");
  await run(page, "hint");
  await expect(page.locator(".team-messages .message").last()).toContainText(
    "(1/3)",
  );
  await page.screenshot({
    path: `${output}/quest-hints-${info.project.name}.png`,
    fullPage: true,
  });
  await run(page, "git switch -c feature/login");
  await run(page, "git add login.txt");
  await run(page, 'git commit -m "Add login draft"');
  await page.getByRole("button", { name: "Close issue", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Quest Complete!", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `${output}/quest-result-${info.project.name}.png`,
  });
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.locator(".quest-result-final")).toHaveCount(0);
  await expect(page.locator(".objective-list .is-complete")).toHaveCount(4);
});

test("Daily hints stop at three and actual completion retains a read-only workspace", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1536, height: 1024 });
  const response = await page.request.get("/api/v1/daily-challenge/today");
  const daily: DailyChallengeDefinition = await response.json();
  expect(daily.hints).toHaveLength(3);
  await page.goto("/daily-challenge");
  await run(page, " ");
  await expect(page.locator(".daily-guide")).not.toContainText("(1/3)");
  for (let level = 1; level <= 3; level++) {
    await run(page, "hint");
    await expect(page.locator(".daily-guide")).toContainText(`(${level}/3)`);
  }
  await run(page, "hint");
  await expect(page.locator(".daily-guide")).toContainText("(3/3)");
  await expect(page.locator(".daily-guide")).not.toContainText("git ");
  await page.screenshot({
    path: `${output}/daily-progress-${info.project.name}.png`,
    fullPage: true,
  });
  await solveDaily(page, daily);
  await expect(page.locator(".daily-completion-banner")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toHaveAttribute("readonly", "");
  await expect(page.locator(".terminal-command")).not.toHaveCount(0);
  await page.screenshot({
    path: `${output}/daily-complete-${info.project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator(".daily-completion-banner")).toBeVisible();
  await expect(page.locator(".daily-no-snapshot")).toBeVisible();
  await expect(page.locator(".workspace")).toHaveCount(0);
  await page.locator(".daily-completion-banner button").click();
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".terminal-output")).toHaveText("");
  expect(
    await page.evaluate(() =>
      JSON.parse(
        sessionStorage.getItem("gitneapig-guest-daily-challenge-v1") ?? "[]",
      ),
    ),
  ).toContain(daily.id);
});
