import { describe, expect, it } from "vitest";
import { calculateLevel } from "./index";
describe("level thresholds", () => {
  it.each([
    [0, 1],
    [59, 1],
    [60, 2],
    [179, 2],
    [180, 3],
    [3960, 12],
    [4679, 12],
    [4680, 13],
  ])("%i XP yields level %i", (xp, level) => {
    expect(calculateLevel(xp).level).toBe(level);
  });
  it("returns within-level progress", () =>
    expect(calculateLevel(150)).toEqual({
      level: 2,
      currentLevelXp: 90,
      nextLevelXp: 120,
      progressPercent: 75,
    }));
  it.each([-1, 1.5, NaN, Infinity])("rejects invalid XP %s", (xp) =>
    expect(() => calculateLevel(xp)).toThrow(RangeError),
  );
});
