import {
  commandRegistry,
  type PlaygroundDefinition,
  type RepositoryState,
} from "@gitneapig/shared";
import { executeCommand } from "./engine";
import {
  applyRemoteCommit,
  createRepository,
  modifyWorkingFile,
} from "./state";
const t = (ko: string, en: string, ja: string) => ({ ko, en, ja });
export function seedCommand(
  state: RepositoryState,
  command: string,
): RepositoryState {
  const result = executeCommand(state, command);
  if (!result.success)
    throw new Error(`Invalid seed command: ${command}: ${result.output}`);
  return result.nextState;
}
export function seedCommit(
  state: RepositoryState,
  path: string,
  content: string,
  message: string,
): RepositoryState {
  return seedCommand(
    seedCommand(modifyWorkingFile(state, path, content), `git add "${path}"`),
    `git commit -m "${message}"`,
  );
}
export function mergePlayground(conflict = false): RepositoryState {
  let state = createRepository(
    {
      "README.md": "# Team project\n",
      "app.txt": "title=GitneaPig\nstatus=ready\n",
    },
    true,
  );
  state = seedCommand(state, "git switch -c feature/login");
  state = seedCommit(
    state,
    conflict ? "app.txt" : "login.txt",
    conflict ? "title=Welcome\nstatus=ready\n" : "Login form\n",
    "Add login screen",
  );
  state = seedCommand(state, "git switch main");
  return seedCommit(
    state,
    conflict ? "app.txt" : "README.md",
    conflict
      ? "title=Hello team\nstatus=ready\n"
      : "# Team project\nGetting started\n",
    "Update main",
  );
}
const clean = createRepository(
  { "README.md": "# GitneaPig\n", "app.txt": "version=1\n" },
  true,
);
export const playgrounds: PlaygroundDefinition[] = [
  {
    key: "FREE",
    title: t("자유 실험실", "Free Sandbox", "自由なサンドボックス"),
    description: t(
      "작은 프로젝트에서 자유롭게 Git을 실험하세요.",
      "Explore Git freely in a small project.",
      "小さなプロジェクトで自由にGitを試しましょう。",
    ),
    initialState: modifyWorkingFile(clean, "notes.txt", "My Git notes\n"),
    practiceSuggestions: [],
    recommendedCommandKeys: commandRegistry.map((c) => c.key),
  },
  {
    key: "BASIC",
    title: t("기본 명령어", "Git Basics", "基本コマンド"),
    description: t(
      "파일 변경을 확인하고 원하는 내용만 기록합니다.",
      "Inspect changes and record selected content.",
      "変更を確認し、選んだ内容を記録します。",
    ),
    initialState: modifyWorkingFile(
      modifyWorkingFile(
        clean,
        "README.md",
        "# GitneaPig\nA place to learn Git.\n",
      ),
      "notes.txt",
      "Draft notes\n",
    ),
    practiceSuggestions: [
      t(
        "두 파일 중 하나만 스테이징해 보세요.",
        "Try staging only one of the two files.",
        "2つのファイルのうち1つだけをステージしてみましょう。",
      ),
    ],
    recommendedCommandKeys: ["status", "diff", "add", "commit", "log"],
  },
  {
    key: "BRANCH",
    title: t("브랜치", "Branches", "ブランチ"),
    description: t(
      "독립된 작업 흐름을 만들고 전환합니다.",
      "Create and switch independent lines of work.",
      "独立した作業の流れを作り、切り替えます。",
    ),
    initialState: seedCommand(clean, "git branch feature/login"),
    practiceSuggestions: [
      t(
        "브랜치마다 다른 파일을 커밋해 보세요.",
        "Commit different files on each branch.",
        "各ブランチで異なるファイルをコミットしてみましょう。",
      ),
    ],
    recommendedCommandKeys: ["branch", "switch", "checkout", "commit", "log"],
  },
  {
    key: "MERGE",
    title: t("병합", "Merge", "マージ"),
    description: t(
      "갈라진 작업 이력을 하나로 통합합니다.",
      "Bring diverging work histories together.",
      "分岐した作業履歴を統合します。",
    ),
    initialState: mergePlayground(),
    practiceSuggestions: [
      t(
        "main에서 기능 브랜치를 병합한 뒤 부모 커밋을 확인하세요.",
        "Merge the feature into main, then inspect its parents.",
        "mainに機能ブランチをマージし、親コミットを確認しましょう。",
      ),
    ],
    recommendedCommandKeys: ["branch", "switch", "merge", "log", "status"],
  },
  {
    key: "REMOTE",
    title: t("원격 협업", "Remotes", "リモート"),
    description: t(
      "로컬과 원격 저장소 사이에서 변경을 교환합니다.",
      "Exchange changes between local and remote repositories.",
      "ローカルとリモート間で変更をやり取りします。",
    ),
    initialState: applyRemoteCommit(clean, {
      remoteName: "origin",
      branchName: "main",
      message: "Teammate adds guidelines",
      snapshot: {
        "README.md": "# GitneaPig\n",
        "app.txt": "version=1\n",
        "CONTRIBUTING.md": "Use feature branches.\n",
      },
    }),
    practiceSuggestions: [
      t(
        "fetch 전후의 HEAD와 origin/main을 비교하세요.",
        "Compare HEAD and origin/main before and after fetch.",
        "fetchの前後でHEADとorigin/mainを比較しましょう。",
      ),
    ],
    recommendedCommandKeys: ["fetch", "pull", "push", "log", "branch"],
  },
];
