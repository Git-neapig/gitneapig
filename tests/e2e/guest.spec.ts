import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const output = process.env.E2E_ARTIFACT_DIR ?? "/tmp/gitneapig-e2e";
async function english(page: Page) {
  await page.goto("/");
  await page.getByRole("combobox", { name: "언어" }).selectOption("en");
}
async function run(page: Page, command: string) {
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill(command);
  await input.press("Enter");
}
test.beforeEach(async ({ page }) => {
  await english(page);
});
test("home loads assets, has meaningful content and responds to navigation", async ({
  page,
}, info) => {
  await expect(page).toHaveTitle("GitneaPig");
  await expect(
    page.getByRole("heading", { name: "GitneaPig", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every((image) => image.complete && image.naturalWidth > 0),
        ),
    )
    .toBe(true);
  await mkdir(output, { recursive: true });
  await page.screenshot({ path: `${output}/home-${info.project.name}.png` });
  await page.getByRole("link", { name: "Open Sandbox", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toBeVisible();
});
test("real file editing, staging, commits, graph, diff, history and reset", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/practice?mode=free");
  await page.getByRole("tab", { name: "State", exact: true }).click();
  await page.getByRole("button", { name: "New file", exact: true }).click();
  await page
    .getByRole("textbox", { name: "File name", exact: true })
    .fill("browser.txt");
  await page
    .getByRole("textbox", { name: "File content", exact: true })
    .fill("First version\n");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await run(page, "git add browser.txt");
  await run(page, 'git commit -m "Browser commit"');
  await expect(page.getByRole("log")).toContainText("Browser commit");
  await page.getByRole("tab", { name: "Graph", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Browser commit");
  const height = await page
    .locator(".workspace")
    .evaluate((el) => el.getBoundingClientRect().height);
  for (let index = 0; index < 18; index++) await run(page, "git log");
  expect(
    await page
      .locator(".workspace")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBe(height);
  expect(
    await page
      .getByRole("log")
      .evaluate((el) => el.scrollHeight > el.clientHeight),
  ).toBe(true);
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.press("ArrowUp");
  await expect(input).toHaveValue("git log");
  await input.press("ArrowDown");
  await expect(input).toHaveValue("");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("Browser commit");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset", exact: true })
    .click();
  await expect(page.getByRole("log")).toHaveText("");
  await page.screenshot({
    path: `${output}/practice-${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("six-stage guest lesson preserves practice when navigating backward and never submits XP", async ({
  page,
}) => {
  const completions: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/complete")) completions.push(request.url());
  });
  await page.goto("/learn/git-repository");
  for (let index = 0; index < 4; index++) {
    await expect(
      page.locator('.lesson-stages [aria-current="step"] span'),
    ).toHaveText(String(index + 1));
    await page.getByRole("button", { name: "Next", exact: true }).click();
    await expect(
      page.locator('.lesson-stages [aria-current="step"] span'),
    ).toHaveText(String(index + 2));
  }
  const notice = page.locator(".pwa-notice");
  if (await notice.isVisible()) {
    expect(
      await notice.evaluate((element) => getComputedStyle(element).position),
    ).toBe("static");
    const noticeBox = await notice.boundingBox(),
      mainBox = await page.locator("main").boundingBox();
    expect(noticeBox!.y + noticeBox!.height).toBeLessThanOrEqual(mainBox!.y);
  }
  await expect(
    page.getByRole("button", { name: "Next", exact: true }),
  ).toBeDisabled();
  await run(page, "git add README.md");
  await run(page, 'git commit -m "First record"');
  await expect(page).toHaveURL(/stage=RESULT/);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("First record");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByText("Sign in to save your progress.")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Practice More", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "Next Lesson", exact: true }),
  ).toHaveAttribute("href", "/learn/staging-commit");
  expect(completions).toEqual([]);
});
test("reference is gated and command CTA never executes a command", async ({
  page,
}) => {
  await page.goto("/reference");
  await expect(page.getByText("Sign in to continue.")).toBeVisible();
  await page.goto("/practice?mode=free&command=push");
  await expect(page.getByRole("tab", { name: "Command Guide" })).toHaveCount(0);
  await expect(page.getByRole("log")).toHaveText("");
  await expect(page.getByRole("textbox", { name: "Git command" })).toHaveValue(
    "",
  );
});
test("language changes keep routes and responsive layouts within the viewport", async ({
  page,
}) => {
  for (const language of ["ja", "ko", "en"]) {
    await page.locator(".language-select").selectOption(language);
    await page.goto("/practice");
    await expect(page.locator("html")).toHaveAttribute("lang", language);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator(".practice-picker")).toHaveCount(0);
    await expect(page.locator(".workspace")).toBeVisible();
  }
});
