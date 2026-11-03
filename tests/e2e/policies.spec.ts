import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import {
  privacyContactHref,
  privacyOperatingValues,
} from "../../apps/frontend/src/lib/privacy-policy";

for (const width of [1440, 390]) {
  test(`guest privacy policy shows approved operating values in all languages at ${width}px`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (!["error", "warning"].includes(message.type())) return;
      if (
        message.location().url.endsWith("/api/v1/auth/me") &&
        /401/.test(message.text())
      )
        return;
      errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/practice");
    await page.locator(".language-select").selectOption("en");
    await page
      .locator("footer")
      .getByRole("link", { name: "Privacy Policy" })
      .click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page).toHaveTitle("GitneaPig");
    const article = page.locator(".policy-page");
    const directory = process.env.E2E_ARTIFACT_DIR ?? "/tmp/gitneapig-e2e";
    await mkdir(directory, { recursive: true });
    for (const [language, heading, warning] of [
      ["ko", "개인정보 처리방침", "아직 개설되지 않은 주소"],
      ["en", "Privacy Policy", "this address has not been created"],
      ["ja", "プライバシーポリシー", "まだ作成されておらず"],
    ]) {
      await page.locator(".language-select").selectOption(language);
      await expect(
        article.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
      await expect(
        article.getByText("GitneaPig Team", { exact: true }),
      ).toBeVisible();
      await expect(
        article.getByText(privacyOperatingValues.contactEmail, { exact: true }),
      ).toBeVisible();
      const contactHref = privacyContactHref();
      if (contactHref) {
        await expect(
          article.getByRole("link", {
            name: privacyOperatingValues.contactEmail,
            exact: true,
          }),
        ).toHaveAttribute("href", contactHref);
        await expect(article).not.toContainText(warning);
      } else {
        await expect(article).toContainText(warning);
        await expect(article.locator("a[href^='mailto:']")).toHaveCount(0);
      }
      await expect(article.getByRole("listitem")).toHaveCount(6);
      await expect(article.getByRole("listitem").nth(4)).toContainText("30");
      await expect(article.getByRole("listitem").nth(5)).toContainText("30");
      await expect(page.locator("vite-error-overlay")).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `${directory}/privacy-${language}-${width}-${info.project.name}.png`,
        fullPage: true,
      });
    }
    await page.locator(".language-select").selectOption("en");
    await page
      .locator("footer")
      .getByRole("link", { name: "Terms of Service" })
      .click();
    await expect(page).toHaveURL(/\/terms$/);
    await expect(article).toContainText("GitneaPig Team");
    await expect(article).not.toContainText(
      "Operator identity, contact details and applicable policies must be finalized",
    );
    expect(errors).toEqual([]);
  });
}
