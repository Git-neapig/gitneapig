import { describe, expect, it } from "vitest";
import type { RepositoryState } from "@gitneapig/shared";
import {
  applyRemoteCommit,
  createRepository,
  evaluateConditions,
  executeCommand,
  getDiff,
  modifyWorkingFile,
  parseCommand,
  resolveConflict,
  snapshots,
} from "./index";

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
function divergent(sameFile = false) {
  let state = run(base(), "git switch -c feature");
  state = save(
    state,
    sameFile ? "app.txt" : "feature.txt",
    sameFile ? "FEATURE\ntwo\nthree\nfour\n" : "feature",
    "Feature work",
  );
  state = run(state, "git switch main");
  return save(
    state,
    sameFile ? "app.txt" : "main.txt",
    sameFile ? "MAIN\ntwo\nthree\nfour\n" : "main",
    "Main work",
  );
}
describe("parser and failure isolation", () => {
  it("supports quoted messages, escapes, empty quote fragments and legacy checkout", () => {
    expect(parseCommand(`git commit -m 'fix: two words'`).options["-m"]).toBe(
      "fix: two words",
    );
    expect(parseCommand('git commit -m "fix \\"quote\\""').options["-m"]).toBe(
      'fix "quote"',
    );
    expect(parseCommand("git checkout -b feature/login").key).toBe("checkout");
    expect(parseCommand('git add "space name.txt"').args).toEqual([
      "space name.txt",
    ]);
  });
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
  it.each(["help", "git help", "git --help"])(
    "has registry-backed help: %s",
    (command) => {
      expect(executeCommand(base(), command).output).toContain("git push");
    },
  );
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
describe("branches and merge", () => {
  it.each(["git switch -c feature", "git checkout -b feature"])(
    "creates and switches with %s",
    (command) => {
      const state = run(base(), command);
      expect(state.currentBranch).toBe("feature");
      expect(state.branches[1].upstream).toBe(null);
      expect(executeCommand(state, command).errorCode).toBe(
        "BRANCH_ALREADY_EXISTS",
      );
    },
  );
  it("preserves dirty files on branch creation and refuses destructive switching", () => {
    let state = run(
      modifyWorkingFile(base(), "README.md", "dirty"),
      "git switch -c feature",
    );
    expect(snapshots(state).working["README.md"]).toBe("dirty");
    state = save(state, "README.md", "feature");
    state = modifyWorkingFile(state, "README.md", "new dirty");
    expect(executeCommand(state, "git switch main").nextState).toEqual(state);
  });
  it("fast-forwards without inventing a merge commit", () => {
    let state = run(base(), "git switch -c feature");
    state = save(state, "feature.txt", "f");
    state = run(state, "git switch main");
    const merged = executeCommand(state, "git merge feature");
    expect(merged.nextState.commits).toHaveLength(2);
    expect(merged.nextState.headCommitId).toBe("c2");
    expect(merged.events).toContainEqual({
      type: "MERGE_COMPLETED",
      commitId: "c2",
    });
  });
  it("merges independent paths using both parents and evaluates conditions", () => {
    const state = run(divergent(), "git merge feature");
    expect(state.commits.at(-1)?.parentIds).toEqual(["c3", "c2"]);
    expect(snapshots(state).head).toMatchObject({
      "feature.txt": "feature",
      "main.txt": "main",
    });
    expect(
      evaluateConditions(state, [
        { type: "MERGE_COMPLETED" },
        { type: "CURRENT_BRANCH", branchName: "main" },
      ]),
    ).toBe(true);
  });
  it("merges independent lines in the same file", () => {
    let state = run(base(), "git switch -c feature");
    state = save(state, "app.txt", "FIRST\ntwo\nthree\nfour\n");
    state = run(state, "git switch main");
    state = save(state, "app.txt", "one\ntwo\nthree\nLAST\n");
    state = run(state, "git merge feature");
    expect(snapshots(state).head["app.txt"]).toBe("FIRST\ntwo\nthree\nLAST\n");
  });
  it("creates a recoverable conflict, forbids premature commit, then stages and commits resolution", () => {
    const before = divergent(true),
      result = executeCommand(before, "git merge feature");
    expect(result.errorCode).toBe("MERGE_CONFLICT");
    expect(before.mergeState).toBe(null);
    let state = result.nextState;
    expect(state.mergeState?.conflictedPaths).toEqual(["app.txt"]);
    expect(executeCommand(state, "git add .").errorCode).toBe("MERGE_CONFLICT");
    expect(executeCommand(state, "git commit -m resolve").errorCode).toBe(
      "MERGE_CONFLICT",
    );
    expect(executeCommand(state, "git switch main").errorCode).toBe(
      "MERGE_IN_PROGRESS",
    );
    state = resolveConflict(state, "app.txt", "BOTH\ntwo\nthree\nfour\n");
    state = run(state, "git add app.txt");
    expect(state.mergeState?.conflictedPaths).toEqual([]);
    state = run(state, "git commit -m resolve");
    expect(state.mergeState).toBe(null);
    expect(state.commits.at(-1)?.parentIds).toEqual(["c3", "c2"]);
  });
  it("logs only reachable commits and prevents deletion of unmerged or current branches", () => {
    const state = divergent();
    expect(
      executeCommand(state, "git log --graph --oneline").output,
    ).not.toContain("Feature work");
    expect(executeCommand(state, "git branch -d feature").success).toBe(false);
    expect(executeCommand(state, "git branch -d main").success).toBe(false);
    expect(
      run(run(state, "git merge feature"), "git branch -d feature").branches,
    ).toHaveLength(1);
  });
});
describe("real remote state and upstream", () => {
  it("fetch changes local object database/tracking but not HEAD, index, or files", () => {
    let state = applyRemoteCommit(base(), {
      remoteName: "origin",
      branchName: "main",
      message: "Remote work",
      snapshot: { "README.md": "remote" },
    });
    expect(state.commits).toHaveLength(1);
    const files = snapshots(state);
    state = run(state, "git fetch");
    expect(state.headCommitId).toBe("c1");
    expect(snapshots(state)).toEqual(files);
    expect(state.remoteTrackingBranches[0].commitId).toBe("c2");
    state = run(state, "git pull");
    expect(state.headCommitId).toBe("c2");
    expect(snapshots(state).head).toEqual({ "README.md": "remote" });
  });
  it("rejects stale push without altering remote and allows push after integration", () => {
    let state = applyRemoteCommit(base(), {
      remoteName: "origin",
      branchName: "main",
      message: "Remote work",
      snapshot: { ...snapshots(base()).head, "remote.txt": "remote" },
    });
    state = save(state, "local.txt", "local");
    expect(state.headCommitId).toBe("c3");
    const rejected = executeCommand(state, "git push");
    expect(rejected.errorCode).toBe("NON_FAST_FORWARD");
    expect(rejected.nextState).toEqual(state);
    state = run(run(state, "git pull"), "git push");
    expect(state.remotes[0].branches[0].commitId).toBe(state.headCommitId);
    expect(
      evaluateConditions(state, [
        { type: "REMOTE_SYNCED", remoteName: "origin", branchName: "main" },
      ]),
    ).toBe(true);
  });
  it("only successful push -u establishes upstream", () => {
    let state = run(base(), "git switch -c feature");
    state = save(state, "f.txt", "f");
    expect(executeCommand(state, "git push").errorCode).toBe("NO_UPSTREAM");
    expect(executeCommand(state, "git pull").errorCode).toBe("NO_UPSTREAM");
    expect(
      executeCommand(state, "git push -u missing feature").nextState.branches[1]
        .upstream,
    ).toBe(null);
    state = run(state, "git push origin feature");
    expect(state.branches[1].upstream).toBe(null);
    state = run(state, "git push -u origin feature");
    expect(state.branches[1].upstream).toEqual({
      remoteName: "origin",
      branchName: "feature",
    });
    expect(run(state, "git push").headCommitId).toBe(state.headCommitId);
  });
  it("uses explicit remote targets and rejects missing remote branches", () => {
    expect(executeCommand(base(), "git pull origin missing").errorCode).toBe(
      "BRANCH_NOT_FOUND",
    );
    expect(executeCommand(base(), "git fetch nowhere").errorCode).toBe(
      "REMOTE_NOT_FOUND",
    );
    expect(executeCommand(base(), "git push origin missing").errorCode).toBe(
      "BRANCH_NOT_FOUND",
    );
  });
});
