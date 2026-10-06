export function lessonCachePath(path: string): boolean {
  return /^\/api\/v1\/lessons(?:\/(?:git-repository|staging-commit|branch))?$/.test(
    path,
  );
}
export function apiRequestCache(path: string, method: string): RequestCache {
  return method === "GET" && lessonCachePath(path) ? "default" : "no-store";
}
export function publicLessonResponse(response: Response): boolean {
  return (
    response.status === 200 &&
    response.headers.get("X-GitneaPig-Cache") === "public-lesson" &&
    !response.headers.has("Set-Cookie") &&
    !/no-store|private/i.test(response.headers.get("Cache-Control") ?? "")
  );
}
