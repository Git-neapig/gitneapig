import { commandRegistry, type RepositoryState, type SimulatorEvent, type SimulatorResult } from "@gitneapig/shared";
import { CommandError, fail, parseCommand } from "./parser";
import { ancestors, copyState, getDiff, has, rebuildChanges, snapshots } from "./state";
import { createCommit } from "./merge";
function branch(state: RepositoryState, name = state.currentBranch) {
  const found = state.branches.find((b) => b.name === name);
  if (!found) fail("BRANCH_NOT_FOUND", `Branch '${name}' does not exist.`);
  return found;
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
