import type { Page } from "@playwright/test";
import type { DailyChallengeDefinition } from "@gitneapig/shared";

export async function solveDaily(page: Page, daily: DailyChallengeDefinition) {
  async function run(command: string) {
    const input = page.getByRole("textbox", {
      name: "Git command",
      exact: true,
    });
    await input.fill(command);
    await input.press("Enter");
  }
  if (
    daily.successConditions.some(
      (c) => c.type === "CURRENT_BRANCH" && c.branchName === "feature/daily",
    )
  ) {
    await run("git switch -c feature/daily");
  } else if (daily.successConditions.some((c) => c.type === "COMMIT_EXISTS")) {
    await run("git add README.md");
    await run('git commit -m "Daily docs"');
  } else if (
    daily.initialState.branches.some((b) => b.name === "feature/login")
  ) {
    await run("git merge feature/login");
    if (
      await page
        .locator(".terminal-error")
        .filter({ hasText: "CONFLICT" })
        .count()
    ) {
      await page.getByRole("tab", { name: "State", exact: true }).click();
      await page
        .getByRole("button", { name: "Edit file: app.txt", exact: true })
        .click();
      await page
        .getByRole("textbox", { name: "File content", exact: true })
        .fill("title=Together\nstatus=ready\n");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await run("git add app.txt");
      await run('git commit -m "Resolve title"');
    }
  } else await run("git add notes.txt");
}
