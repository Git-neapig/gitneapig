import type { Difficulty, LocalizedText } from "./index";
import type { CommandCategory, CommandKey, RepositoryState, SimulatorCondition, SimulatorEvent, RemoteCommitSpec } from "./simulator";

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
export type QuestPullRequestState = {
  id: string;
  sourceBranch: string;
  targetBranch: string;
  status: "AVAILABLE" | "OPEN" | "CHANGES_REQUESTED" | "APPROVED" | "CLOSED";
};
export type QuestReviewState = {
  id: string;
  pullRequestId: string;
  status: "PENDING" | "CHANGES_REQUESTED" | "RESOLVED" | "APPROVED";
};
export type QuestIssueState = { id: string; status: "OPEN" | "DONE" };
export type QuestRuntimeState = {
  pullRequests: QuestPullRequestState[];
  reviews: QuestReviewState[];
  issues: QuestIssueState[];
};
export type SimulatorEventCondition = {
  type: "SIMULATOR_EVENT_OCCURRED";
  eventType: SimulatorEvent["type"];
};
export type QuestUiCondition =
  | { type: "PULL_REQUEST_OPENED"; pullRequestId?: string }
  | { type: "REVIEW_RESOLVED"; reviewId?: string }
  | { type: "ISSUE_DONE"; issueId?: string };
export type QuestCondition =
  SimulatorCondition | SimulatorEventCondition | QuestUiCondition;
export type QuestObjective = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  conditions: QuestCondition[];
  hints?: [LocalizedText, LocalizedText, LocalizedText];
};
export type QuestTeammate = {
  id: string;
  name: string;
  avatarKey: string;
  role: LocalizedText;
};
export type QuestEventAction =
  | { type: "ADD_MESSAGE"; message: TeamMessage }
  | { type: "APPLY_REMOTE_COMMIT"; remoteCommit: RemoteCommitSpec }
  | { type: "MODIFY_WORKING_FILE"; path: string; content: string }
  | { type: "ENABLE_PULL_REQUEST"; pullRequestId: string }
  | { type: "OPEN_REVIEW"; reviewId: string }
  | {
      type: "UPDATE_REVIEW";
      reviewId: string;
      status: QuestReviewState["status"];
    }
  | { type: "UPDATE_ISSUE"; issueId: string; status: QuestIssueState["status"] }
  | { type: "UPDATE_OBJECTIVE"; objectiveId: string };
export type QuestEventDefinition = {
  id: string;
  trigger:
    "QUEST_START" | "AFTER_COMMAND" | "AFTER_SIMULATOR_EVENT" | "CONDITION_MET";
  commandKey?: CommandKey;
  simulatorEventType?: SimulatorEvent["type"];
  condition?: QuestCondition;
  actions: QuestEventAction[];
};
export type QuestDefinition = {
  id: string;
  slug: string;
  order: number;
  title: LocalizedText;
  summary: LocalizedText;
  story: LocalizedText;
  team: QuestTeammate[];
  initialState: RepositoryState;
  unlockRule: { prerequisiteQuestId: string | null };
  objectives: QuestObjective[];
  events: QuestEventDefinition[];
  successConditions: QuestCondition[];
  hints: LocalizedText[];
  xpReward: number;
};
export type QuestProgressResponse = {
  questId: string;
  completed: boolean;
  completedAt: string | null;
  xpAwarded: boolean;
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
