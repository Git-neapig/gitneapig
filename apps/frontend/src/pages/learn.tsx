import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import type { LessonProgressSummary, LessonSummary } from "@gitneapig/shared";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/session";
import { useResource } from "../lib/api";
import { Failure, Loading, PageHeading } from "../components/feedback";
import { Badge, Card, ProgressBar } from "../components/ui";
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
                    <span className="card-link">{text(lesson.title)}</span>
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
