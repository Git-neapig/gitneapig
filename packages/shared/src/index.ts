export type Language = "ko" | "en" | "ja";
export type LocalizedText = Record<Language, string>;
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export * from "./content";
export * from "./api";
export type LevelProgress = {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
};

export function calculateLevel(totalXp: number): LevelProgress {
  if (!Number.isSafeInteger(totalXp) || totalXp < 0)
    throw new RangeError("XP must be a nonnegative safe integer");
  const level = Math.floor((1 + Math.sqrt(1 + (4 * totalXp) / 30)) / 2);
  const currentLevelXp = totalXp - 30 * level * (level - 1);
  const nextLevelXp = 60 * level;
  return {
    level,
    currentLevelXp,
    nextLevelXp,
    progressPercent: Math.min(
      99,
      Math.floor((currentLevelXp / nextLevelXp) * 100),
    ),
  };
}
