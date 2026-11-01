import type { ReferenceCoreDefinition, ReferenceCommandKey } from "../content";
import type { Difficulty } from "../index";
import { commandRegistry } from "./registry";
const t = (ko: string, en: string, ja: string) => ({ ko, en, ja });
const extra = (
  [
    {
      key: "init",
      category: "SETUP",
      syntax: ["git init [directory]", "git init -b main"],
      shortDescription: t(
        "새 로컬 저장소를 만듭니다.",
        "Create a new local repository.",
        "新しいローカルリポジトリを作成します。",
      ),
    },
    {
      key: "clone",
      category: "SETUP",
      syntax: ["git clone <url> [directory]"],
      shortDescription: t(
        "기존 저장소와 이력을 복제합니다.",
        "Copy a repository and its history.",
        "リポジトリと履歴を複製します。",
      ),
    },
    {
      key: "config",
      category: "SETUP",
      syntax: [
        "git config get <name>",
        "git config set [--global] <name> <value>",
      ],
      shortDescription: t(
        "작성자 정보와 Git 설정을 관리합니다.",
        "Manage author identity and Git settings.",
        "作成者情報とGit設定を管理します。",
      ),
    },
    {
      key: "remote",
      category: "REMOTE",
      syntax: ["git remote -v", "git remote add <name> <url>"],
      shortDescription: t(
        "원격 저장소의 이름과 주소를 관리합니다.",
        "Manage remote names and repository URLs.",
        "リモート名とリポジトリURLを管理します。",
      ),
    },
    {
      key: "restore",
      category: "STAGE",
      syntax: ["git restore [--staged] <path>"],
      shortDescription: t(
        "작업 파일 또는 스테이지 내용을 복원합니다.",
        "Restore working files or the index.",
        "作業ファイルまたはステージを復元します。",
      ),
    },
    {
      key: "rm",
      category: "STAGE",
      syntax: ["git rm [--cached] <path>"],
      shortDescription: t(
        "추적 파일의 삭제를 스테이징합니다.",
        "Stage removal of a tracked file.",
        "追跡ファイルの削除をステージします。",
      ),
    },
    {
      key: "mv",
      category: "STAGE",
      syntax: ["git mv <source> <destination>"],
      shortDescription: t(
        "파일을 이동하고 변경을 스테이징합니다.",
        "Move a file and stage the change.",
        "ファイルを移動して変更をステージします。",
      ),
    },
    {
      key: "stash",
      category: "STAGE",
      syntax: ["git stash push [-u] [-m <message>]", "git stash pop"],
      shortDescription: t(
        "미완성 변경을 잠시 보관합니다.",
        "Set unfinished changes aside temporarily.",
        "未完成の変更を一時的に保管します。",
      ),
    },
    {
      key: "tag",
      category: "COMMIT",
      syntax: ["git tag [-a] <name> [<commit>]"],
      shortDescription: t(
        "릴리스 등 특정 커밋에 이름을 붙입니다.",
        "Name a commit, for example a release.",
        "リリースなどのコミットに名前を付けます。",
      ),
    },
    {
      key: "show",
      category: "INSPECT",
      syntax: ["git show [<object>]"],
      shortDescription: t(
        "커밋의 패치나 Git 객체를 확인합니다.",
        "Inspect a commit patch or a Git object.",
        "コミットの差分やGitオブジェクトを確認します。",
      ),
    },
    {
      key: "revert",
      category: "COMMIT",
      syntax: ["git revert <commit>"],
      shortDescription: t(
        "기존 변경을 취소하는 새 커밋을 만듭니다.",
        "Create a new commit that undoes a change.",
        "変更を取り消す新しいコミットを作成します。",
      ),
    },
    {
      key: "reset",
      category: "COMMIT",
      syntax: [
        "git reset [--soft|--mixed|--hard] <commit>",
        "git reset <commit> -- <path>",
      ],
      shortDescription: t(
        "브랜치 또는 스테이지를 지정 상태로 옮깁니다.",
        "Move a branch or reset selected index entries.",
        "ブランチやステージを指定の状態へ戻します。",
      ),
    },
    {
      key: "rebase",
      category: "BRANCH",
      syntax: ["git rebase <upstream>"],
      shortDescription: t(
        "커밋을 새 기준 위에서 다시 적용합니다.",
        "Replay commits onto a new base.",
        "コミットを新しい基点へ適用し直します。",
      ),
    },
    {
      key: "cherry-pick",
      category: "COMMIT",
      syntax: ["git cherry-pick <commit>"],
      shortDescription: t(
        "선택한 커밋의 변경을 현재 브랜치에 적용합니다.",
        "Apply a selected commit on the current branch.",
        "選んだコミットの変更を現在のブランチへ適用します。",
      ),
    },
    {
      key: "reflog",
      category: "INSPECT",
      syntax: ["git reflog [show] [<ref>]"],
      shortDescription: t(
        "로컬 참조가 이동한 기록을 확인합니다.",
        "Inspect the local record of reference movements.",
        "ローカル参照が移動した記録を確認します。",
      ),
    },
    {
      key: "bisect",
      category: "INSPECT",
      syntax: [
        "git bisect start",
        "git bisect bad [<commit>]",
        "git bisect good <commit>",
      ],
      shortDescription: t(
        "정상·오류 판정으로 문제의 첫 커밋을 찾습니다.",
        "Find the first bad commit by testing revisions.",
        "正常・不具合の判定から最初の原因コミットを探します。",
      ),
    },
    {
      key: "worktree",
      category: "BRANCH",
      syntax: ["git worktree add <path> <branch>", "git worktree list"],
      shortDescription: t(
        "한 저장소의 여러 작업 디렉터리를 관리합니다.",
        "Manage multiple working directories for one repository.",
        "1つのリポジトリで複数の作業ディレクトリを管理します。",
      ),
    },
    {
      key: "clean",
      category: "STAGE",
      syntax: ["git clean -n", "git clean -fd"],
      shortDescription: t(
        "미추적 파일을 확인하고 제거합니다.",
        "Preview and remove untracked files.",
        "未追跡ファイルを確認して削除します。",
      ),
    },
  ] satisfies Omit<ReferenceCoreDefinition, "name" | "simulatorSupported">[]
).map((item) => ({
  ...item,
  name: `git ${item.key}`,
  simulatorSupported: false,
}));
export const referenceRegistry: readonly ReferenceCoreDefinition[] = [
  ...commandRegistry,
  ...extra,
];
export function referenceDifficulty(key: ReferenceCommandKey): Difficulty {
  if (
    [
      "reset",
      "rebase",
      "cherry-pick",
      "reflog",
      "bisect",
      "worktree",
      "clean",
    ].includes(key)
  )
    return "ADVANCED";
  if (
    [
      "remote",
      "merge",
      "restore",
      "rm",
      "mv",
      "stash",
      "tag",
      "show",
      "revert",
      "checkout",
    ].includes(key)
  )
    return "INTERMEDIATE";
  return "BEGINNER";
}
