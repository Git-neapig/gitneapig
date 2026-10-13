import { expect, it } from "vitest";
import { commandOptions, commandRegistry } from "./registry";
it("keeps parser keys and translated guide projections aligned", () => {
  expect(commandRegistry.map((c) => c.key).sort()).toEqual(
    Object.keys(commandOptions).sort(),
  );
  expect(new Set(commandRegistry.map((c) => c.key)).size).toBe(12);
  for (const command of commandRegistry) {
    expect(command.simulatorSupported).toBe(true);
    for (const language of ["ko", "en", "ja"] as const)
      expect(command.shortDescription[language].length).toBeGreaterThan(10);
  }
});
