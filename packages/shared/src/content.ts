import type { Difficulty, LocalizedText } from "./index";
import type { CommandCategory, CommandKey, RepositoryState, SimulatorCondition } from "./simulator";

export type CommandExample = {
  command: string;
  description: LocalizedText;
  before?: LocalizedText;
  after?: LocalizedText;
};
export type CommandCoreDefinition = {
  key: CommandKey;
  name: string;
  syntax: string[];
  category: CommandCategory;
  shortDescription: LocalizedText;
  shortExample?: CommandExample;
  simulatorSupported: boolean;
};
export type CommandGuideItem = Omit<
  CommandCoreDefinition,
  "simulatorSupported"
>;
export type TeamMessage = {
  id: string;
  teammateId?: string;
  speakerName: string;
  avatarKey: string;
  role?: LocalizedText;
  message: LocalizedText;
};
export type LessonSummary = {
  id: string;
  slug: string;
  order: number;
  title: LocalizedText;
  summary: LocalizedText;
  difficulty: Difficulty;
  guestAccessible: boolean;
  xpReward: number;
};
export const lessonStageTypes = [
  "SITUATION",
  "WHY",
  "CONCEPT",
  "COMMAND",
  "PRACTICE",
  "RESULT",
] as const;
export type LessonStageType = (typeof lessonStageTypes)[number];
export type LessonCommandExample = {
  command: string;
  explanation: LocalizedText;
  example?: string;
  comparisonNote?: LocalizedText;
};
export type LessonVisualization =
  | { type: "GIT_GRAPH"; state: RepositoryState }
  | { type: "COMPARISON"; left: LocalizedText; right: LocalizedText }
  | { type: "TEAM_CONVERSATION"; messages: TeamMessage[] };
export type LessonStage = {
  type: LessonStageType;
  title: LocalizedText;
  body: LocalizedText;
  visualization?: LessonVisualization;
  guideNote?: LocalizedText;
  commandExamples?: LessonCommandExample[];
};
export type LessonPracticeDefinition = {
  goal: LocalizedText;
  initialState: RepositoryState;
  successConditions: SimulatorCondition[];
  relevantCommandKeys: CommandKey[];
  solution?: LessonCommandExample[];
};
export type LessonDefinition = LessonSummary & {
  stages: LessonStage[];
  practice: LessonPracticeDefinition;
};
export type LessonProgressSummary = {
  lessonId: string;
  slug: string;
  highestReachedStageIndex: 0 | 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  progressPercent: number;
  completedAt: string | null;
};
export type PlaygroundKey = "FREE" | "BASIC" | "BRANCH" | "MERGE" | "REMOTE";
export type PlaygroundDefinition = {
  key: PlaygroundKey;
  title: LocalizedText;
  description: LocalizedText;
  initialState: RepositoryState;
  practiceSuggestions: LocalizedText[];
  recommendedCommandKeys: CommandKey[];
};
export type AchievementCategory =
  "BASICS" | "COLLABORATION" | "PRACTICE" | "CONSISTENCY";
export type AchievementRule =
  | {
      type:
        | "LESSON_COMPLETION_COUNT"
        | "QUEST_COMPLETION_COUNT"
        | "DAILY_COMPLETION_COUNT";
      count: number;
    }
  | { type: "STREAK_AT_LEAST"; days: number };
export type AchievementDefinition = {
  id: string;
  key: string;
  category: AchievementCategory;
  title: LocalizedText;
  description: LocalizedText;
  rule: AchievementRule;
  xpReward: number;
  iconKey: string;
};
export type AchievementSummary = {
  achievementId: string;
  key: string;
  title: LocalizedText;
  description: LocalizedText;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
};
