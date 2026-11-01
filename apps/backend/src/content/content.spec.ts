import { referenceRegistry } from "@gitneapig/shared";
import {
  evaluateConditions,
  executeCommand,
  executeQuestCommand,
  modifyWorkingFile,
  questCollaborationAction,
  questCompleted,
  startQuest,
} from "@gitneapig/simulator";
import { lessons } from "./lessons";
import { quests } from "./quests";
import { dailyTemplates } from "./daily";
import { achievements } from "./achievements";
import { references } from "./reference";
describe("complete and solvable content", () => {
  it("provides all required catalogs and fixed rewards", () => {
    expect(lessons.map((l) => l.xpReward)).toEqual([100, 140, 180, 220, 260]);
    expect(quests.map((q) => q.xpReward)).toEqual([140, 180, 220, 260, 300]);
    expect(achievements).toHaveLength(10);
    expect(references.map((r) => r.key)).toEqual(
      referenceRegistry.map((c) => c.key),
    );
    expect(lessons.filter((l) => l.guestAccessible)).toHaveLength(3);
    expect(
      dailyTemplates.every((d) => d.hints.length === 3 && d.xpReward === 80),
    ).toBe(true);
    expect(quests.map((q) => q.unlockRule.prerequisiteQuestId)).toEqual([
      null,
      "quest-1",
      "quest-2",
      "quest-3",
      "quest-4",
    ]);
    expect(quests.every((quest) => quest.hints.length === 4)).toBe(true);
    expect(
      quests.every((quest) =>
        quest.objectives.every((objective) => objective.hints?.length === 3),
      ),
    ).toBe(true);
  });
  it("has six ordered lesson stages and complete localized fields throughout", () => {
    lessons.forEach((l) =>
      expect(l.stages.map((s) => s.type)).toEqual([
        "SITUATION",
        "WHY",
        "CONCEPT",
        "COMMAND",
        "PRACTICE",
        "RESULT",
      ]),
    );
    function check(value: unknown): void {
      if (!value || typeof value !== "object") return;
      if ("ko" in value || "en" in value || "ja" in value) {
        for (const lang of ["ko", "en", "ja"])
          expect((value as Record<string, unknown>)[lang]).toEqual(
            expect.stringMatching(/\S/),
          );
      }
      Object.values(value).forEach(check);
    }
    [lessons, quests, dailyTemplates, achievements, references].forEach(check);
  });
  it.each(lessons.map((lesson, index) => [lesson, index] as const))(
    "lesson $0.slug is initially unsolved and solvable",
    (lesson, index) => {
      const commands = [
        ["git add README.md", 'git commit -m "First record"'],
        ["git add README.md"],
        ["git branch feature/login", "git checkout feature/login"],
        ["git merge feature/login"],
        ["git push"],
      ][index];
      let state = lesson.practice.initialState;
      expect(evaluateConditions(state, lesson.practice.successConditions)).toBe(
        false,
      );
      for (const command of commands) {
        const result = executeCommand(state, command);
        expect(result.success).toBe(true);
        state = result.nextState;
      }
      expect(evaluateConditions(state, lesson.practice.successConditions)).toBe(
        true,
      );
    },
  );
  it.each(quests.map((quest, index) => [quest, index] as const))(
    "quest $0.slug requires real state and collaboration actions",
    (quest, index) => {
      let attempt = startQuest(quest);
      expect(questCompleted(quest, attempt)).toBe(false);
      const paths = [
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
      ][index];
      for (const command of paths) {
        const next = executeQuestCommand(quest, attempt, command);
        if (next.result.errorCode !== "MERGE_CONFLICT")
          expect(next.result.success).toBe(true);
        attempt = next.attempt;
      }
      if (index === 2) {
        attempt = questCollaborationAction(quest, attempt, {
          type: "OPEN_PR",
          id: "pr-1",
        });
        attempt = questCollaborationAction(quest, attempt, {
          type: "RESOLVE_REVIEW",
          id: "review-1",
        });
      }
      if (index === 4) {
        attempt = {
          ...attempt,
          repository: modifyWorkingFile(
            attempt.repository,
            "app.txt",
            "title=Welcome team\nstatus=ready\n",
          ),
        };
        for (const command of [
          "git add app.txt",
          'git commit -m "Resolve title"',
          "git push",
        ])
          attempt = executeQuestCommand(quest, attempt, command).attempt;
      }
      attempt = questCollaborationAction(quest, attempt, {
        type: "CLOSE_ISSUE",
        id: "issue-1",
      });
      expect(questCompleted(quest, attempt)).toBe(true);
      const repeated = executeQuestCommand(
        quest,
        attempt,
        "git status",
      ).attempt;
      expect(new Set(repeated.firedEventIds).size).toBe(
        repeated.firedEventIds.length,
      );
      expect(startQuest(quest)).toEqual(startQuest(quest));
      expect(questCompleted(quest, startQuest(quest))).toBe(false);
    },
  );
  it.each(dailyTemplates.map((daily, index) => [daily, index] as const))(
    "daily $0.templateKey has a nontrivial success condition",
    (daily, index) => {
      let state = daily.initialState;
      expect(evaluateConditions(state, daily.successConditions)).toBe(false);
      const paths = [
        ["git add .", 'git commit -m "Daily docs"'],
        ["git switch -c feature/daily"],
        ["git merge feature/login"],
        ["git merge feature/login"],
        ["git add notes.txt"],
      ][index];
      for (const command of paths)
        state = executeCommand(state, command).nextState;
      if (index === 3) {
        state = modifyWorkingFile(
          state,
          "app.txt",
          "title=Together\nstatus=ready\n",
        );
        state = executeCommand(state, "git add .").nextState;
        state = executeCommand(
          state,
          'git commit -m "Resolve title"',
        ).nextState;
      }
      expect(evaluateConditions(state, daily.successConditions)).toBe(true);
    },
  );
});
