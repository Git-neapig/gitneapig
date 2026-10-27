import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import type {
  LessonDefinition,
  LessonProgressSummary,
  LessonSummary,
} from "@gitneapig/shared";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/session";
import { api, useResource } from "../lib/api";
import { Failure, Loading, PageHeading } from "../components/feedback";
import {
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Dialog,
  ProgressBar,
} from "../components/ui";
import { useSimulator } from "../features/workspace/use-simulator";
import { Workspace, ResetButton } from "../features/workspace/workspace";
import { GitGraph } from "../features/workspace/graph";
import {
  Completion,
  useCompletion,
} from "../features/learning/completion";
type LessonItem = LessonSummary & { progress?: LessonProgressSummary };
export function LearnPage() {
  const { t, text } = useLocale(),
    { user, epoch } = useSession(),
    resource = useResource<{ items: LessonItem[] }>("/lessons", epoch);
  return (
    <>
      <PageHeading title={t("learn")} description={t("learnDescription")} />
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="lesson-list">
          {resource.data?.items.map((lesson) => {
            const locked = !user && !lesson.guestAccessible,
              done =
                lesson.progress?.completed,
              inProgress =
                !done && (lesson.progress?.highestReachedStageIndex ?? 0) > 0;
            return (
              <Card
                key={lesson.id}
                variant={
                  locked
                    ? "locked"
                    : done
                      ? "success"
                      : inProgress
                        ? "selected"
                        : "default"
                }
              >
                <div className="lesson-number">
                  {String(lesson.order).padStart(2, "0")}
                </div>
                <div className="lesson-list-content">
                  <div className="actions">
                    <Badge>{t(lesson.difficulty)}</Badge>
                    <Badge
                      tone={
                        locked
                          ? "locked"
                          : done
                            ? "success"
                            : inProgress
                              ? "primary"
                              : "neutral"
                      }
                    >
                      {t(
                        locked
                          ? "locked"
                          : done
                            ? "completed"
                            : inProgress
                              ? "currentLesson"
                              : "available",
                      )}
                    </Badge>
                    <span className="muted">{lesson.xpReward} XP</span>
                    {done ? (
                      <CheckCircle2 size={18} className="tone-success" />
                    ) : null}
                  </div>
                  <h2>
                    <Link
                      className="card-link"
                      to={
                        locked
                          ? `/login?returnTo=${encodeURIComponent(`/learn/${lesson.slug}`)}`
                          : `/learn/${lesson.slug}`
                      }
                    >
                      {text(lesson.title)}
                    </Link>
                  </h2>
                  <p className="muted">{text(lesson.summary)}</p>
                  {lesson.progress || done ? (
                    <ProgressBar
                      value={
                        done ? 100 : (lesson.progress?.progressPercent ?? 0)
                      }
                      label={t("progress")}
                    />
                  ) : null}
                </div>
                {locked ? <LockKeyhole size={18} /> : <ArrowRight size={18} />}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
export function LessonPage() {
  const { slug } = useParams(),
    session = useSession(),
    resource = useResource<LessonDefinition>(
      `/lessons/${encodeURIComponent(slug ?? "")}`,
      session.epoch,
    ),
    progress = useResource<{ items: LessonItem[] }>("/lessons", session.epoch);
  if (resource.loading || progress.loading) return <Loading />;
  if (resource.error)
    return <Failure error={resource.error} retry={resource.refresh} />;
  if (progress.error && session.user)
    return <Failure error={progress.error} retry={progress.refresh} />;
  return resource.data ? (
    <LessonRunner
      key={`${resource.data.id}:${session.user?.id ?? "guest"}`}
      lesson={resource.data}
      nextLesson={progress.data?.items.find(
        (item) => item.order === resource.data!.order + 1,
      )}
      progress={
        progress.data?.items.find((item) => item.id === resource.data?.id)
          ?.progress
      }
    />
  ) : null;
}
function LessonRunner({
  lesson,
  progress,
  nextLesson,
}: {
  lesson: LessonDefinition;
  progress?: LessonProgressSummary;
  nextLesson?: LessonSummary;
}) {
  const { t, text } = useLocale(),
    { user } = useSession(),
    runtime = useSimulator(
      lesson.practice.initialState,
      lesson.practice.successConditions,
    ),
    record = useCompletion("lessons", lesson.id),
    [query, setQuery] = useSearchParams(),
    [initialStage] = useState(
      progress?.completed
        ? 0
        : Math.min(progress?.highestReachedStageIndex ?? 0, 4),
    ),
    [showSolution, setShowSolution] = useState(false),
    [error, setError] = useState<unknown>(null);
  const requested = lesson.stages.findIndex(
    (item) => item.type === query.get("stage"),
  );
  const stageIndex = requested >= 0 ? requested : initialStage;
  const stage = lesson.stages[stageIndex],
    success = runtime.passed;
  const completed =
    !!progress?.completed ||
    !!record.result;
  const transitioned = useRef(-1);
  const { save } = record;
  useEffect(() => {
    if (!success || transitioned.current === runtime.attempt) return;
    transitioned.current = runtime.attempt;
    setQuery(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.set("stage", "RESULT");
        return next;
      },
      { replace: true },
    );
    void save();
  }, [success, runtime.attempt, setQuery, save]);
  function changeStage(index: number) {
    setQuery((previous) => {
      const next = new URLSearchParams(previous);
      next.set("stage", lesson.stages[index].type);
      return next;
    });
    if (user)
      void api(`/lessons/${lesson.id}/progress`, {
        method: "PATCH",
        body: { highestReachedStageIndex: index },
      }).catch(setError);
  }
  const visualization = stage.visualization;
  return (
    <>
      <Breadcrumb
        items={[
          { label: t("learn"), to: "/learn" },
          { label: text(lesson.title) },
        ]}
      />
      <div className="lesson-meta actions">
        <Badge tone="primary">{stageIndex + 1} / 6</Badge>
      </div>
      <ol className="lesson-stages">
        {lesson.stages.map((s, index) => (
          <li
            key={s.type}
            aria-current={stageIndex === index ? "step" : undefined}
            className={index <= stageIndex ? "reached" : ""}
          >
            <span>{index + 1}</span>
            {t(s.type)}
          </li>
        ))}
      </ol>
      {error ? (
        <Failure
          error={error}
          retry={() => {
            setError(null);
            changeStage(stageIndex);
          }}
        />
      ) : null}
      <section className={`lesson-stage lesson-${stage.type.toLowerCase()}`}>
        {stage.type !== "PRACTICE" && stage.type !== "RESULT" ? (
          <div className="section-label">
            <h1>{text(stage.title)}</h1>
          </div>
        ) : null}
        {stage.type !== "PRACTICE" && stage.type !== "RESULT" ? (
          <p className="lesson-body">{text(stage.body)}</p>
        ) : null}
        {visualization?.type === "TEAM_CONVERSATION" ? (
          <div className="conversation">
            {visualization.messages.map((message, index) => (
              <div
                key={message.id}
                className={`message ${index % 2 ? "message-reply" : ""}`}
              >
                <Avatar
                  src={`/mascots/characters/${message.avatarKey}/avatar.png`}
                  alt={message.speakerName}
                />
                <div>
                  <strong>{message.speakerName}</strong>
                  <p>{text(message.message)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : visualization?.type === "COMPARISON" ? (
          <div className="comparison">
            <div>{text(visualization.left)}</div>
            <ArrowRight size={24} />
            <div>{text(visualization.right)}</div>
          </div>
        ) : visualization?.type === "GIT_GRAPH" ? (
          <div className="lesson-graph">
            <GitGraph state={visualization.state} />
          </div>
        ) : null}
        {stage.commandExamples ? (
          <div className="lesson-examples">
            {stage.commandExamples.map((example) => (
              <section key={example.command}>
                <pre>{example.command}</pre>
                <p>{text(example.explanation)}</p>
                {example.example ? <pre>{example.example}</pre> : null}
                {example.comparisonNote ? (
                  <small className="muted">
                    {text(example.comparisonNote)}
                  </small>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}
        {stage.type === "PRACTICE" ? (
          <>
            <div className="lesson-practice-introduction">
              <div className="section-label">
                <h1>{text(stage.title)}</h1>
                <div className="actions">
                  {completed ? (
                    <Button onClick={() => setShowSolution(true)}>
                      {t("viewSolution")}
                    </Button>
                  ) : null}
                  <ResetButton reset={runtime.reset} />
                </div>
              </div>
              <p className="goal-line">{text(lesson.practice.goal)}</p>
              <p className="lesson-body">{text(stage.body)}</p>
            </div>
            <Workspace
              key={runtime.attempt}
              state={runtime.repository}
              entries={runtime.entries}
              onRun={runtime.run}
              onEdit={runtime.edit}
            />
            {success ? <Alert tone="success">{t("success")}</Alert> : null}
          </>
        ) : null}
        {stage.type === "RESULT" ? (
          <>
            <Completion
              record={record}
              passed={success}
              previouslyCompleted={completed}
              title={text({
                ko: "레슨 완료!",
                en: "Lesson Complete!",
                ja: "レッスン完了！",
              })}
              summary={text(stage.body)}
            />
            {nextLesson ? (
              <section className="completion-next">
                <span className="muted">{t("nextLesson")}</span>
                <h2>{text(nextLesson.title)}</h2>
                <p>{text(nextLesson.summary)}</p>
              </section>
            ) : null}
          </>
        ) : null}
        {stage.guideNote && stage.type !== "RESULT" ? (
          <p className="lesson-guide">
            <strong>{text({ ko: "가이드", en: "Guide", ja: "ガイド" })}</strong>{" "}
            {text(stage.guideNote)}
          </p>
        ) : null}
      </section>
      <div className="lesson-navigation">
        <Button
          disabled={stageIndex === 0}
          onClick={() => changeStage(stageIndex - 1)}
        >
          {t("back")}
        </Button>
        <span className="muted lesson-step-count">{stageIndex + 1} / 6</span>
        {stageIndex < 5 ? (
          <Button
            variant="primary"
            disabled={stageIndex === 4 && !success}
            onClick={() => changeStage(stageIndex + 1)}
          >
            {t("next")}
            <ArrowRight size={16} />
          </Button>
        ) : (
          <Link
            className="button button-primary"
            to={
              nextLesson
                ? !user && !nextLesson.guestAccessible
                  ? `/login?returnTo=${encodeURIComponent(`/learn/${nextLesson.slug}`)}`
                  : `/learn/${nextLesson.slug}`
                : "/learn"
            }
          >
            {t(nextLesson ? "nextLesson" : "backToLearn")}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>
      {completed ? (
        <Dialog
          open={showSolution}
          title={t("viewSolution")}
          closeLabel={t("close")}
          onClose={() => setShowSolution(false)}
        >
          <p>{t("sampleSolution")}</p>
          <ol className="solution-steps">
            {lesson.practice.solution?.map((example) => (
              <li key={example.command}>
                <pre>{example.command}</pre>
                <p>{text(example.explanation)}</p>
              </li>
            ))}
          </ol>
        </Dialog>
      ) : null}
    </>
  );
}
