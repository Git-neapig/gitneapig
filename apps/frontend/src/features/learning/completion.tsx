import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { CompletionResponse } from "@gitneapig/shared";
import { api } from "../../lib/api";
import { useSession } from "../../lib/session";
import { useLocale } from "../../lib/i18n";
import { Alert, Button } from "../../components/ui";

export function guestCompleted(kind: string): string[] {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(`gitneapig-guest-${kind}-v1`) ?? "[]",
    );
    return Array.isArray(value)
      ? value.filter((v) => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

// Keep this in the runner: navigation/reset must not discard a pending save.
export function useCompletion(
  kind: "lessons" | "quests" | "daily-challenge",
  id: string,
) {
  const { user, refresh } = useSession();
  const [result, setResult] = useState<CompletionResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const inFlight = useRef(false),
    saved = useRef(false);
  const save = useCallback(async () => {
    if (inFlight.current || saved.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      let response: CompletionResponse;
      if (user) {
        response = await api<CompletionResponse>(`/${kind}/${id}/complete`, {
          method: "POST",
          body: {},
        });
      } else {
        const completed = guestCompleted(kind);
        response = {
          completed: true,
          firstCompletion: !completed.includes(id),
          xpAwarded: 0,
        };
        sessionStorage.setItem(
          `gitneapig-guest-${kind}-v1`,
          JSON.stringify([...new Set([...completed, id])]),
        );
      }
      saved.current = true;
      setResult(response);
      // Profile refresh cannot invalidate an acknowledged completion.
      if (user) void refresh().catch(() => undefined);
    } catch (failure) {
      setError(failure);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [id, kind, user, refresh]);
  return { result, busy, error, save };
}

export function Completion({
  record,
  passed,
  previouslyCompleted = false,
  daily = false,
  title,
  summary,
}: {
  record: ReturnType<typeof useCompletion>;
  passed: boolean;
  previouslyCompleted?: boolean;
  daily?: boolean;
  title?: string;
  summary?: string;
}) {
  const { user } = useSession(),
    { t, text } = useLocale();
  const done = passed || !!record.result || previouslyCompleted;
  return (
    <section className="completion" aria-live="polite">
      {done ? <CheckCircle2 size={32} className="tone-success" /> : null}
      <h2>
        {done && title
          ? title
          : t(done ? (daily ? "dailySuccess" : "success") : "practiceRequired")}
      </h2>
      {done && summary ? <p className="completion-summary">{summary}</p> : null}
      {record.busy ? <p role="status">{t("savingCompletion")}</p> : null}
      {record.error ? (
        <Alert tone="warning">
          <p>{t("completionSaveFailed")}</p>
          <Button
            loading={record.busy}
            onClick={() => {
              void record.save();
            }}
          >
            {t("retrySave")}
          </Button>
        </Alert>
      ) : null}
      {record.result ? (
        <>
          <p>
            {user
              ? text({
                  ko: "진행 상황이 저장되었습니다.",
                  en: "Progress saved.",
                  ja: "進捗が保存されました。",
                })
              : t("allDone")}
          </p>
          {user ? (
            <p className="reward">
              {record.result.firstCompletion
                ? `${t("earned")}: +${record.result.xpAwarded}`
                : t("alreadyRewarded")}
            </p>
          ) : (
            <Alert>
              {t("guestCta")}{" "}
              <Link to="/signup" className="text-link">
                {t("signup")}
              </Link>
            </Alert>
          )}
        </>
      ) : previouslyCompleted ? (
        <p>{t("alreadyRewarded")}</p>
      ) : null}
    </section>
  );
}
