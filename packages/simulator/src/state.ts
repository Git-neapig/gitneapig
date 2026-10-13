import type { Commit, FileDiff, RepositoryState, SimulatorCondition, StagedFileState, WorkingFileState } from "@gitneapig/shared";
import { fail } from "./parser";
export type Snapshot = Record<string, string>;
export const copyState = (state: RepositoryState): RepositoryState =>
  structuredClone(state);
export const has = (value: object, key: string): boolean =>
  Object.hasOwn(value, key);
export function createRepository(
  snapshot: Snapshot = {},
  remote = false,
): RepositoryState {
  const commits: Commit[] = Object.keys(snapshot).length
    ? [
        {
          id: "c1",
          message: "Initial commit",
          parentIds: [],
          snapshot: { ...snapshot },
        },
      ]
    : [];
  const headCommitId = commits[0]?.id ?? null;
  return {
    currentBranch: "main",
    headCommitId,
    branches: [
      {
        name: "main",
        commitId: headCommitId,
        upstream: remote ? { remoteName: "origin", branchName: "main" } : null,
      },
    ],
    commits,
    workingTree: [],
    stagingArea: [],
    remotes: remote
      ? [
          {
            name: "origin",
            branches: [{ name: "main", commitId: headCommitId }],
            commits: structuredClone(commits),
          },
        ]
      : [],
    remoteTrackingBranches: remote
      ? [{ remoteName: "origin", branchName: "main", commitId: headCommitId }]
      : [],
    mergeState: null,
    nextCommitSequence: commits.length + 1,
  };
}
export function commitSnapshot(
  state: RepositoryState,
  id: string | null = state.headCommitId,
): Snapshot {
  if (id === null) return {};
  const commit = state.commits.find((c) => c.id === id);
  if (!commit) fail("INVALID_STATE", `Missing commit ${id}`);
  return { ...commit.snapshot };
}
function overlay(
  base: Snapshot,
  changes: (WorkingFileState | StagedFileState)[],
): Snapshot {
  const result = { ...base };
  for (const change of changes) {
    if (change.status === "deleted") delete result[change.path];
    else
      Object.defineProperty(result, change.path, {
        value: change.content,
        enumerable: true,
        configurable: true,
        writable: true,
      });
  }
  return result;
}
export function snapshots(state: RepositoryState): {
  head: Snapshot;
  index: Snapshot;
  working: Snapshot;
} {
  const head = commitSnapshot(state),
    index = overlay(head, state.stagingArea),
    working = overlay(index, state.workingTree);
  return { head, index, working };
}
export function diffSnapshots(before: Snapshot, after: Snapshot): FileDiff[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .sort()
    .filter(
      (path) =>
        before[path] !== after[path] || has(before, path) !== has(after, path),
    )
    .map((path) => ({
      path,
      before: has(before, path) ? before[path] : null,
      after: has(after, path) ? after[path] : null,
      kind: !has(before, path)
        ? "ADDED"
        : !has(after, path)
          ? "DELETED"
          : "MODIFIED",
    }));
}
export function rebuildChanges(
  state: RepositoryState,
  index: Snapshot,
  working: Snapshot,
): void {
  const resolved = new Set(
    state.stagingArea.filter((f) => f.status === "resolved").map((f) => f.path),
  );
  state.stagingArea = diffSnapshots(commitSnapshot(state), index).map((f) => ({
    path: f.path,
    content: f.after ?? "",
    status: resolved.has(f.path)
      ? "resolved"
      : f.kind === "ADDED"
        ? "added"
        : f.kind === "DELETED"
          ? "deleted"
          : "modified",
  }));
  state.workingTree = diffSnapshots(index, working).map((f) => ({
    path: f.path,
    content: f.after ?? "",
    status:
      f.kind === "DELETED"
        ? "deleted"
        : state.mergeState?.conflictedPaths.includes(f.path)
          ? "conflicted"
          : f.kind === "ADDED"
            ? "untracked"
            : "modified",
  }));
  for (const path of state.mergeState?.conflictedPaths ?? []) {
    if (!state.workingTree.some((f) => f.path === path))
      state.workingTree.push({
        path,
        content: working[path] ?? "",
        status: has(working, path) ? "conflicted" : "deleted",
      });
  }
}
export function validatePath(path: string): void {
  if (
    !path ||
    path.startsWith("/") ||
    path.includes("\\") ||
    path
      .split("/")
      .some((p) => !p || p === "." || p === ".." || p === ".git") ||
    [...path].some((c) => c.charCodeAt(0) < 32)
  )
    fail("INVALID_ARGUMENT", "Use a relative repository file path.");
}
export function modifyWorkingFile(
  state: RepositoryState,
  path: string,
  content: string | null,
): RepositoryState {
  validatePath(path);
  if (content && content.length > 200_000)
    fail("INVALID_ARGUMENT", "File is too large.");
  const next = copyState(state),
    { index, working } = snapshots(next);
  if (content === null) delete working[path];
  else
    Object.defineProperty(working, path, {
      value: content,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  rebuildChanges(next, index, working);
  return next;
}
export function resolveConflict(
  state: RepositoryState,
  path: string,
  content: string | null,
): RepositoryState {
  if (!state.mergeState?.conflictedPaths.includes(path))
    fail("INVALID_ARGUMENT", "This file is not conflicted.");
  return modifyWorkingFile(state, path, content);
}
export function ancestors(commits: Commit[], id: string | null): Set<string> {
  const result = new Set<string>(),
    queue = id ? [id] : [];
  while (queue.length) {
    const current = queue.pop()!;
    if (result.has(current)) continue;
    const commit = commits.find((c) => c.id === current);
    if (!commit) fail("INVALID_STATE", `Missing ancestor ${current}`);
    result.add(current);
    queue.push(...commit.parentIds);
  }
  return result;
}
export const isAncestor = (
  commits: Commit[],
  older: string | null,
  newer: string | null,
): boolean => older === null || ancestors(commits, newer).has(older);
export function allocateCommit(
  state: RepositoryState,
  message: string,
  parentIds: string[],
  snapshot: Snapshot,
): Commit {
  const id = `c${state.nextCommitSequence++}`;
  if (
    state.commits.some((c) => c.id === id) ||
    state.remotes.some((r) => r.commits.some((c) => c.id === id))
  )
    fail("INVALID_STATE", "Commit sequence already exists.");
  return { id, message, parentIds, snapshot: { ...snapshot } };
}
export function setHead(state: RepositoryState, id: string | null): void {
  const branch = state.branches.find((b) => b.name === state.currentBranch);
  if (!branch) fail("INVALID_STATE", "Current branch is missing.");
  branch.commitId = id;
  state.headCommitId = id;
}
export function getDiff(state: RepositoryState, staged = false): FileDiff[] {
  const { head, index, working } = snapshots(state);
  return staged
    ? diffSnapshots(head, index)
    : diffSnapshots(index, working).filter((f) => has(index, f.path));
}
export function evaluateCondition(
  state: RepositoryState,
  condition: SimulatorCondition,
): boolean {
  switch (condition.type) {
    case "CURRENT_BRANCH":
      return state.currentBranch === condition.branchName;
    case "BRANCH_EXISTS":
      return state.branches.some((b) => b.name === condition.branchName);
    case "COMMIT_EXISTS":
      return state.commits.some(
        (c) =>
          (!condition.messageContains ||
            c.message.includes(condition.messageContains)) &&
          (condition.messageEquals === undefined ||
            c.message === condition.messageEquals) &&
          (!condition.containsPath ||
            Object.hasOwn(c.snapshot, condition.containsPath)) &&
          (!condition.branchName ||
            ancestors(
              state.commits,
              state.branches.find((b) => b.name === condition.branchName)
                ?.commitId ?? null,
            ).has(c.id)),
      );
    case "COMMIT_REACHABLE":
      return ancestors(
        state.commits,
        state.branches.find((b) => b.name === condition.branchName)?.commitId ??
          null,
      ).has(condition.commitId);
    case "STAGED_FILES":
      return (
        state.stagingArea.length === condition.files.length &&
        condition.files.every((expected) =>
          state.stagingArea.some(
            (file) =>
              file.path === expected.path && file.status === expected.status,
          ),
        )
      );
    case "FILE_STAGED":
      return state.stagingArea.some((f) => f.path === condition.path);
    case "FILE_CONFLICTED":
      return (
        state.mergeState?.conflictedPaths.includes(condition.path) ?? false
      );
    case "MERGE_COMPLETED":
      return (
        state.mergeState === null &&
        state.commits.some(
          (c) =>
            c.parentIds.length > 1 &&
            ancestors(state.commits, state.headCommitId).has(c.id),
        )
      );
    case "REMOTE_SYNCED": {
      const local = state.branches.find((b) => b.name === condition.branchName),
        remote = state.remotes
          .find((r) => r.name === condition.remoteName)
          ?.branches.find((b) => b.name === condition.branchName);
      return !!local && !!remote && local.commitId === remote.commitId;
    }
  }
}
export const evaluateConditions = (
  state: RepositoryState,
  conditions: SimulatorCondition[],
): boolean => conditions.every((c) => evaluateCondition(state, c));
