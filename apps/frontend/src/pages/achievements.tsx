import {
  Award,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  Flag,
  Flame,
  GraduationCap,
  Library,
  Trophy,
  Users,
} from "lucide-react";
import type { AchievementSummary } from "@gitneapig/shared";
import { useResource } from "../lib/api";
import { useLocale } from "../lib/i18n";
import { Badge, Card } from "../components/ui";
import { Failure, Loading, PageHeading } from "../components/feedback";

const achievementIcons = {
  first_lesson: BookOpenCheck,
  lesson_trio: Library,
  git_foundations_complete: GraduationCap,
  quest_starter: Flag,
  quest_trio: Users,
  quest_master: Trophy,
  daily_regular: CalendarCheck,
  daily_week: CalendarDays,
  three_day_streak: Flame,
  seven_day_streak: Award,
};
export function AchievementsPage() {
  const { t, text } = useLocale(),
    resource = useResource<{ items: AchievementSummary[] }>(
      "/profile/achievements",
    );
  return (
    <>
      <PageHeading title={t("achievements")} />
      {resource.loading ? (
        <Loading />
      ) : resource.error ? (
        <Failure error={resource.error} retry={resource.refresh} />
      ) : (
        <div className="achievement-grid">
          {resource.data?.items.map((achievement) => {
            const Icon =
              achievementIcons[
                achievement.key as keyof typeof achievementIcons
              ] ?? Trophy;
            return (
              <Card
                key={achievement.achievementId}
                variant={achievement.unlocked ? "success" : "locked"}
              >
                <Icon
                  size={32}
                  className={achievement.unlocked ? "tone-warning" : "muted"}
                />
                <Badge tone={achievement.unlocked ? "success" : "locked"}>
                  {t(achievement.unlocked ? "completed" : "locked")}
                </Badge>
                <h2>{text(achievement.title)}</h2>
                <p className="muted">{text(achievement.description)}</p>
                <strong>{achievement.xpReward} XP</strong>
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}
