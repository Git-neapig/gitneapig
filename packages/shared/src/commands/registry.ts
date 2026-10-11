import type { CommandCoreDefinition } from "../content";
import type { CommandKey } from "../simulator";
const text = (ko: string, en: string, ja: string) => ({ ko, en, ja });
const examples: Record<CommandKey, string> = {
  status: "git status",
  add: "git add README.md",
  commit: 'git commit -m "Add login form"',
  log: "git log --oneline",
  diff: "git diff --staged",
  branch: "git branch feature/login",
  switch: "git switch -c feature/login",
  checkout: "git checkout -b feature/login",
  merge: "git merge feature/login",
  fetch: "git fetch origin",
  pull: "git pull origin main",
  push: "git push -u origin feature/login",
};
export const commandRegistry: readonly CommandCoreDefinition[] = [
{
    key: "status",
    name: "git status",
    category: "INSPECT",
    syntax: ["git status"],
    shortDescription: text(
      "작업 파일과 스테이징 상태를 확인합니다.",
      "Inspect working files and staged changes.",
      "作業ファイルとステージの状態を確認します。",
    ),
    simulatorSupported: true,
  },
{
    key: "add",
    name: "git add",
    category: "STAGE",
    syntax: ["git add <path>", "git add ."],
    shortDescription: text(
      "현재 파일 내용을 다음 커밋에 포함합니다.",
      "Stage the current file content for the next commit.",
      "現在のファイル内容を次のコミットに含めます。",
    ),
    simulatorSupported: true,
  },
{
    key: "commit",
    name: "git commit",
    category: "COMMIT",
    syntax: ['git commit -m "<message>"'],
    shortDescription: text(
      "스테이징된 내용으로 스냅샷을 기록합니다.",
      "Record a snapshot of the staged content.",
      "ステージした内容のスナップショットを記録します。",
    ),
    simulatorSupported: true,
  },
{
    key: "log",
    name: "git log",
    category: "INSPECT",
    syntax: ["git log", "git log --graph", "git log --oneline"],
    shortDescription: text(
      "현재 브랜치의 커밋 이력을 확인합니다.",
      "Inspect commit history reachable from the current branch.",
      "現在のブランチからたどれるコミット履歴を確認します。",
    ),
    simulatorSupported: true,
  },
{
    key: "diff",
    name: "git diff",
    category: "INSPECT",
    syntax: ["git diff", "git diff --staged"],
    shortDescription: text(
      "작업 변경 또는 스테이징된 변경을 비교합니다.",
      "Compare working or staged changes.",
      "作業中またはステージした変更を比較します。",
    ),
    simulatorSupported: true,
  }
].map((item) => ({
  ...item,
  shortExample: {
    command: examples[item.key as CommandKey],
    description: item.shortDescription,
  },
})) as CommandCoreDefinition[];

export const commandOptions: Record<
  CommandKey,
  Record<string, "flag" | "value">
> = {
  status: {},
  add: {},
  commit: { "-m": "value" },
  log: { "--graph": "flag", "--oneline": "flag" },
  diff: { "--staged": "flag" },
  branch: { "-d": "flag" },
  switch: { "-c": "flag" },
  checkout: { "-b": "flag" },
  merge: {},
  fetch: {},
  pull: {},
  push: { "-u": "flag" },
};
