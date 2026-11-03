import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { AuthResponse } from "@gitneapig/shared";
import { api, ApiClientError } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { safePath, useSession } from "../lib/session";
import { Alert, Button, PasswordInput, TextInput } from "../components/ui";
import { Failure } from "../components/feedback";
import { AvatarPicker } from "../features/account/avatar-picker";
export function AuthPage({ signup = false }: { signup?: boolean }) {
  const { t } = useLocale(),
    session = useSession(),
    [query] = useSearchParams(),
    navigate = useNavigate(),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [nickname, setNickname] = useState(""),
    [preset, setPreset] = useState("primary"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<unknown>(null);
  const returnTo = safePath(query.get("returnTo"));
  async function submit() {
    setBusy(true);
    setError(null);
    try {
      const response = await api<AuthResponse>(
        signup ? "/auth/signup" : "/auth/login",
        {
          method: "POST",
          body: signup
            ? {
                email: email.trim(),
                password,
                nickname: nickname.trim(),
                avatarPresetKey: preset,
              }
            : { email: email.trim(), password },
        },
      );
      session.setUser(response.user);
      navigate(returnTo, { replace: true });
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-page">
      <img
        className="auth-mascot"
        src="/mascots/characters/primary/bust.png"
        alt=""
      />
      <h1>{t(signup ? "signup" : "login")}</h1>
      {query.get("reason") === "session-expired" ? (
        <Alert tone="warning">{t("sessionExpired")}</Alert>
      ) : null}
      {query.get("oauthError") ? (
        <Alert tone="danger">
          {t(
            query.get("oauthError") === "unavailable"
              ? "oauthUnavailable"
              : "oauthError",
          )}
        </Alert>
      ) : null}
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <TextInput
          label={t("email")}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordInput
          label={t("password")}
          required
          minLength={8}
          maxLength={128}
          autoComplete={signup ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
          helper={signup ? t("passwordRule") : undefined}
        />
        {signup ? (
          <>
            <TextInput
              label={t("nickname")}
              required
              minLength={3}
              maxLength={20}
              autoComplete="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              helper={t("nicknameRule")}
            />
            <AvatarPicker value={preset} onChange={setPreset} />
          </>
        ) : null}
        {error ? <Failure error={error} /> : null}
        <Button type="submit" variant="primary" loading={busy}>
          {t(signup ? "signup" : "login")}
        </Button>
      </form>
      <div className="auth-divider">{t("or")}</div>
      <a
        className="button full-width"
        href={`/api/v1/auth/42?returnTo=${encodeURIComponent(returnTo)}`}
      >
        {t("login42")}
      </a>
      <p className="auth-switch">
        <Link
          className="text-link"
          to={`/${signup ? "login" : "signup"}?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {t(signup ? "login" : "signup")}
        </Link>
      </p>
    </section>
  );
}
export function OnboardingPage() {
  const { t } = useLocale(),
    session = useSession(),
    navigate = useNavigate(),
    [nickname, setNickname] = useState(""),
    [preset, setPreset] = useState("primary"),
    [custom, setCustom] = useState(false),
    [error, setError] = useState<unknown>(null),
    [busy, setBusy] = useState(false);
  async function submit(form: HTMLFormElement) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/auth/42/onboarding", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        body: new FormData(form),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new ApiClientError(
          data?.error?.code ?? "REQUEST_ERROR",
          response.status,
        );
      }
      if (!response.redirected)
        throw new ApiClientError("REQUEST_ERROR", response.status);
      await session.refresh();
      const target = new URL(response.url);
      navigate(safePath(target.pathname + target.search), { replace: true });
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-page">
      <h1>{t("onboarding")}</h1>
      <form
        className="stack"
        action="/api/v1/auth/42/onboarding"
        method="post"
        encType="multipart/form-data"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(event.currentTarget);
        }}
      >
        <TextInput
          name="nickname"
          label={t("nickname")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
          minLength={3}
          maxLength={20}
        />
        {!custom ? <AvatarPicker value={preset} onChange={setPreset} /> : null}
        <label className="checkbox">
          <input
            type="checkbox"
            checked={custom}
            onChange={(e) => setCustom(e.target.checked)}
          />
          {t("upload")}
        </label>
        {custom ? (
          <TextInput
            name="avatar"
            label={t("avatar")}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            helper={t("imageRule")}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 2 * 1024 * 1024) {
                e.target.value = "";
                setError(new ApiClientError("FILE_TOO_LARGE", 413));
              } else setError(null);
            }}
          />
        ) : null}
        {error ? <Failure error={error} /> : null}
        <Button type="submit" variant="primary" loading={busy}>
          {t("continue")}
        </Button>
      </form>
    </section>
  );
}
