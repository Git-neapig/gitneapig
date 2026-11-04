import { test, expect, type Page } from "@playwright/test";
async function run(page: Page, command: string) {
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill(command);
  await input.press("Enter");
}
test("all five guest quests execute real repository and collaboration transitions", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.locator(".language-select").selectOption("en");
  const quests = (await (await request.get("/api/v1/quests")).json()).items;
  const commands = [
    [
      "git status",
      "git checkout -b feature/login",
      "git add login.txt",
      'git commit -m "Add login draft"',
    ],
    [
      "git diff",
      "git add README.md",
      "git diff --staged",
      'git commit -m "Improve team docs"',
    ],
    ["git push origin feature/login"],
    ["git fetch", "git merge origin/main", "git push"],
    ["git merge feature/login"],
  ];
  for (let index = 0; index < quests.length; index++) {
    await page.goto(`/quests/${quests[index].slug}`);
    await expect(
      page.getByRole("textbox", { name: "Git command", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Hints", exact: true }),
    ).toHaveCount(0);
    for (let hint = 0; hint < 3; hint++) await run(page, "hint");
    await expect(page.locator(".team-messages .message")).toHaveCount(4);
    for (const command of commands[index]) await run(page, command);
    if (index === 2) {
      await page
        .getByRole("button", { name: "Open Pull Request", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Acknowledge review", exact: true })
        .click();
    }
    if (index === 4) {
      await page.getByRole("tab", { name: "State", exact: true }).click();
      await page
        .getByRole("button", { name: "Edit file: app.txt", exact: true })
        .click();
      await page
        .getByRole("textbox", { name: "File content", exact: true })
        .fill("title=Welcome team\nstatus=ready\n");
      await page.getByRole("button", { name: "Save", exact: true }).click();
      for (const command of [
        "git add app.txt",
        'git commit -m "Resolve title"',
        "git push",
      ])
        await run(page, command);
    }
    await page
      .getByRole("button", { name: "Close issue", exact: true })
      .click();
    await expect(page.getByText("This challenge is complete.")).toBeVisible();
  }
});
test("daily has three terminal hints and can be completed from the live assignment", async ({
  page,
  request,
}) => {
  const daily = await (
    await request.get("/api/v1/daily-challenge/today")
  ).json();
  await page.goto("/");
  await page.locator(".language-select").selectOption("en");
  await page.goto("/daily-challenge");
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toBeVisible();
  for (let index = 1; index <= 3; index++) {
    await run(page, "hint");
    await expect(page.locator(".daily-guide")).toContainText(`(${index}/3)`);
  }
  await run(page, "hint");
  await expect(page.locator(".daily-guide")).toContainText("(3/3)");
  const conditions = daily.successConditions as {
    type: string;
    branchName?: string;
    messageContains?: string;
  }[];
  const branch = conditions.find(
    (condition) =>
      condition.type === "CURRENT_BRANCH" &&
      condition.branchName === "feature/daily",
  );
  if (branch) await run(page, "git switch -c feature/daily");
  else if (conditions.some((condition) => condition.type === "COMMIT_EXISTS")) {
    await run(page, "git add .");
    await run(page, 'git commit -m "Daily docs"');
  } else if (
    daily.initialState.branches.some(
      (branch: { name: string }) => branch.name === "feature/login",
    )
  ) {
    await run(page, "git merge feature/login");
    if (
      await page
        .getByRole("log")
        .getByText(/CONFLICT/)
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
      await run(page, "git add .");
      await run(page, 'git commit -m "Resolve title"');
    }
  } else await run(page, "git add notes.txt");
  await expect(page.getByText("This challenge is complete.")).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Git command", exact: true }),
  ).toBeVisible();
});
