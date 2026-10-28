// @vitest-environment jsdom
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { Completion, useCompletion } from "./completion";

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  refresh: vi.fn(),
  user: { id: "member" } as { id: string } | null,
}));
vi.mock("../../lib/api", () => ({ api: mocks.api }));
vi.mock("../../lib/session", () => ({
  useSession: () => ({ user: mocks.user, refresh: mocks.refresh }),
}));
vi.mock("../../lib/i18n", () => ({
  useLocale: () => ({ t: (key: string) => key }),
}));
beforeEach(() => {
  mocks.api.mockReset();
  mocks.refresh.mockReset().mockResolvedValue(undefined);
  mocks.user = { id: "member" };
  sessionStorage.clear();
});
afterEach(cleanup);

describe("completion persistence is independent of result rendering", () => {
  it("does not save or claim success just by opening Result", () => {
    function Harness() {
      const record = useCompletion("lessons", "lesson-1");
      return <Completion record={record} passed={false} />;
    }
    render(
      <MemoryRouter>
        <Harness />
      </MemoryRouter>,
    );
    expect(screen.getByText("practiceRequired")).toBeTruthy();
    expect(mocks.api).not.toHaveBeenCalled();
  });
  it("retries only persistence and suppresses concurrent and acknowledged duplicate saves", async () => {
    mocks.api.mockRejectedValueOnce(new Error("offline")).mockResolvedValue({
      completed: true,
      firstCompletion: true,
      xpAwarded: 100,
    });
    const { result } = renderHook(() => useCompletion("lessons", "lesson-1"));
    await act(async () => {
      await result.current.save();
    });
    expect(result.current.error).toBeTruthy();
    expect(result.current.result).toBeNull();
    await act(async () => {
      await Promise.all([result.current.save(), result.current.save()]);
    });
    expect(result.current.error).toBeNull();
    expect(result.current.result?.xpAwarded).toBe(100);
    await act(async () => {
      await result.current.save();
    });
    expect(mocks.api).toHaveBeenCalledTimes(2);
    expect(mocks.api).toHaveBeenLastCalledWith("/lessons/lesson-1/complete", {
      method: "POST",
      body: {},
    });
  });
  it("keeps guest completion in tab storage without sending account rewards", async () => {
    mocks.user = null;
    const { result } = renderHook(() =>
      useCompletion("daily-challenge", "today-id"),
    );
    await act(async () => {
      await result.current.save();
    });
    expect(sessionStorage.getItem("gitneapig-guest-daily-challenge-v1")).toBe(
      '["today-id"]',
    );
    expect(mocks.api).not.toHaveBeenCalled();
    expect(result.current.result?.xpAwarded).toBe(0);
  });
});
