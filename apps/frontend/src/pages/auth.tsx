import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { AuthResponse } from "@gitneapig/shared";
import { api } from "../lib/api";
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
