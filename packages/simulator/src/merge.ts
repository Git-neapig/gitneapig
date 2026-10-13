import { diff3Merge } from "node-diff3";
import type { RepositoryState, SimulatorEvent } from "@gitneapig/shared";
import { fail } from "./parser";
import {
  allocateCommit,
  ancestors,
  commitSnapshot,
  has,
  isAncestor,
  rebuildChanges,
  setHead,
  snapshots,
  type Snapshot,
} from "./state";

export function requireClean(state: RepositoryState): void {
  if (state.mergeState)
    fail("MERGE_IN_PROGRESS", "Resolve and commit the current merge first.");
  if (state.stagingArea.length || state.workingTree.length)
    fail("INVALID_STATE", "Commit your working changes before merging.");
}
export function createCommit(
  state: RepositoryState,
  message: string,
  events: SimulatorEvent[],
): string {
  if (state.mergeState?.conflictedPaths.length)
    fail(
      "MERGE_CONFLICT",
      "Unmerged files remain. Resolve each conflict and git add the file.",
    );
  if (!state.stagingArea.length && !state.mergeState)
    fail(
      state.workingTree.length ? "NOTHING_STAGED" : "NOTHING_TO_COMMIT",
      state.workingTree.length
        ? "No changes staged for commit."
        : "Nothing to commit, working tree clean.",
    );
  const { index, working } = snapshots(state),
    parents = state.headCommitId ? [state.headCommitId] : [];
  if (state.mergeState) {
    const source =
      state.branches.find((b) => b.name === state.mergeState!.sourceBranch)
        ?.commitId ??
      state.remoteTrackingBranches.find(
        (b) =>
          `${b.remoteName}/${b.branchName}` === state.mergeState!.sourceBranch,
      )?.commitId;
    if (!source) fail("INVALID_STATE", "Merge source is missing.");
    parents.push(source);
  }
  const commit = allocateCommit(state, message, parents, index),
    wasMerge = !!state.mergeState;
  state.commits.push(commit);
  setHead(state, commit.id);
  state.mergeState = null;
  state.stagingArea = [];
  rebuildChanges(state, index, working);
  events.push({ type: "COMMIT_CREATED", commitId: commit.id, message });
  if (wasMerge) events.push({ type: "MERGE_COMPLETED", commitId: commit.id });
  return `[${state.currentBranch} ${commit.id}] ${message}`;
}
export function merge(
  state: RepositoryState,
  sourceName: string,
  sourceId: string | null,
  events: SimulatorEvent[],
): { output: string; conflict: boolean } {
  requireClean(state);
  if (isAncestor(state.commits, sourceId, state.headCommitId))
    return { output: "Already up to date.", conflict: false };
  events.push({
    type: "MERGE_STARTED",
    sourceBranch: sourceName,
    targetBranch: state.currentBranch,
  });
  if (isAncestor(state.commits, state.headCommitId, sourceId)) {
    setHead(state, sourceId);
    events.push({
      type: "MERGE_COMPLETED",
      ...(sourceId ? { commitId: sourceId } : {}),
    });
    return { output: `Fast-forward to ${sourceId}.`, conflict: false };
  }
  const ours = commitSnapshot(state),
    theirs = commitSnapshot(state, sourceId);
  const oursAncestors = ancestors(state.commits, state.headCommitId),
    theirsAncestors = ancestors(state.commits, sourceId);
  const common = [...oursAncestors].filter((id) => theirsAncestors.has(id));
  const bases = common.filter(
    (id) =>
      !common.some(
        (other) => other !== id && isAncestor(state.commits, id, other),
      ),
  );
  if (bases.length !== 1)
    fail(
      "INVALID_STATE",
      bases.length
        ? "Multiple merge bases are not supported."
        : "Refusing to merge unrelated histories.",
    );
  const base = commitSnapshot(state, bases[0]),
    merged: Snapshot = {},
    conflicts: string[] = [];
  const put = (path: string, value: string | undefined) => {
    if (value !== undefined)
      Object.defineProperty(merged, path, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
  };
  for (const path of [
    ...new Set([
      ...Object.keys(base),
      ...Object.keys(ours),
      ...Object.keys(theirs),
    ]),
  ].sort()) {
    const a = has(ours, path) ? ours[path] : undefined,
      b = has(theirs, path) ? theirs[path] : undefined,
      o = has(base, path) ? base[path] : undefined;
    if (a === b) put(path, a);
    else if (a === o) put(path, b);
    else if (b === o) put(path, a);
    else if (a === undefined || b === undefined || o === undefined) {
      conflicts.push(path);
      put(
        path,
        `<<<<<<< HEAD\n${a ?? ""}\n=======\n${b ?? ""}\n>>>>>>> ${sourceName}`,
      );
    } else {
      const regions = diff3Merge(a.split("\n"), o.split("\n"), b.split("\n"));
      let conflicted = false;
      const lines = regions.flatMap((region) => {
        if (region.ok) return region.ok;
        conflicted = true;
        return [
          "<<<<<<< HEAD",
          ...region.conflict!.a,
          "=======",
          ...region.conflict!.b,
          `>>>>>>> ${sourceName}`,
        ];
      });
      if (conflicted) conflicts.push(path);
      put(path, lines.join("\n"));
    }
  }
  state.mergeState = {
    sourceBranch: sourceName,
    targetBranch: state.currentBranch,
    conflictedPaths: conflicts,
  };
  const index = { ...merged };
  for (const path of conflicts) {
    if (has(ours, path)) index[path] = ours[path];
    else delete index[path];
  }
  rebuildChanges(state, index, merged);
  if (conflicts.length) {
    events.push({ type: "MERGE_CONFLICT_CREATED", paths: conflicts });
    return {
      output: `CONFLICT in ${conflicts.join(", ")}\nResolve the files, then git add and git commit.`,
      conflict: true,
    };
  }
  return {
    output: createCommit(state, `Merge branch '${sourceName}'`, events),
    conflict: false,
  };
}
