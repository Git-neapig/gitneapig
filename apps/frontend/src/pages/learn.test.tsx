// @vitest-environment jsdom
import { StrictMode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRepository, modifyWorkingFile } from "@gitneapig/simulator";
import type { CompletionResponse, LessonDefinition } from "@gitneapig/shared";
import { SessionProvider } from "../lib/session";
import i18n from "../lib/i18n";
import { LessonPage } from "./learn";

const localized = { ko: "학습", en: "Lesson", ja: "学習" };
const lesson: LessonDefinition = {
  id: "lesson-1",
  slug: "test-lesson",
  order: 1,
  title: localized,
  summary: localized,
  difficulty: "BEGINNER",
  guestAccessible: true,
  xpReward: 100,
  stages: (
    ["SITUATION", "WHY", "CONCEPT", "COMMAND", "PRACTICE", "RESULT"] as const
  ).map((type) => ({ type, title: localized, body: localized })),
  practice: {
    goal: localized,
    relevantCommandKeys: [],
    initialState: modifyWorkingFile(
      createRepository({ "README.md": "before" }, true),
      "README.md",
      "after",
    ),
    successConditions: [
      {
        type: "STAGED_FILES",
        files: [{ path: "README.md", status: "modified" }],
      },
    ],
  },
};
let guest = false;
let previouslyCompleted = false;
let requests: { path: string; method: string; body: unknown }[];
let complete: () => Promise<Response>;
const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));
const saved: CompletionResponse = {
  completed: true,
  firstCompletion: true,
  xpAwarded: 100,
};
const completionRequests = () =>
  requests.filter(({ path }) => path.endsWith("/complete"));
beforeEach(async () => {
  guest = false;
  previouslyCompleted = false;
  requests = [];
  complete = () => json(saved);
  await i18n.changeLanguage("en");
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("fetch", async (url: URL, options: RequestInit = {}) => {
    const path = new URL(String(url)).pathname;
    requests.push({
      path,
      method: options.method ?? "GET",
      body: options.body ? JSON.parse(String(options.body)) : null,
    });
    if (path.endsWith("/auth/me"))
      return guest
        ? json({ error: { code: "UNAUTHORIZED" } }, 401)
        : json({ user: { id: "member", language: "en" } });
    if (path.endsWith("/complete")) return complete();
    if (path.endsWith("/progress")) return json({});
    if (path.endsWith("/lessons"))
      return json({
        items: [
          {
            ...lesson,
            progress: {
              completed: previouslyCompleted,
              highestReachedStageIndex: 0,
            },
          },
        ],
      });
    if (path.endsWith("/test-lesson")) return json(lesson);
    throw new Error(`Unexpected request: ${path}`);
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const mount = (stage = "PRACTICE") =>
  render(
    <StrictMode>
      <MemoryRouter initialEntries={[`/learn/test-lesson?stage=${stage}`]}>
        <SessionProvider>
          <Routes>
            <Route path="/learn/:slug" element={<LessonPage />} />
          </Routes>
        </SessionProvider>
      </MemoryRouter>
    </StrictMode>,
  );
async function practice() {
  await screen.findByRole("textbox", { name: "Git command" });
}
function run(command: string) {
  const input = screen.getByRole("textbox", { name: "Git command" });
  fireEvent.change(input, { target: { value: command } });
  fireEvent.submit(input.closest("form")!);
}
const back = () =>
  fireEvent.click(screen.getByRole("button", { name: "Back" }));

describe("lesson goal, API and result integration", () => {
  it("rejects failed commands and direct RESULT navigation without saving", async () => {
    const view = mount();
    await practice();
    run("git unsupported");
    expect(
      (screen.getByRole("button", { name: "Next" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    expect(completionRequests()).toHaveLength(0);
    view.unmount();
    mount("RESULT");
    await screen.findByRole("heading", { name: i18n.t("practiceRequired") });
    expect(completionRequests()).toHaveLength(0);
    expect(screen.queryByText(/XP earned/)).toBeNull();
  });

  it("saves once in StrictMode, retains a pending save across reset, and displays server XP", async () => {
    let resolve!: (response: Response) => void;
    complete = () =>
      new Promise((done) => {
        resolve = done;
      });
    mount();
    await practice();
    run("git add README.md");
    await screen.findByText(i18n.t("savingCompletion"));
    expect(completionRequests()).toHaveLength(1);
    back();
    await practice();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    run("git add README.md");
    await screen.findByText(i18n.t("savingCompletion"));
    expect(completionRequests()).toHaveLength(1);
    await act(async () => {
      resolve(await json(saved));
    });
    await screen.findByText("Progress saved.");
    expect(screen.getByText("XP earned: +100")).toBeTruthy();
    back();
    await practice();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    run("git add README.md");
    await screen.findByText("Progress saved.");
    expect(completionRequests()).toHaveLength(1);
  });

  it("retries a failed save once on repeated clicks and shows zero repeat reward", async () => {
    complete = () => json({ error: { code: "REQUEST_ERROR" } }, 500);
    mount();
    await practice();
    run("git add README.md");
    const retry = await screen.findByRole("button", { name: "Retry saving" });
    expect(screen.queryByText("Progress saved.")).toBeNull();
    let resolve!: (response: Response) => void;
    complete = () =>
      new Promise((done) => {
        resolve = done;
      });
    fireEvent.click(retry);
    fireEvent.click(retry);
    expect(completionRequests()).toHaveLength(2);
    await act(async () => {
      resolve(
        await json({ completed: true, firstCompletion: false, xpAwarded: 0 }),
      );
    });
    await screen.findByText(i18n.t("alreadyRewarded"));
    expect(screen.queryByText(/XP earned:/)).toBeNull();
  });

  it("allows guest success without member writes or an earned XP claim", async () => {
    guest = true;
    mount();
    await practice();
    run("git add README.md");
    await screen.findByRole("heading", { name: "Lesson Complete!" });
    expect(requests.filter(({ method }) => method !== "GET")).toEqual([]);
    expect(screen.queryByText("Progress saved.")).toBeNull();
    expect(screen.queryByText(/XP earned:/)).toBeNull();
  });

  it("shows existing completion without automatically awarding again", async () => {
    previouslyCompleted = true;
    mount("RESULT");
    await screen.findByText(i18n.t("alreadyRewarded"));
    expect(completionRequests()).toHaveLength(0);
  });

  it("persists the reached stage only for members", async () => {
    mount("SITUATION");
    await screen.findByRole("heading", { name: "Lesson" });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() =>
      expect(
        requests.some(
          ({ path, method, body }) =>
            path.endsWith("/progress") &&
            method === "PATCH" &&
            JSON.stringify(body) === '{"highestReachedStageIndex":1}',
        ),
      ).toBe(true),
    );
    expect(completionRequests()).toHaveLength(0);
  });
});
