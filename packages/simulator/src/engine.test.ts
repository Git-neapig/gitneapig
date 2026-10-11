import { describe, expect, it } from "vitest";
import type { RepositoryState } from "@gitneapig/shared";
import { createRepository, executeCommand, getDiff, modifyWorkingFile, snapshots } from "./index";

const run = (state: RepositoryState, command: string) => {
  const result = executeCommand(state, command);
  expect(result.success, `${command}: ${result.output}`).toBe(true);
  return result.nextState;
};
const save = (
  state: RepositoryState,
  path: string,
  content: string | null,
  message = "Update",
) =>
  run(
    run(modifyWorkingFile(state, path, content), `git add "${path}"`),
    `git commit -m "${message}"`,
  );
const base = () =>
  createRepository(
    { "README.md": "hello\n", "app.txt": "one\ntwo\nthree\nfour\n" },
    true,
  );
describe("parser and failure isolation", () => {
  it.each([
    "git reset --hard",
    "echo hi",
    "",
    "git",
    "git commit",
    'git commit -m ""',
    'git commit -m "unfinished',
    "git status extra",
    "git log --unknown",
    "git add",
    "git push origin",
    "git pull origin main extra",
    "git switch -x a",
    "git branch -d",
    "git status; echo hi",
    "git commit -m a -m b",
  ])("rejects %s without mutation", (command) => {
    const state = base(),
      before = structuredClone(state),
      result = executeCommand(state, command);
    expect(result.success).toBe(false);
    expect(result.nextState).toEqual(before);
    expect(state).toEqual(before);
    expect(result.events).toEqual([]);
  });
  it("is deterministic including IDs and does not mutate frozen input", () => {
    const state = run(
      modifyWorkingFile(base(), "README.md", "new"),
      "git add .",
    );
    const frozen = (o: object) => {
      Object.freeze(o);
      Object.values(o).forEach((v) => {
        if (v && typeof v === "object") frozen(v);
      });
    };
    frozen(state);
    expect(executeCommand(state, "git commit -m new")).toEqual(
      executeCommand(state, "git commit -m new"),
    );
  });
});
describe("snapshots, add, commit and diff", () => {
  it("starts an unborn branch with a real root commit", () => {
    const state = save(createRepository(), "README.md", "start", "Start");
    expect(state.commits).toEqual([
      {
        id: "c1",
        parentIds: [],
        message: "Start",
        snapshot: { "README.md": "start" },
      },
    ]);
  });
  it("preserves unstaged edits made after staging while retaining untouched files", () => {
    let state = run(
      modifyWorkingFile(base(), "README.md", "staged"),
      "git add README.md",
    );
    state = modifyWorkingFile(state, "README.md", "unstaged");
    expect(getDiff(state, true)[0]).toMatchObject({
      before: "hello\n",
      after: "staged",
    });
    expect(getDiff(state)[0]).toMatchObject({
      before: "staged",
      after: "unstaged",
    });
    state = run(state, "git commit -m staged");
    expect(snapshots(state).head).toEqual({
      "README.md": "staged",
      "app.txt": "one\ntwo\nthree\nfour\n",
    });
    expect(snapshots(state).working["README.md"]).toBe("unstaged");
    expect(state.stagingArea).toEqual([]);
  });
  it("restaging refreshes the snapshot and removes redundant deltas", () => {
    let state = run(
      modifyWorkingFile(base(), "README.md", "first"),
      "git add .",
    );
    state = run(modifyWorkingFile(state, "README.md", "hello\n"), "git add .");
    expect(state.stagingArea).toEqual([]);
    expect(state.workingTree).toEqual([]);
  });
  it("distinguishes missing and empty files and commits deletions", () => {
    const state = save(base(), "README.md", null);
    expect(snapshots(state).head).not.toHaveProperty("README.md");
    const empty = save(state, "README.md", "");
    expect(snapshots(empty).head).toHaveProperty("README.md", "");
  });
  it("excludes untracked files from unstaged diff and includes them after add", () => {
    let state = modifyWorkingFile(base(), "new.txt", "new");
    expect(getDiff(state)).toEqual([]);
    state = run(state, "git add new.txt");
    expect(getDiff(state, true)[0]).toMatchObject({
      kind: "ADDED",
      before: null,
      after: "new",
    });
  });
  it("supports paths with spaces and directory staging, not missing paths", () => {
    let state = modifyWorkingFile(base(), "src/a file.ts", "a");
    state = modifyWorkingFile(state, "src/b.ts", "b");
    expect(run(state, "git add src/").stagingArea).toHaveLength(2);
    expect(executeCommand(state, "git add src missing").nextState).toEqual(
      state,
    );
  });
  it("accepts prototype-shaped filenames without modifying prototypes", () => {
    const state = save(createRepository(), "__proto__", "data");
    expect(Object.keys(snapshots(state).head)).toEqual(["__proto__"]);
    expect(snapshots(state).head["__proto__"]).toBe("data");
  });
});
