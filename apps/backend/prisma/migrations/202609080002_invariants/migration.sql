ALTER TABLE "User" ADD CONSTRAINT "user_xp_streak_nonnegative" CHECK (xp >= 0 AND streak >= 0);
ALTER TABLE "User" ADD CONSTRAINT "user_language_valid" CHECK (language IN ('ko', 'en', 'ja'));
ALTER TABLE "User" ADD CONSTRAINT "user_avatar_consistent" CHECK (
  ("avatarSource" = 'CUSTOM' AND "avatarPath" IS NOT NULL AND "avatarPresetKey" IS NULL)
  OR ("avatarSource" = 'PRESET' AND "avatarPresetKey" IS NOT NULL AND "avatarPath" IS NULL)
  OR ("avatarSource" = 'DEFAULT' AND "avatarPath" IS NULL AND "avatarPresetKey" IS NULL)
);
ALTER TABLE "LessonProgress" ADD CONSTRAINT "lesson_stage_range" CHECK ("highestReachedStageIndex" BETWEEN 0 AND 5);
ALTER TABLE "LessonProgress" ADD CONSTRAINT "lesson_completion_reward_consistent" CHECK (NOT "xpAwarded" OR "completedAt" IS NOT NULL);
ALTER TABLE "QuestProgress" ADD CONSTRAINT "quest_completion_reward_consistent" CHECK (NOT "xpAwarded" OR "completedAt" IS NOT NULL);
ALTER TABLE "Friendship" ADD CONSTRAINT "friendship_canonical_pair" CHECK ("userLowId" < "userHighId");
ALTER TABLE "Friendship" ADD CONSTRAINT "friendship_requester_member" CHECK ("requesterId" IN ("userLowId", "userHighId"));
ALTER TABLE "Lesson" ADD CONSTRAINT "lesson_reward_nonnegative" CHECK ("xpReward" >= 0);
ALTER TABLE "Quest" ADD CONSTRAINT "quest_reward_nonnegative" CHECK ("xpReward" >= 0);
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "daily_reward_nonnegative" CHECK ("xpReward" >= 0);
ALTER TABLE "Achievement" ADD CONSTRAINT "achievement_reward_nonnegative" CHECK ("xpReward" >= 0);
