import { commandRegistry, referenceRegistry } from "@gitneapig/shared";
import { references } from "./reference";
import { referenceOptions } from "./reference-options";
import { lessons } from "./lessons";
import { quests } from "./quests";
it("publishes all 30 classified and translated references without inventing simulator support or links", () => {
  expect(references).toHaveLength(30);
  expect(new Set(references.map((item) => item.key)).size).toBe(30);
  expect(
    ["BEGINNER", "INTERMEDIATE", "ADVANCED"].map(
      (level) => references.filter((item) => item.difficulty === level).length,
    ),
  ).toEqual([13, 10, 7]);
  expect(
    referenceRegistry
      .filter((item) => item.simulatorSupported)
      .map((item) => item.key),
  ).toEqual(commandRegistry.map((item) => item.key));
  for (const item of references) {
    expect(
      item.examples.some((example) => example.before && example.after),
    ).toBe(true);
    expect(referenceOptions[item.key].length).toBeGreaterThan(0);
    item.relatedCommandKeys.forEach((key) =>
      expect(referenceRegistry.some((core) => core.key === key)).toBe(true),
    );
    item.relatedLessonIds.forEach((id) =>
      expect(lessons.some((lesson) => lesson.id === id)).toBe(true),
    );
    item.relatedQuestIds.forEach((id) =>
      expect(quests.some((quest) => quest.id === id)).toBe(true),
    );
    for (const language of ["ko", "en", "ja"] as const) {
      expect(item.whenToUse[language].length).toBeGreaterThan(10);
      referenceOptions[item.key].forEach((option) => {
        expect(option.effect[language].length).toBeGreaterThan(3);
        expect(option.caution[language].length).toBeGreaterThan(10);
        expect(option.example).toMatch(new RegExp(`^git ${item.key} `));
      });
    }
  }
});
