import type { RepositoryState, SimulatorEvent } from "@gitneapig/shared";
import { fail } from "./parser";
import { allocateCommit, setHead, snapshots, rebuildChanges } from "./state";

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
