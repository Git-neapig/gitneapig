import type { LocalizedText } from "./index";
import type { CommandCategory, CommandKey, RepositoryState } from "./simulator";

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
export const lessonStageTypes = [
  "SITUATION",
  "WHY",
  "CONCEPT",
  "COMMAND",
  "PRACTICE",
  "RESULT",
] as const;
export type LessonCommandExample = {
  command: string;
  explanation: LocalizedText;
  example?: string;
  comparisonNote?: LocalizedText;
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
