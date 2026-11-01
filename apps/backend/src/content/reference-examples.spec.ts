import {
  applyRemoteCommit,
  createRepository,
  executeCommand,
  modifyWorkingFile,
  seedCommand,
  seedCommit,
  snapshots,
} from "@gitneapig/simulator";
import type { CommandKey } from "@gitneapig/shared";
import { referenceExamples } from "./reference-examples";

function prepare(key: CommandKey) {
  let state = createRepository({ "README.md": "# Project\n" }, true);
  if (["status", "add", "commit", "diff"].includes(key)) {
    state = modifyWorkingFile(
      modifyWorkingFile(state, "README.md", "# Project\nSetup\n"),
      "notes.txt",
      "Draft\n",
    );
    if (["commit", "diff"].includes(key))
      state = seedCommand(state, "git add README.md");
  }
  if (key === "log")
    state = seedCommit(
      state,
      "README.md",
      "# Project\nSetup\n",
      "Document setup",
    );
  if (["merge", "push"].includes(key)) {
    state = seedCommit(
      seedCommand(state, "git switch -c feature/login"),
      "login.txt",
      "Login\n",
      "Login draft",
    );
    if (key === "merge") state = seedCommand(state, "git switch main");
  }
  if (["fetch", "pull"].includes(key))
    state = applyRemoteCommit(state, {
      remoteName: "origin",
      branchName: "main",
      message: "Remote docs",
      snapshot: { "README.md": "# Project\nTeam notes\n" },
    });
  return state;
}

describe("Reference worked examples", () => {
  test.each(Object.keys(referenceExamples) as CommandKey[])(
    "%s examples run in the documented context",
    (key) => {
      let state = prepare(key);
      const before = structuredClone(state);
      const examples = referenceExamples[key];
      expect(examples[0].before).toBeDefined();
      expect(examples[0].after).toBeDefined();
      expect(new Set(examples.map((e) => e.command)).size).toBe(
        examples.length,
      );
      for (const example of examples) {
        const result = executeCommand(state, example.command);
        expect(result.success).toBe(true);
        state = result.nextState;
      }
      if (["status", "diff", "log"].includes(key))
        expect(state).toEqual(before);
      if (key === "commit") {
        expect(snapshots(state).head).not.toHaveProperty("notes.txt");
        expect(state.stagingArea).toHaveLength(0);
      }
      if (key === "fetch")
        expect(snapshots(state).working).toEqual(snapshots(before).working);
      if (key === "pull")
        expect(snapshots(state).working["README.md"]).toContain("Team notes");
      if (key === "merge")
        expect(snapshots(state).head["login.txt"]).toBe("Login\n");
    },
  );
});
