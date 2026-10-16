// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createRepository, modifyWorkingFile } from "@gitneapig/simulator";
import { useSimulator } from "./use-simulator";

describe("practice attempt lifecycle", () => {
  it("latches a real pass atomically and ignores commands until reset", () => {
    const initial = modifyWorkingFile(
      createRepository({ "README.md": "before" }, true),
      "README.md",
      "after",
    );
    const { result } = renderHook(() =>
      useSimulator(initial, [
        {
          type: "STAGED_FILES",
          files: [{ path: "README.md", status: "modified" }],
        },
      ]),
    );
    expect(result.current.passed).toBe(false);
    act(() => {
      result.current.run("git add README.md");
      result.current.run('git commit -m "Too late"');
    });
    expect(result.current.passed).toBe(true);
    expect(result.current.repository.stagingArea).toHaveLength(1);
    expect(result.current.entries).toHaveLength(1);
    act(() => result.current.edit("README.md", null));
    expect(result.current.repository.stagingArea).toHaveLength(1);
    act(() => result.current.reset());
    expect(result.current.passed).toBe(false);
    expect(result.current.attempt).toBe(1);
    expect(result.current.entries).toEqual([]);
    expect(result.current.repository).toEqual(initial);
  });
  it("starts a fresh attempt after unmount instead of restoring repository or terminal history", () => {
    const initial = createRepository();
    const first = renderHook(() => useSimulator(initial));
    act(() => first.result.current.run("git status"));
    first.unmount();
    const second = renderHook(() => useSimulator(initial));
    expect(second.result.current.entries).toEqual([]);
    expect(second.result.current.repository).toEqual(initial);
  });
});
