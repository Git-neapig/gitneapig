import {
  evaluateConditions,
  executeCommand,
  modifyWorkingFile,
} from "@gitneapig/simulator";
import { lessons } from "./lessons";

const solutions = [
  ["git add README.md", 'git commit -m "First record"'],
  ["git add README.md", "git diff --staged"],
  ["git branch feature/login", "git switch feature/login"],
  ["git switch main", "git merge feature/login"],
  ["git push -u origin main"],
];
function run(
  index: number,
  commands: string[],
  state = lessons[index].practice.initialState,
) {
  for (const command of commands) {
    const result = executeCommand(state, command);
    expect(result.success).toBe(true);
    state = result.nextState;
  }
  return evaluateConditions(state, lessons[index].practice.successConditions);
}

describe("Learn content audit: approved corrections", () => {
  test.each(lessons.map((lesson, index) => [lesson.slug, index] as const))(
    "%s has a working sample and does not pass initially",
    (_, index) => {
      expect(
        evaluateConditions(
          lessons[index].practice.initialState,
          lessons[index].practice.successConditions,
        ),
      ).toBe(false);
      expect(run(index, solutions[index])).toBe(true);
      expect(lessons[index].practice.solution?.length).toBeGreaterThan(0);
      expect(
        run(
          index,
          lessons[index].practice.solution!.map((step) => step.command),
        ),
      ).toBe(true);
    },
  );
  test("branch accepts switch -c and checkout -b, not creation alone", () => {
    expect(run(2, ["git switch -c feature/login"])).toBe(true);
    expect(run(2, ["git checkout -b feature/login"])).toBe(true);
    expect(run(2, ["git branch feature/login"])).toBe(false);
  });
  test("remote accepts explicit and upstream-setting push", () => {
    expect(run(4, ["git push origin main"])).toBe(true);
  });
  test("AUDIT-01: a different file with matching message cannot pass", () => {
    const state = modifyWorkingFile(
      lessons[0].practice.initialState,
      "other.txt",
      "not the README",
    );
    expect(
      run(
        0,
        ["git add other.txt", 'git commit -m "First record extra"'],
        state,
      ),
    ).toBe(false);
  });
  test("AUDIT-02: draft notes and README deletion cannot pass", () => {
    expect(run(1, ["git add ."])).toBe(false);
    expect(
      run(1, ["git add README.md", 'git commit -m "Document setup"']),
    ).toBe(false);
    const state = modifyWorkingFile(
      lessons[1].practice.initialState,
      "README.md",
      null,
    );
    expect(run(1, ["git add README.md"], state)).toBe(false);
  });
  test("AUDIT-04: merging an unrelated branch cannot pass", () => {
    let state = lessons[3].practice.initialState;
    state = executeCommand(state, "git switch -c unrelated").nextState;
    state = modifyWorkingFile(state, "other.txt", "unrelated work");
    for (const command of [
      "git add other.txt",
      'git commit -m "Other work"',
      "git switch main",
    ])
      state = executeCommand(state, command).nextState;
    state = modifyWorkingFile(state, "main.txt", "main work");
    expect(
      run(
        3,
        [
          "git add main.txt",
          'git commit -m "Main work"',
          "git merge unrelated",
        ],
        state,
      ),
    ).toBe(false);
  });
});
