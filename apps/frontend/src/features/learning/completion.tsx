import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { CompletionResponse } from "@gitneapig/shared";
import { useSession } from "../../lib/session";
import { useLocale } from "../../lib/i18n";
import { Alert, Button } from "../../components/ui";

export function Completion({
  record,
  passed,
  previouslyCompleted = false,
  daily = false,
  title,
  summary,
}: {
  record: {
    result: CompletionResponse | null;
    busy: boolean;
    error: unknown;
    save: () => Promise<void>;
  };
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
