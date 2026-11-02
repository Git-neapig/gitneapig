import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { AuthResponse, Language } from "@gitneapig/shared";
import { api } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/session";
import { Alert, Avatar, Button, Select, TextInput } from "../components/ui";
import { Failure, PageHeading } from "../components/feedback";
import { AvatarPicker } from "../features/account/avatar-picker";

export function EditProfilePage() {
  const session = useSession(),
    { t } = useLocale(),
    [nickname, setNickname] = useState(session.user?.nickname ?? ""),
    [language, setLanguage] = useState<Language>(
      session.user?.language ?? "ko",
    ),
    [preset, setPreset] = useState(""),
    [file, setFile] = useState<File | null>(null),
    [uploadVersion, setUploadVersion] = useState(0),
    [preview, setPreview] = useState(""),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false),
    [error, setError] = useState<unknown>(null);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  useEffect(() => {
    if (!saved) return;
    const timeout = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [saved, uploadVersion]);
  async function submit() {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      let result = await api<AuthResponse>("/profile", {
        method: "PATCH",
        body: {
          nickname: nickname.trim(),
          language,
          ...(preset ? { avatarPresetKey: preset } : {}),
        },
      });
      if (file) {
        const body = new FormData();
        body.set("avatar", file);
        result = await api<AuthResponse>("/profile/avatar", {
          method: "POST",
          body,
        });
      }
      session.setUser(result.user);
      setFile(null);
      setPreset("");
      setUploadVersion((value) => value + 1);
      setSaved(true);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  async function removeAvatar() {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const result = await api<AuthResponse>("/profile", {
        method: "PATCH",
        body: { avatarPresetKey: "default" },
      });
      session.setUser(result.user);
      setFile(null);
      setPreset("");
      setUploadVersion((value) => value + 1);
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading title={t("settings")} />
      <form
        className="settings-form stack"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Avatar
          src={
            preview ||
            (preset
              ? `/mascots/characters/${preset === "default" ? "primary" : preset}/avatar.png`
              : session.user?.avatarUrl)
          }
          alt={t("avatar")}
          size="xl"
        />
        <TextInput
          label={t("nickname")}
          required
          minLength={3}
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <Select
          label={t("language")}
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          <option value="ko">한국어</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </Select>
        <AvatarPicker
          value={preset}
          onChange={(key) => {
            setPreset(key);
            setFile(null);
          }}
        />
        <Button
          onClick={() => {
            setPreset("default");
            setFile(null);
          }}
        >
          {t("defaultAvatar")}
        </Button>
        <TextInput
          label={t("upload")}
          key={uploadVersion}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          helper={t("imageRule")}
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (
              selected &&
              (selected.size > 2 * 1024 * 1024 ||
                !["image/jpeg", "image/png", "image/webp"].includes(
                  selected.type,
                ))
            ) {
              e.target.value = "";
              setError(new Error("Invalid image"));
              return;
            }
            setFile(selected ?? null);
            setPreset("");
            setError(null);
          }}
        />
        {file || session.user?.avatarUrl?.startsWith("/uploads/") ? (
          <Button
            variant="danger"
            loading={busy}
            onClick={() => {
              void removeAvatar();
            }}
          >
            <Trash2 size={16} />
            {t("deleteAvatar")}
          </Button>
        ) : null}
        {error ? <Failure error={error} /> : null}
        {saved ? <Alert tone="success">{t("saved")}</Alert> : null}
        <Button type="submit" variant="primary" loading={busy}>
          {t("save")}
        </Button>
      </form>
    </>
  );
}
