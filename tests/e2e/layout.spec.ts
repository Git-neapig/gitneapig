import { test, expect } from "@playwright/test";
test("320px layout and reduced-motion hero keep all text visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/");
  for (const lang of ["en", "ja", "ko"]) {
    await page.locator(".language-select").selectOption(lang);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const dimensions = await page
      .locator(".hero-terminal-output")
      .evaluate((el) => ({
        scroll: el.scrollHeight,
        client: el.clientHeight,
        css: getComputedStyle(el).height,
      }));
    await page.screenshot({
      path: "/tmp/gitneapig-hero-320.png",
      fullPage: true,
    });
    expect(dimensions.scroll, JSON.stringify(dimensions)).toBeLessThanOrEqual(
      dimensions.client + 1,
    );
  }
});
test("modal restores focus and invalid paths are rejected without crashing", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".language-select").selectOption("en");
  await page.goto("/practice?mode=free");
  await page.getByRole("tab", { name: "State", exact: true }).click();
  const opener = page.getByRole("button", { name: "New file", exact: true });
  await opener.click();
  await page
    .getByRole("textbox", { name: "File name", exact: true })
    .fill("../escape");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText("Check the entered information.")).toBeVisible();
  await page.getByRole("dialog").press("Escape");
  await expect(opener).toBeFocused();
});
