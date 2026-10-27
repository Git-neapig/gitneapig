// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CompletionResponse } from "@gitneapig/shared";
import { api } from "../../lib/api";
import { useSession } from "../../lib/session";
import { useCompletion } from "./completion";

vi.mock("../../lib/api", () => ({ api: vi.fn() }));
vi.mock("../../lib/session", () => ({ useSession: vi.fn() }));
const refresh = vi.fn();
const response: CompletionResponse = {
  completed: true,
  firstCompletion: true,
  xpAwarded: 100,
};
beforeEach(() => {
  vi.resetAllMocks();
  refresh.mockResolvedValue(undefined);
  vi.mocked(useSession).mockReturnValue({
    user: {
      id: "member",
      email: null,
      nickname: "QA",
      avatarUrl: "",
      language: "en",
      xp: 0,
      level: 1,
      streak: 0,
      createdAt: "2026-01-01",
    },
    refresh,
    loading: false,
    epoch: 0,
    setUser: vi.fn(),
    logout: vi.fn(),
    setLanguage: vi.fn(),
  });
});
afterEach(cleanup);

describe("completion save lifecycle", () => {
  it("deduplicates concurrent saves and acknowledged completions", async () => {
    let resolve!: (value: CompletionResponse) => void;
    vi.mocked(api).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { result } = renderHook(() => useCompletion("lessons", "lesson-1"));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.save();
      void result.current.save();
    });
    expect(result.current.busy).toBe(true);
    expect(api).toHaveBeenCalledTimes(1);
    expect(api).toHaveBeenCalledWith("/lessons/lesson-1/complete", {
      method: "POST",
      body: {},
    });
    await act(async () => {
      resolve(response);
      await pending;
    });
    await act(() => result.current.save());
    expect(result.current.result).toEqual(response);
    expect(result.current.busy).toBe(false);
    expect(api).toHaveBeenCalledTimes(1);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("unlocks retry after rejection and keeps a saved result if profile refresh fails", async () => {
    const failure = new Error("offline");
    vi.mocked(api)
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce(response);
    refresh.mockRejectedValue(new Error("profile unavailable"));
    const { result } = renderHook(() => useCompletion("lessons", "lesson-1"));
    await act(() => result.current.save());
    expect(result.current.error).toBe(failure);
    expect(result.current.result).toBeNull();
    expect(result.current.busy).toBe(false);
    await act(() => result.current.save());
    expect(result.current.error).toBeNull();
    expect(result.current.result).toEqual(response);
    await act(() => result.current.save());
    expect(api).toHaveBeenCalledTimes(2);
  });

  it("does not send member requests for a guest", async () => {
    vi.mocked(useSession).mockReturnValue({
      ...useSession(),
      user: null,
      refresh,
    });
    const { result } = renderHook(() => useCompletion("lessons", "lesson-1"));
    await act(() => result.current.save());
    expect(api).not.toHaveBeenCalled();
    expect(refresh).not.toHaveBeenCalled();
    expect(result.current.result).toBeNull();
  });
});
