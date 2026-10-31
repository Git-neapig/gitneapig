import { nextStreak, seoulDateKey } from "./rewards.service";
import { safeReturnTo, signupSchema } from "../common/validation";
describe("calendar and identity boundaries", () => {
  it("crosses the calendar day at midnight in Seoul", () => {
    expect(seoulDateKey(new Date("2026-09-08T14:59:59Z"))).toBe("2026-09-08");
    expect(seoulDateKey(new Date("2026-09-08T15:00:00Z"))).toBe("2026-09-09");
  });
  it("keeps the same-day streak, increments consecutive days and resets gaps", () => {
    const previous = { streak: 3, streakLastActivityDateKey: "2026-09-08" };
    expect(nextStreak(previous, "2026-09-08")).toBe(3);
    expect(nextStreak(previous, "2026-09-09")).toBe(4);
    expect(nextStreak(previous, "2026-09-10")).toBe(1);
    expect(
      nextStreak({ streak: 0, streakLastActivityDateKey: null }, "2026-09-09"),
    ).toBe(1);
  });
  it.each([
    "https://evil.example",
    "//evil.example",
    "/%2fexample.com",
    "/\\example.com",
    "/%0aexample.com",
    "/api/v1/auth/logout",
  ])("rejects unsafe returnTo %s", (value) =>
    expect(safeReturnTo(value)).toBe("/"),
  );
  it("keeps internal routes and rejects injected account fields", () => {
    expect(safeReturnTo("/practice?mode=free")).toBe("/practice?mode=free");
    expect(
      signupSchema.safeParse({
        email: "test@example.test",
        nickname: "Member",
        password: "Password123",
        xp: 1000,
      }).success,
    ).toBe(false);
  });
});
