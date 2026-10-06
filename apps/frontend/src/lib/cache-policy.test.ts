import { describe, expect, it } from "vitest";
import {
  apiRequestCache,
  lessonCachePath,
  publicLessonResponse,
} from "./cache-policy";
describe("public-only persistent caches", () => {
  it.each([
    "/api/v1/auth/me",
    "/api/v1/profile",
    "/api/v1/profile/api-keys",
    "/api/v1/friends",
    "/api/v1/bookmarks",
    "/api/v1/reference/commands/merge",
    "/api/v1/lessons/lesson-1/complete",
    "/api/v1/lessons/merge",
    "/api/v1/lessons/remote",
    "/uploads/avatars/user.png",
  ])("never matches %s", (path) => expect(lessonCachePath(path)).toBe(false));
  it("permits offline reads only for the public lesson catalog and keeps all writes private", () => {
    for (const path of [
      "/api/v1/lessons",
      "/api/v1/lessons/git-repository",
      "/api/v1/lessons/staging-commit",
      "/api/v1/lessons/branch",
    ])
      expect(apiRequestCache(path, "GET")).toBe("default");
    for (const [path, method] of [
      ["/api/v1/profile", "GET"],
      ["/api/v1/lessons/merge", "GET"],
      ["/api/v1/lessons", "POST"],
      ["/api/v1/lessons/git-repository", "PATCH"],
    ])
      expect(apiRequestCache(path, method)).toBe("no-store");
  });
  it("requires the backend's explicit public projection marker and rejects Set-Cookie/private/no-store", () => {
    expect(publicLessonResponse(new Response("{}"))).toBe(false);
    const headers = {
      "X-GitneaPig-Cache": "public-lesson",
      "Cache-Control": "public, max-age=300",
    };
    expect(publicLessonResponse(new Response("{}", { headers }))).toBe(true);
    const forbiddenHeaders: Record<string, string>[] = [
      { "Cache-Control": "no-store" },
      { "Cache-Control": "private" },
      { "Set-Cookie": "session=secret" },
    ];
    for (const forbidden of forbiddenHeaders)
      expect(
        publicLessonResponse(
          new Response("{}", { headers: { ...headers, ...forbidden } }),
        ),
      ).toBe(false);
    expect(
      publicLessonResponse(new Response("{}", { headers, status: 401 })),
    ).toBe(false);
  });
});
