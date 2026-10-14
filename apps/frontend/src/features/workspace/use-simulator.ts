import { useState } from "react";
import type {
  RepositoryState,
  SimulatorEvent,
} from "@gitneapig/shared";
import {
  executeCommand,
  modifyWorkingFile,
  validatePath,
} from "@gitneapig/simulator";
export type TerminalEntry = {
  command: string;
  output: string;
  success: boolean;
};
export function useSimulator(
  initial: RepositoryState,
) {
  const [runtime, setRuntime] = useState(() => ({
    repository: structuredClone(initial),
    entries: [] as TerminalEntry[],
    events: [] as SimulatorEvent[],
    passed: false,
    attempt: 0,
  }));
  function run(command: string) {
    setRuntime((previous) => {
      if (previous.passed) return previous;
      const result = executeCommand(previous.repository, command);
      return {
        ...previous,
        repository: result.nextState,
        passed: false,
        entries: [
          ...previous.entries,
          { command, output: result.output, success: result.success },
        ].slice(-500),
        events: [...previous.events, ...result.events],
      };
    });
  }
  function edit(path: string, content: string | null) {
    validatePath(path);
    setRuntime((previous) => {
      if (previous.passed) return previous;
      const repository = modifyWorkingFile(previous.repository, path, content);
      return {
        ...previous,
        repository,
        passed: false,
      };
    });
  }
  function reset() {
    setRuntime((previous) => ({
      repository: structuredClone(initial),
      entries: [],
      events: [],
      passed: false,
      attempt: previous.attempt + 1,
    }));
  }
  return { ...runtime, run, edit, reset };
}
