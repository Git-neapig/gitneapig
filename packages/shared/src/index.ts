export type Language = "ko" | "en" | "ja";
export type LocalizedText = Record<Language, string>;
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export * from "./content";
export * from "./api";
