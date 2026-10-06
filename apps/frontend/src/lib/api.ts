import { useEffect, useState } from "react";
import { apiRequestCache, lessonCachePath } from "./cache-policy";
export class ApiClientError extends Error {
  constructor(
    public code: string,
    public status: number,
    public field?: string,
  ) {
    super(code);
  }
}
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  let response: Response;
  try {
    const url = new URL(`/api/v1${path}`, location.origin);
    const method = options.method ?? "GET";
    response = await fetch(url, {
      method,
      credentials: "same-origin",
      signal: options.signal,
      cache: apiRequestCache(url.pathname, method),
      ...(options.body !== undefined
        ? {
            body:
              options.body instanceof FormData
                ? options.body
                : JSON.stringify(options.body),
            headers:
              options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" },
          }
        : {}),
    });
    if (!lessonCachePath(url.pathname))
      window.dispatchEvent(
        new CustomEvent("gitneapig:connection", { detail: true }),
      );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    window.dispatchEvent(
      new CustomEvent("gitneapig:connection", { detail: false }),
    );
    throw new ApiClientError("NETWORK_ERROR", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const error = new ApiClientError(
      body?.error?.code ?? "REQUEST_ERROR",
      response.status,
      body?.error?.field,
    );
    if (error.code === "SESSION_EXPIRED")
      window.dispatchEvent(new Event("gitneapig:session-expired"));
    throw error;
  }
  return response.status === 204
    ? (undefined as T)
    : (response.json() as Promise<T>);
}
export function errorKey(error: unknown): string {
  const codes: Record<string, string> = {
    DAILY_CHALLENGE_EXPIRED: "DAILY_CHALLENGE_EXPIRED",
    NETWORK_ERROR: "networkError",
    INVALID_CREDENTIALS: "invalidCredentials",
    NICKNAME_TAKEN: "nicknameTaken",
    EMAIL_TAKEN: "emailTaken",
    SESSION_EXPIRED: "sessionExpired",
    UNAUTHORIZED: "memberOnly",
    AUTH_REQUIRED: "memberOnly",
    QUEST_LOCKED: "prereq",
    VALIDATION_ERROR: "invalidInput",
    INVALID_IMAGE: "imageRule",
    INVALID_FILE_TYPE: "imageRule",
    FILE_TOO_LARGE: "imageRule",
    OAUTH_NOT_CONFIGURED: "oauthUnavailable",
  };
  return error instanceof ApiClientError
    ? (codes[error.code] ?? "error")
    : "error";
}
export function useResource<T>(path: string | null, refreshKey: unknown = 0) {
  const [state, setState] = useState<{
    data: T | null;
    error: unknown;
    loading: boolean;
  }>({ data: null, error: null, loading: !!path });
  const [revision, refresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    if (!path) {
      setState({ data: null, error: null, loading: false });
      return;
    }
    setState({ data: null, error: null, loading: true });
    void api<T>(path, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ data: null, error, loading: false });
      });
    return () => controller.abort();
  }, [path, revision, refreshKey]);
  return { ...state, refresh: () => refresh((value) => value + 1) };
}
