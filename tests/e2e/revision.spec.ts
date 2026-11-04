import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const output = process.env.E2E_ARTIFACT_DIR ?? "/tmp/gitneapig-revision";
async function run(page: Page, command: string) {
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill(command);
  await input.press("Enter");
}
test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator(".language-select").selectOption("en");
});

test("Result deep links never complete a lesson; real success saves and Back does not loop", async ({
  page,
}) => {
  const completions: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/complete")) completions.push(request.url());
  });
  await page.goto("/learn/staging-commit?stage=RESULT");
  await expect(
    page.getByRole("heading", { name: "Complete the practice goal first" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      sessionStorage.getItem("gitneapig-guest-lessons-v1"),
    ),
  ).toBeNull();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("button", { name: "View solution" })).toHaveCount(
    0,
  );
  await run(page, "git add .");
  await expect(page).toHaveURL(/stage=PRACTICE/);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await run(page, "git add README.md");
  await expect(page).toHaveURL(/stage=RESULT/);
  await expect(page.getByText("This challenge is complete.")).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page).toHaveURL(/stage=PRACTICE/);
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.locator(".terminal-output")).toHaveText("");
  await page.getByRole("button", { name: "View solution" }).click();
  await expect(page.getByRole("dialog")).toContainText("git add README.md");
  await expect(page.getByRole("dialog")).not.toContainText("git commit -m");
  await page.getByRole("dialog").press("Escape");
  await expect(page.locator(".terminal-output")).toHaveText("");
  await expect(page).toHaveURL(/stage=PRACTICE/);
  await page.goto("/practice");
  await page.goto("/learn/staging-commit?stage=PRACTICE");
  await expect(
    page.getByRole("button", { name: "View solution" }),
  ).toBeVisible();
  await expect(page.locator(".terminal-output")).toHaveText("");
  expect(completions).toEqual([]);
});

test("consecutive hyphens, Backspace and retyping retain every character", async ({
  page,
}, info) => {
  await page.goto("/practice");
  await mkdir(output, { recursive: true });
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.click();
  for (let count = 1; count <= 18; count++) {
    await input.press("-");
    await expect(input).toHaveValue("-".repeat(count));
  }
  await expect(input).toHaveCSS("font-variant-ligatures", "none");
  await input.screenshot({
    path: `${output}/hyphens-18-${info.project.name}.png`,
  });
  for (let count = 17; count >= 0; count--) {
    await input.press("Backspace");
    await expect(input).toHaveValue("-".repeat(count));
    if (count === 9)
      await input.screenshot({
        path: `${output}/hyphens-backspace-${info.project.name}.png`,
      });
  }
  await input.pressSequentially("git diff --staged", { delay: 60 });
  await input.screenshot({
    path: `${output}/hyphens-command-${info.project.name}.png`,
  });
  await expect(input).toHaveValue("git diff --staged");
  await input.press("Enter");
  await expect(page.locator(".terminal-command")).toHaveText(
    "$ git diff --staged",
  );
  await expect(page.locator(".terminal-error")).toHaveCount(0);
  await input.fill("draft --");
  await page.reload();
  await expect(input).toHaveValue("");
  await expect(page.locator(".terminal-output")).toHaveText("");
});

test("deleted files disappear immediately while Git deletion remains stageable", async ({
  page,
}) => {
  await page.goto("/practice?mode=merge");
  await expect(
    page.getByRole("heading", { name: "Free Sandbox" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "State", exact: true }).click();
  await page
    .getByRole("button", { name: "Edit file: README.md", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Delete file", exact: true })
    .click();
  await expect(page.locator(".file-list")).not.toContainText("README.md");
  await expect(page.locator(".change-list").first()).toContainText("README.md");
  await run(page, "git add README.md");
  await run(page, 'git commit -m "Remove README"');
  await expect(page.locator(".terminal-output")).toContainText("Remove README");
  await page.getByRole("button", { name: "New file" }).click();
  await page
    .getByRole("textbox", { name: "File name", exact: true })
    .fill("src/relative.txt");
  await page
    .getByRole("textbox", { name: "File content", exact: true })
    .fill("relative path remains supported");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator(".file-list")).toContainText("src/relative.txt");
});

test("Quest hints have three levels per objective without executing or advancing it", async ({
  page,
}) => {
  await page.goto("/quests/feature-branch");
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill(" ");
  await input.press("Enter");
  await expect(page.locator(".team-messages .message")).toHaveCount(1);
  for (let count = 0; count < 4; count++) await run(page, "hint");
  await expect(page.locator(".team-messages .message")).toHaveCount(4);
  await expect(page.locator(".objective-list .is-complete")).toHaveCount(0);
  await run(page, "git status");
  await run(page, "hint");
  await expect(page.locator(".team-messages .message")).toHaveCount(5);
  await expect(page.locator(".team-messages .message").last()).toContainText(
    "Work on feature/login",
  );
  await expect(page.locator(".objective-list .is-complete")).toHaveCount(1);
});

test("terminal scroll hands over to page at both boundaries", async ({
  page,
  isMobile,
}) => {
  test.skip(
    isMobile,
    "Pointer wheel test; touch scrolling is verified by responsive UI checks.",
  );
  await page.setViewportSize({ width: 1100, height: 620 });
  await page.goto("/practice");
  const terminal = page.locator(".terminal-output");
  await terminal.hover();
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  for (let index = 0; index < 25; index++) await run(page, "git log");
  await terminal.evaluate((el) => {
    el.scrollTop = el.scrollHeight / 2;
  });
  await terminal.hover();
  const before = await page.evaluate(() => window.scrollY);
  const middle = await terminal.evaluate((el) => el.scrollTop);
  await page.mouse.wheel(0, 100);
  await expect
    .poll(() => terminal.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(middle);
  expect(await page.evaluate(() => window.scrollY)).toBe(before);
  await terminal.evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect.poll(() => terminal.evaluate((el) => el.scrollTop)).toBe(0);
  await page.mouse.wheel(0, -1000);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await terminal.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await terminal.hover();
  const top = await page.evaluate(() => window.scrollY);
  await page.mouse.wheel(0, 300);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(top);
});
