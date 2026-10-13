import {
  commandRegistry,
  type RepositoryState,
  type SimulatorEvent,
  type SimulatorResult,
} from "@gitneapig/shared";
import { CommandError, fail, parseCommand } from "./parser";
import {
  ancestors,
  commitSnapshot,
  copyState,
  diffSnapshots,
  getDiff,
  has,
  isAncestor,
  rebuildChanges,
  snapshots,
} from "./state";
import { createCommit, merge, requireClean } from "./merge";

function validateBranch(name: string): void {
  if (
    !name ||
    name === "HEAD" ||
    name.startsWith("-") ||
    name.startsWith("/") ||
    name.endsWith("/") ||
    name.endsWith(".") ||
    name.includes("..") ||
    name.includes("@{") ||
    /[\s~^:?*[\\]/.test(name) ||
    [...name].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127) ||
    name.split("/").some((p) => !p || p.startsWith(".") || p.endsWith(".lock"))
  )
    fail("INVALID_ARGUMENT", "Invalid branch name.");
}
function branch(state: RepositoryState, name = state.currentBranch) {
  const found = state.branches.find((b) => b.name === name);
  if (!found) fail("BRANCH_NOT_FOUND", `Branch '${name}' does not exist.`);
  return found;
}
function switchBranch(
  state: RepositoryState,
  name: string,
  create: boolean,
  events: SimulatorEvent[],
): string {
  if (state.mergeState)
    fail("MERGE_IN_PROGRESS", "Resolve and commit the current merge first.");
  validateBranch(name);
  if (create) {
    if (state.branches.some((b) => b.name === name))
      fail("BRANCH_ALREADY_EXISTS", `Branch '${name}' already exists.`);
    state.branches.push({ name, commitId: state.headCommitId, upstream: null });
    events.push({ type: "BRANCH_CREATED", branchName: name });
  }
  const target = branch(state, name),
    { head, index, working } = snapshots(state),
    targetSnapshot = commitSnapshot(state, target.commitId);
  const dirty = new Set(
    [...state.workingTree, ...state.stagingArea].map((f) => f.path),
  );
  if (diffSnapshots(head, targetSnapshot).some((f) => dirty.has(f.path)))
    fail(
      "INVALID_STATE",
      "Switch would overwrite local changes. Commit them first.",
    );
  const nextIndex = { ...targetSnapshot },
    nextWorking = { ...targetSnapshot };
  for (const path of dirty) {
    if (has(index, path))
      Object.defineProperty(nextIndex, path, {
        value: index[path],
        enumerable: true,
        writable: true,
        configurable: true,
      });
    else delete nextIndex[path];
    if (has(working, path))
      Object.defineProperty(nextWorking, path, {
        value: working[path],
        enumerable: true,
        writable: true,
        configurable: true,
      });
    else delete nextWorking[path];
  }
  state.currentBranch = name;
  state.headCommitId = target.commitId;
  rebuildChanges(state, nextIndex, nextWorking);
  events.push({ type: "BRANCH_SWITCHED", branchName: name });
  return `Switched to ${create ? "a new " : ""}branch '${name}'.`;
}
function fetchRemote(
  state: RepositoryState,
  name: string,
  events: SimulatorEvent[],
): string {
  const remote = state.remotes.find((r) => r.name === name);
  if (!remote) fail("REMOTE_NOT_FOUND", `Remote '${name}' does not exist.`);
  if (state.mergeState?.sourceBranch.startsWith(`${name}/`))
    fail(
      "MERGE_IN_PROGRESS",
      "Finish the current remote merge before fetching again.",
    );
  for (const commit of remote.commits) {
    const existing = state.commits.find((c) => c.id === commit.id);
    if (existing && JSON.stringify(existing) !== JSON.stringify(commit))
      fail("INVALID_STATE", "Commit identity collision.");
    if (!existing) state.commits.push(structuredClone(commit));
  }
  for (const ref of remote.branches) {
    const tracking = state.remoteTrackingBranches.find(
      (b) => b.remoteName === name && b.branchName === ref.name,
    );
    if (tracking) tracking.commitId = ref.commitId;
    else
      state.remoteTrackingBranches.push({
        remoteName: name,
        branchName: ref.name,
        commitId: ref.commitId,
      });
  }
  events.push({ type: "REMOTE_FETCHED", remoteName: name });
  return `From ${name}\n${remote.branches.map((b) => `  ${b.commitId ?? "(unborn)"} ${name}/${b.name}`).join("\n")}`;
}
export function executeCommand(
  input: RepositoryState,
  command: string,
): SimulatorResult {
  try {
    const parsed = parseCommand(command);
    if (parsed.key === "help")
      return {
        success: true,
        nextState: copyState(input),
        output: commandRegistry.map((c) => c.syntax.join("\n")).join("\n"),
        events: [],
      };
    const state = copyState(input),
      { key, args, options } = parsed,
      events: SimulatorEvent[] = [];
    if (branch(state).commitId !== state.headCommitId)
      fail("INVALID_STATE", "HEAD and current branch differ.");
    let output = "",
      conflict = false;
    switch (key) {
      case "status": {
        output = `On branch ${state.currentBranch}\n`;
        if (state.mergeState)
          output += `Merge in progress: ${state.mergeState.conflictedPaths.length} unresolved files\n`;
        if (state.stagingArea.length)
          output += `Changes to be committed:\n${state.stagingArea.map((f) => `  ${f.status}: ${f.path}`).join("\n")}\n`;
        if (state.workingTree.length)
          output += `Working tree:\n${state.workingTree.map((f) => `  ${f.status}: ${f.path}`).join("\n")}\n`;
        if (!state.stagingArea.length && !state.workingTree.length)
          output += "Nothing to commit, working tree clean.";
        break;
      }
      case "add": {
        const { index, working } = snapshots(state),
          candidates = [
            ...new Set([
              ...Object.keys(index),
              ...Object.keys(working),
              ...(state.mergeState?.conflictedPaths ?? []),
            ]),
          ];
        const paths = new Set<string>();
        for (const arg of args) {
          const normalized = arg.replace(/^\.\//, "").replace(/\/$/, ""),
            matching = candidates.filter(
              (p) =>
                arg === "." ||
                p === normalized ||
                p.startsWith(`${normalized}/`),
            );
          if (!matching.length && arg !== ".")
            fail("INVALID_ARGUMENT", `Path '${arg}' did not match any files.`);
          matching.forEach((p) => paths.add(p));
        }
        const resolved: string[] = [];
        for (const path of paths) {
          if (state.mergeState?.conflictedPaths.includes(path)) {
            if (/^(<<<<<<<|=======|>>>>>>>)/m.test(working[path] ?? ""))
              fail("MERGE_CONFLICT", `Conflict markers remain in ${path}.`);
            resolved.push(path);
            state.mergeState.conflictedPaths =
              state.mergeState.conflictedPaths.filter((p) => p !== path);
          }
          if (has(working, path))
            Object.defineProperty(index, path, {
              value: working[path],
              enumerable: true,
              configurable: true,
              writable: true,
            });
          else delete index[path];
        }
        rebuildChanges(state, index, working);
        for (const file of state.stagingArea)
          if (resolved.includes(file.path) && file.status !== "deleted")
            file.status = "resolved";
        if (resolved.length)
          events.push({ type: "CONFLICT_RESOLVED", paths: resolved });
        output = `Staged ${paths.size} file(s).`;
        break;
      }
      case "commit":
        output = createCommit(state, options["-m"] as string, events);
        break;
      case "log": {
        const reachable = ancestors(state.commits, state.headCommitId);
        output =
          [...state.commits]
            .filter((c) => reachable.has(c.id))
            .sort((a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)))
            .map(
              (c) =>
                `${options["--graph"] ? "* " : ""}${c.id} ${c.message}${c.parentIds.length > 1 ? ` (merge: ${c.parentIds.join(" ")})` : ""}`,
            )
            .join("\n") || "No commits yet.";
        break;
      }
      case "diff":
        output = getDiff(state, !!options["--staged"])
          .map(
            (f) =>
              `diff --git a/${f.path} b/${f.path}\n--- ${f.before === null ? "/dev/null" : `a/${f.path}`}\n+++ ${f.after === null ? "/dev/null" : `b/${f.path}`}\n${
                f.before === null
                  ? ""
                  : f.before
                      .split("\n")
                      .map((l) => `-${l}`)
                      .join("\n")
              }\n${
                f.after === null
                  ? ""
                  : f.after
                      .split("\n")
                      .map((l) => `+${l}`)
                      .join("\n")
              }`,
          )
          .join("\n");
        break;
      case "branch": {
        if (!args.length) {
          output = state.branches
            .map(
              (b) => `${b.name === state.currentBranch ? "*" : " "} ${b.name}`,
            )
            .join("\n");
          break;
        }
        const name = args[0];
        validateBranch(name);
        if (options["-d"]) {
          const target = branch(state, name);
          if (
            name === state.currentBranch ||
            state.mergeState?.sourceBranch === name
          )
            fail("INVALID_ARGUMENT", "Cannot delete an active branch.");
          if (!isAncestor(state.commits, target.commitId, state.headCommitId))
            fail("INVALID_STATE", "Branch is not fully merged.");
          state.branches = state.branches.filter((b) => b.name !== name);
          output = `Deleted branch ${name}.`;
        } else {
          if (state.branches.some((b) => b.name === name))
            fail("BRANCH_ALREADY_EXISTS", `Branch '${name}' already exists.`);
          state.branches.push({
            name,
            commitId: state.headCommitId,
            upstream: null,
          });
          events.push({ type: "BRANCH_CREATED", branchName: name });
          output = `Created branch ${name}.`;
        }
        break;
      }
      case "switch":
      case "checkout":
        output = switchBranch(
          state,
          args[0],
          !!(options["-c"] || options["-b"]),
          events,
        );
        break;
      case "merge": {
        const source =
          state.branches.find((b) => b.name === args[0]) ??
          state.remoteTrackingBranches.find(
            (b) => `${b.remoteName}/${b.branchName}` === args[0],
          );
        if (!source)
          fail("BRANCH_NOT_FOUND", `Branch '${args[0]}' does not exist.`);
        ({ output, conflict } = merge(state, args[0], source.commitId, events));
        break;
      }
      case "fetch":
        output = fetchRemote(
          state,
          args[0] ?? branch(state).upstream?.remoteName ?? "origin",
          events,
        );
        break;
      case "pull":
      case "push": {
        const upstream = branch(state).upstream;
        if (!args.length && !upstream)
          fail(
            "NO_UPSTREAM",
            "No upstream configured. Use git push -u <remote> <branch> or an explicit remote and branch.",
          );
        const remoteName = args[0] ?? upstream!.remoteName,
          branchName = args[1] ?? upstream!.branchName;
        const remote = state.remotes.find((r) => r.name === remoteName);
        if (!remote)
          fail("REMOTE_NOT_FOUND", `Remote '${remoteName}' does not exist.`);
        const remoteBranch = remote.branches.find((b) => b.name === branchName);
        if (key === "pull") {
          requireClean(state);
          if (!remoteBranch)
            fail(
              "BRANCH_NOT_FOUND",
              `Remote branch '${branchName}' does not exist.`,
            );
          const fetched = fetchRemote(state, remoteName, events);
          ({ output, conflict } = merge(
            state,
            `${remoteName}/${branchName}`,
            remoteBranch.commitId,
            events,
          ));
          output = `${fetched}\n${output}`;
          if (!conflict)
            events.push({ type: "REMOTE_PULLED", remoteName, branchName });
        } else {
          const local = args.length ? branch(state, branchName) : branch(state);
          if (!local.commitId) fail("INVALID_STATE", "No commits to push.");
          if (
            remoteBranch?.commitId &&
            !isAncestor(state.commits, remoteBranch.commitId, local.commitId)
          )
            fail(
              "NON_FAST_FORWARD",
              "Rejected: remote contains commits absent from this branch. Fetch and integrate first.",
            );
          const reachable = ancestors(state.commits, local.commitId);
          for (const commit of state.commits)
            if (
              reachable.has(commit.id) &&
              !remote.commits.some((c) => c.id === commit.id)
            )
              remote.commits.push(structuredClone(commit));
          if (remoteBranch) remoteBranch.commitId = local.commitId;
          else
            remote.branches.push({
              name: branchName,
              commitId: local.commitId,
            });
          const tracking = state.remoteTrackingBranches.find(
            (b) => b.remoteName === remoteName && b.branchName === branchName,
          );
          if (tracking) tracking.commitId = local.commitId;
          else
            state.remoteTrackingBranches.push({
              remoteName,
              branchName,
              commitId: local.commitId,
            });
          if (options["-u"]) local.upstream = { remoteName, branchName };
          events.push({ type: "REMOTE_PUSHED", remoteName, branchName });
          output = `To ${remoteName}\n  ${local.name} -> ${branchName}`;
        }
        break;
      }
    }
    events.push({ type: "COMMAND_EXECUTED", commandKey: key });
    return {
      success: !conflict,
      nextState: state,
      output,
      events,
      ...(conflict ? { errorCode: "MERGE_CONFLICT" as const } : {}),
    };
  } catch (error) {
    if (!(error instanceof CommandError)) throw error;
    return {
      success: false,
      nextState: copyState(input),
      output: error.message,
      errorCode: error.code,
      events: [],
    };
  }
}
