import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthResponse, CurrentUser, Language } from "@gitneapig/shared";
import { api, ApiClientError } from "./api";
import i18n from "./i18n";
type Session = {
  user: CurrentUser | null;
  loading: boolean;
  epoch: number;
  setUser: (user: CurrentUser | null) => void;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  setLanguage: (language: Language) => Promise<void>;
};
const Context = createContext<Session | null>(null);
export function safePath(value: string | null): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/";
  try {
    const decoded = decodeURIComponent(value);
    if (
      decoded.startsWith("//") ||
      decoded.includes("\\") ||
      /\s/.test(decoded)
    )
      return "/";
    const url = new URL(value, location.origin);
    return url.origin === location.origin && !url.pathname.startsWith("/api/")
      ? `${url.pathname}${url.search}${url.hash}`
      : "/";
  } catch {
    return "/";
  }
}
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, updateUser] = useState<CurrentUser | null>(null),
    [loading, setLoading] = useState(true),
    [epoch, setEpoch] = useState(0);
  const navigate = useNavigate();
  const identity = useRef<string | null>(null);
  const setUser = useCallback((next: CurrentUser | null) => {
    const nextId = next?.id ?? null;
    if (identity.current !== nextId) {
      identity.current = nextId;
      setEpoch((value) => value + 1);
    }
    updateUser(next);
    if (next) void i18n.changeLanguage(next.language);
  }, []);
  const refresh = useCallback(async () => {
    try {
      const result = await api<AuthResponse>("/auth/me");
      setUser(result.user);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401)
        setUser(null);
      else throw error;
    }
  }, [setUser]);
  useEffect(() => {
    let active = true;
    void api<AuthResponse>("/auth/me")
      .then((result) => {
        if (active) setUser(result.user);
      })
      .catch(() => {
        if (active) updateUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setUser]);
  async function logout() {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    navigate("/");
  }
  async function setLanguage(language: Language) {
    await i18n.changeLanguage(language);
    try {
      localStorage.setItem("gitneapig-language-v1", language);
    } catch {
      /* Preference storage is optional. */
    }
  }
  return (
    <Context.Provider
      value={{ user, loading, epoch, setUser, refresh, logout, setLanguage }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSession() {
  const context = useContext(Context);
  if (!context) throw new Error("Missing SessionProvider");
  return context;
}
