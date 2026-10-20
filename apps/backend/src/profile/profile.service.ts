
import type { LessonProgressSummary } from "@gitneapig/shared";
export function lessonProgress(
  lesson: { id: string; slug: string },
  progress?: { highestReachedStageIndex: number; completedAt: Date | null },
): LessonProgressSummary {
  const index = progress?.highestReachedStageIndex ?? 0;
  return {
    lessonId: lesson.id,
    slug: lesson.slug,
    highestReachedStageIndex: index as 0 | 1 | 2 | 3 | 4 | 5,
    completed: !!progress?.completedAt,
    progressPercent: progress?.completedAt
      ? 100
      : Math.floor((index / 6) * 100),
    completedAt: progress?.completedAt?.toISOString() ?? null,
  };
}
