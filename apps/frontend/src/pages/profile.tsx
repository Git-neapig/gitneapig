import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import type { UserProfileResponse } from "@gitneapig/shared";
import { useResource } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { useSession } from "../lib/session";
import { ProgressBar } from "../components/ui";
import { Failure, Loading } from "../components/feedback";

export function ProfilePage() {
  const { t, text, language } = useLocale(),
    { epoch } = useSession(),
    resource = useResource<UserProfileResponse>("/profile", epoch);
  if (resource.loading) return <Loading />;
  if (resource.error)
    return <Failure error={resource.error} retry={resource.refresh} />;
  if (!resource.data) return null;
  const { stats, lessonProgress, recentAchievements, recentActivity } =
    resource.data;
  return (
    <>
      <div className="stat-strip">
        {[
          [t("learn"), stats.lessonsDone],
          [t("quests"), stats.questsDone],
          [t("totalXp"), stats.totalXp],
          [t("streak"), `${stats.streak} ${t("days")}`],
        ].map(([label, value]) => (
          <div key={label}>
            <span className="muted">{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="profile-columns">
        <section>
          <h2>{t("progress")}</h2>
          {lessonProgress.map((progress) => (
            <Link
              key={progress.lessonId}
              to={`/learn/${progress.slug}`}
              className="progress-row"
            >
              <span>
                {t("lessonNumber", {
                  number: lessonProgress.indexOf(progress) + 1,
                })}
              </span>
              <span>{progress.progressPercent}%</span>
              <ProgressBar
                label={t("lessonNumber", {
                  number: lessonProgress.indexOf(progress) + 1,
                })}
                value={progress.progressPercent}
              />
            </Link>
          ))}
        </section>
        <section>
          <h2>{t("recentAchievements")}</h2>
          {recentAchievements.length ? (
            recentAchievements.map((achievement) => (
              <div className="achievement-row" key={achievement.achievementId}>
                <Trophy size={24} className="tone-warning" />
                <div>
                  <strong>{text(achievement.title)}</strong>
                  <p className="muted">{text(achievement.description)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">{t("nothingYet")}</p>
          )}
        </section>
      </div>
      <section className="activity-section">
        <h2>{t("recentActivity")}</h2>
        {recentActivity.length ? (
          <ol className="activity-list">
            {recentActivity.map((activity) => (
              <li key={activity.id}>
                <Link to={activity.targetPath ?? "/profile"}>
                  {text(activity.title)}
                </Link>
                <span className="reward">+{activity.xpDelta ?? 0} XP</span>
                <time className="muted" dateTime={activity.occurredAt}>
                  {new Date(activity.occurredAt).toLocaleDateString(language)}
                </time>
              </li>
            ))}
          </ol>
        ) : (
          <p className="muted">{t("nothingYet")}</p>
        )}
      </section>
    </>
  );
}
