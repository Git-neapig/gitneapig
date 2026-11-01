import { useEffect, useRef, useState } from "react";
import type { DailyChallengeDefinition } from "@gitneapig/shared";
import { useResource } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/session";
import { Avatar, Badge, Button } from "../components/ui";
import { Failure, Loading, PageHeading } from "../components/feedback";
import { useSimulator } from "../features/workspace/use-simulator";
import { ResetButton, Workspace } from "../features/workspace/workspace";
import {
  Completion,
  guestCompleted,
  useCompletion,
} from "../features/learning/completion";

import "./quest-daily-final.css";

export function DailyPage() {
  const { user, epoch } = useSession();
  const resource = useResource<DailyChallengeDefinition>(
    "/daily-challenge/today",
  );
  const progress = useResource<{ completed: boolean }>(
    user && resource.data
      ? `/daily-challenge/${resource.data.id}/progress`
      : null,
    epoch,
  );
  if (resource.error || progress.error)
    return (
      <Failure
        error={resource.error ?? progress.error}
        retry={() => {
          resource.refresh();
          progress.refresh();
        }}
      />
    );
  if (resource.loading || (user && (progress.loading || !progress.data)))
    return <Loading />;
  return resource.data ? (
    <DailyRunner
      key={`${resource.data.id}:${user?.id ?? "guest"}`}
      definition={resource.data}
      previouslyCompleted={
        user
          ? !!progress.data?.completed
          : guestCompleted("daily-challenge").includes(resource.data.id)
      }
    />
  ) : null;
}
function DailyRunner({
  definition,
  previouslyCompleted,
}: {
  definition: DailyChallengeDefinition;
  previouslyCompleted: boolean;
}) {
  const { t, text } = useLocale();
  const [resultView, setResultView] = useState(previouslyCompleted),
    [hints, setHints] = useState(0);
  const runtime = useSimulator(
    definition.initialState,
    definition.successConditions,
  );
  const record = useCompletion("daily-challenge", definition.id),
    transitioned = useRef(-1);
  const { save } = record;
  useEffect(() => {
    if (!runtime.passed || transitioned.current === runtime.attempt) return;
    transitioned.current = runtime.attempt;
    setResultView(true);
    void save();
  }, [runtime.passed, runtime.attempt, save]);
  function reset() {
    runtime.reset();
    setHints(0);
    setResultView(false);
  }
  function run(command: string) {
    if (resultView || runtime.passed) return;
    if (command.trim() === "hint") {
      setHints((value) => Math.min(3, value + 1));
      return;
    }
    runtime.run(command);
  }
  const guide = (
    <aside className="daily-guide" aria-live="polite">
      <Avatar src="/mascots/characters/cream/avatar.png" alt="Guide" />
      <p>
        {resultView
          ? t("dailySuccess")
          : hints
            ? `${text(definition.hints[hints - 1])} (${hints}/3)`
            : text({
                ko: "터미널에 hint를 입력하면 힌트를 볼 수 있습니다. 정답을 공개하지 않는 3단계 안내입니다.",
                en: "Type hint in the terminal for three levels of guidance, without revealing the solution.",
                ja: "ターミナルにhintと入力してください。答えを明かさず3段階で案内します。",
              })}
      </p>
    </aside>
  );
  return (
    <div className={`daily-final${resultView ? " is-complete" : ""}`}>
      <PageHeading
        title={t("daily")}
        actions={<Badge tone="primary">{definition.dateKey}</Badge>}
      />
      <div className="section-label">
        <div>
          <h2>{text(definition.title)}</h2>
          <p className="muted">{text(definition.description)}</p>
        </div>
        {!resultView ? <ResetButton reset={reset} /> : null}
      </div>
      {resultView ? (
        <div className="daily-completion-banner">
          <Completion
            record={record}
            passed={runtime.passed}
            previouslyCompleted={previouslyCompleted}
            daily
          />
          <Button onClick={reset}>{t("restart")}</Button>
        </div>
      ) : null}
      {!resultView || runtime.passed ? (
        <Workspace
          key={runtime.attempt}
          state={runtime.repository}
          entries={runtime.entries}
          onRun={run}
          onEdit={runtime.edit}
          readOnly={resultView}
          toolFooter={guide}
        />
      ) : (
        <p className="daily-no-snapshot">
          {text({
            ko: "오늘의 완료 기록은 저장되어 있습니다. 이전 실습의 터미널 기록과 최종 상태는 보관되지 않습니다. 다시하기로 새 실습을 시작할 수 있습니다.",
            en: "Today's completion is saved. Terminal history and the final repository state from the previous session are not stored. Try again to start a fresh attempt.",
            ja: "今日の完了記録は保存されています。前回のターミナル履歴と最終状態は保存されていません。再挑戦で新しい実習を始められます。",
          })}
        </p>
      )}
    </div>
  );
}
