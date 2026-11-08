import { test, expect } from "@playwright/test";
test.skip(
  process.env.E2E_PWA !== "1",
  "Requires a production build/preview with E2E_PWA=1.",
);
test("installed worker provides offline shell, real simulator and cached public lessons, excluding private APIs", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => null));
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  await page.locator(".language-select").selectOption("en");
  await page.goto("/learn/git-repository");
  await expect(
    page.getByRole("heading", { name: "Git & Repository", exact: true }),
  ).toBeVisible();
  await page.goto("/reference");
  await expect(page.getByText("Sign in to continue.")).toBeVisible();
  const stored = await page.evaluate(async () => {
    const requests: string[] = [];
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      requests.push(
        ...(await cache.keys()).map((request) => new URL(request.url).pathname),
      );
    }
    return requests;
  });
  expect(stored).toContain("/api/v1/lessons/git-repository");
  expect(
    stored.some((path) =>
      /^\/api\/v1\/(auth|profile|friends|bookmarks|reference)/.test(path),
    ),
  ).toBe(false);
  expect(stored).not.toContain("/api/v1/lessons/merge");
  await context.setOffline(true);
  await page.goto("/practice?mode=free");
  const input = page.getByRole("textbox", { name: "Git command", exact: true });
  await input.fill("git status");
  await input.press("Enter");
  await expect(page.getByRole("log")).toContainText("On branch main");
  await page.goto("/learn/git-repository");
  await expect(
    page.getByRole("heading", { name: "Git & Repository", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".offline-banner")).toBeVisible();
  await context.setOffline(false);
});
test("manifest is valid and worker activation remains user-controlled", async ({
  page,
  request,
}) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.name).toBe("GitneaPig");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.length).toBeGreaterThan(0);
  const worker = await (await request.get("/sw.js")).text();
  expect(worker).toContain("SKIP_WAITING");
  expect(worker).toContain("PURGE_PRIVATE");
  await page.goto("/");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
    "href",
    "/manifest.webmanifest",
  );
});
