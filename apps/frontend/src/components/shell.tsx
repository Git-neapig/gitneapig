import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ChevronDown, LockKeyhole, Menu, X, LogOut, WifiOff } from "lucide-react";
import type { Language } from "@gitneapig/shared";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/session";
import { Avatar, IconButton } from "./ui";
import { Failure, Loading } from "./feedback";
export const accountLinks: string[][] = [];
const navigation: string[][] = [];
export function Shell() {
  const { t, language } = useLocale(),
    session = useSession(),
    location = useLocation();
  const [menu, setMenu] = useState(false),
    [accountOpen, setAccountOpen] = useState(false),
    [error, setError] = useState<unknown>(null),
    [online, setOnline] = useState(navigator.onLine);
  const account = useRef<HTMLDivElement>(null),
    accountTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!accountOpen) return;
    const outside = (event: PointerEvent) => {
      if (!account.current?.contains(event.target as Node))
        setAccountOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        accountTrigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [accountOpen]);
  useEffect(() => {
    setMenu(false);
    setAccountOpen(false);
    document.title = "GitneaPig";
    if (location.pathname !== "/") window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    const connection = (event: Event) =>
      setOnline((event as CustomEvent<boolean>).detail);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    window.addEventListener("gitneapig:connection", connection);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("gitneapig:connection", connection);
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("skipContent")}
      </a>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="GitneaPig">
            <img
              src="/mascots/logo/navbar-mascot-white.png"
              alt=""
              width="36"
              height="36"
            />
            <span>
              Gitnea<span>Pig</span>
            </span>
          </Link>
          <nav
            className={`main-navigation ${menu ? "is-open" : ""}`}
            aria-label={t("menu")}
          >
            {navigation.map(([to, key]) => (
              <NavLink key={to} to={to}>
                {t(key)}
                {key === "reference" && !session.user && !session.loading ? (
                  <LockKeyhole size={13} aria-hidden />
                ) : null}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <select
              className="language-select"
              aria-label={t("language")}
              value={language}
              onChange={(e) => {
                setError(null);
                void session
                  .setLanguage(e.target.value as Language)
                  .catch(setError);
              }}
            >
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
            </select>
            {session.loading ? (
              <span className="session-placeholder" aria-label={t("loading")} />
            ) : session.user ? (
              <>
                <span className="header-progress">
                  {t("level")} {session.user.level}
                  <small>{session.user.xp} XP</small>
                </span>
                <div
                  ref={account}
                  className="account-menu"
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setAccountOpen(true);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") setAccountOpen(false);
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget))
                      setAccountOpen(false);
                  }}
                >
                  <button
                    ref={accountTrigger}
                    className="account-trigger"
                    aria-label={t("profile")}
                    aria-expanded={accountOpen}
                    aria-controls="account-links"
                    onClick={() => setAccountOpen((open) => !open)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowDown") {
                        event.preventDefault();
                        setAccountOpen(true);
                      }
                    }}
                  >
                    <Avatar
                      src={session.user.avatarUrl}
                      alt={session.user.nickname}
                      size="sm"
                    />
                    <ChevronDown size={16} />
                  </button>
                  {accountOpen ? (
                    <div className="account-menu-items" id="account-links">
                      {accountLinks.map(([to, key]) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setAccountOpen(false)}
                        >
                          {t(key)}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          void session.logout().catch(setError);
                        }}
                      >
                        <LogOut size={16} />
                        {t("logout")}
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="button button-sm">
                  {t("login")}
                </Link>
                <Link
                  to="/signup"
                  className="button button-primary button-sm header-signup"
                >
                  {t("signup")}
                </Link>
              </>
            )}
            <IconButton
              className="mobile-menu-button"
              label={menu ? t("close") : t("menu")}
              onClick={() => setMenu(!menu)}
              aria-expanded={menu}
            >
              {menu ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
          </div>
        </div>
      </header>
      {!online ? (
        <div className="offline-banner" role="status">
          <WifiOff size={16} />
          {t("offline")} · {t("offlineNote")}
        </div>
      ) : null}
      {error ? <Failure error={error} retry={() => setError(null)} /> : null}
      <main
        id="main-content"
        className={location.pathname === "/" ? "home-main" : "page"}
        key={session.epoch}
      >
        {session.loading ? <Loading /> : <Outlet />}
      </main>
    </>
  );
}
