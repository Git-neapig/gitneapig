// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import i18n from "../lib/i18n";
import {
  privacyContactHref,
  privacyOperatingValues,
} from "../lib/privacy-policy";
import { PolicyPage } from "./policies";

afterEach(cleanup);

describe("approved privacy operating values", () => {
  const configuredContact = privacyOperatingValues.contactEmail;
  beforeEach(() => {
    privacyOperatingValues.contactEmail = "privacy@PLACEHOLDER";
  });
  afterEach(() => {
    privacyOperatingValues.contactEmail = configuredContact;
  });
  it("keeps the approved operator, placeholder and deadlines centralized", () => {
    expect(privacyOperatingValues.operatorName).toBe("GitneaPig Team");
    expect(privacyOperatingValues.contactEmail).toBe("privacy@PLACEHOLDER");
    expect(privacyOperatingValues.retention.confirmedAccountDeletionDays).toBe(
      30,
    );
    expect(privacyOperatingValues.retention.operationalLogMaxDays).toBe(30);
  });

  it.each(["ko", "en", "ja"] as const)(
    "renders all six retention rules and a nonfunctional placeholder in %s",
    async (language) => {
      await i18n.changeLanguage(language);
      const { container } = render(<PolicyPage type="privacy" />);
      expect(screen.getByText("GitneaPig Team")).toBeTruthy();
      expect(screen.getByText("privacy@PLACEHOLDER")).toBeTruthy();
      expect(container.querySelector("a[href^='mailto:']")).toBeNull();
      expect(container.querySelector("time")?.dateTime).toBe(
        privacyOperatingValues.updatedAt,
      );
      const rules = screen.getAllByRole("listitem");
      expect(rules).toHaveLength(6);
      for (const [index, category] of (
        [
          "accountAndProfile",
          "relatedUserData",
          "uploadedAvatars",
          "apiKeyMetadata",
        ] as const
      ).entries()) {
        expect(rules[index].textContent).toBe(
          privacyOperatingValues.retention[category][language],
        );
      }
      expect(rules[4].textContent).toContain("30");
      expect(rules[5].textContent).toContain("30");
      const warning = {
        ko: "아직 개설되지 않은 주소",
        en: "this address has not been created",
        ja: "まだ作成されておらず",
      }[language];
      expect(screen.getByText(warning, { exact: false })).toBeTruthy();
    },
  );

  it.each([
    "privacy@PLACEHOLDER",
    "privacy@placeholder.invalid",
    "",
    "privacy@example.test\nBcc:other@example.test",
  ])("does not activate invalid or placeholder contact %s", (email) => {
    expect(privacyContactHref(email)).toBeUndefined();
  });

  it("activates a valid contact by changing only the centralized value", async () => {
    await i18n.changeLanguage("en");
    const original = privacyOperatingValues.contactEmail;
    try {
      privacyOperatingValues.contactEmail = "privacy@example.test";
      render(<PolicyPage type="privacy" />);
      expect(
        screen
          .getByRole("link", { name: "privacy@example.test" })
          .getAttribute("href"),
      ).toBe("mailto:privacy@example.test");
      expect(screen.queryByText(/Placeholder contact:/)).toBeNull();
    } finally {
      privacyOperatingValues.contactEmail = original;
    }
  });
});
