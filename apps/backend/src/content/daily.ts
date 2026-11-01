import type { DailyChallengeTemplate } from "@gitneapig/shared";
import {
  createRepository,
  mergePlayground,
  modifyWorkingFile,
  seedCommand,
} from "@gitneapig/simulator";
import { t } from "./lessons";
export const dailyTemplates: DailyChallengeTemplate[] = [
  {
    templateKey: "record-readme",
    title: t(
      "설명서의 마지막 한 줄",
      "One Last Line in the README",
      "READMEの最後の1行",
    ),
    description: t(
      "수정된 README를 검토하고 Daily docs 메시지로 기록하세요.",
      "Review the README change and record it with the message Daily docs.",
      "READMEの変更を確認し、Daily docsというメッセージで記録してください。",
    ),
    topic: t("스테이징과 커밋", "Staging and commits", "ステージとコミット"),
    difficulty: "BEGINNER",
    xpReward: 80,
    initialState: modifyWorkingFile(
      createRepository({ "README.md": "# Project\n" }),
      "README.md",
      "# Project\nStart with a small commit.\n",
    ),
    successConditions: [
      { type: "COMMIT_EXISTS", messageContains: "Daily docs" },
    ],
    hints: [
      t(
        "파일 저장과 커밋은 다른 동작입니다.",
        "Saving and committing are different operations.",
        "保存とコミットは別の操作です。",
      ),
      t(
        "다음 스냅샷에 담을 내용을 먼저 선택합니다.",
        "Select the content for the next snapshot first.",
        "先に次のスナップショットの内容を選びます。",
      ),
      t(
        "선택한 변경이 이력에 남아야 합니다. 기록 메시지가 목표와 같은지 확인하세요.",
        "The selected change must become part of history. Check that its message matches the goal.",
        "選んだ変更を履歴に残します。記録のメッセージが目標と一致するか確認しましょう。",
      ),
    ],
  },
  {
    templateKey: "branch-switch",
    title: t(
      "오늘의 작업 공간",
      "Today’s Working Branch",
      "今日の作業ブランチ",
    ),
    description: t(
      "main을 유지하고 feature/daily 브랜치에서 시작하세요.",
      "Keep main intact and start on feature/daily.",
      "mainを保ち、feature/dailyで作業を始めてください。",
    ),
    topic: t("브랜치 전환", "Branch switching", "ブランチの切り替え"),
    difficulty: "BEGINNER",
    xpReward: 80,
    initialState: createRepository({ "README.md": "# Project\n" }),
    successConditions: [
      { type: "CURRENT_BRANCH", branchName: "feature/daily" },
      { type: "BRANCH_EXISTS", branchName: "feature/daily" },
    ],
    hints: [
      t(
        "브랜치는 커밋을 가리키는 이름입니다.",
        "A branch names a commit pointer.",
        "ブランチはコミットを指す名前です。",
      ),
      t(
        "브랜치를 생성하는 것과 이동하는 것은 다릅니다.",
        "Creating a branch and switching to it are different.",
        "ブランチの作成と切り替えは別です。",
      ),
      t(
        "새 이름이 존재하는 것만으로는 부족합니다. HEAD가 오늘 작업할 브랜치를 가리켜야 합니다.",
        "A new name alone is not enough. HEAD must point to today's working branch.",
        "新しい名前だけでは不十分です。HEADが今日作業するブランチを指す必要があります。",
      ),
    ],
  },
  {
    templateKey: "integrate-feature",
    title: t("두 작업의 만남", "Two Lines of Work", "2つの作業を統合"),
    description: t(
      "main에 feature/login의 완성된 변경을 통합하세요.",
      "Integrate the completed feature/login changes into main.",
      "完成したfeature/loginの変更をmainに統合してください。",
    ),
    topic: t("3-way 병합", "Three-way merge", "3-wayマージ"),
    difficulty: "INTERMEDIATE",
    xpReward: 80,
    initialState: mergePlayground(),
    successConditions: [
      { type: "CURRENT_BRANCH", branchName: "main" },
      { type: "MERGE_COMPLETED" },
    ],
    hints: [
      t(
        "Graph에서 두 브랜치의 끝점을 확인하세요.",
        "Inspect both branch tips in Graph.",
        "Graphで両ブランチの先端を確認しましょう。",
      ),
      t(
        "변경을 받아들일 브랜치에서 실행해야 합니다.",
        "Run the operation on the receiving branch.",
        "変更を受け入れるブランチで実行します。",
      ),
      t(
        "두 작업의 이력을 함께 보존해야 합니다. 통합 후 main의 이력에서 양쪽 변경을 찾을 수 있어야 합니다.",
        "Preserve both lines of history. After integration, main's history should include both sets of changes.",
        "両方の履歴を残しましょう。統合後のmainの履歴に両方の変更が含まれる必要があります。",
      ),
    ],
  },
  {
    templateKey: "resolve-title",
    title: t(
      "하나의 제목 정하기",
      "Choose a Single Title",
      "タイトルを1つにする",
    ),
    description: t(
      "app.txt의 충돌 표시를 제거하고 최종 제목을 기록하세요.",
      "Remove conflict markers from app.txt and record a final title.",
      "app.txtの競合マーカーを除き、最終タイトルを記録してください。",
    ),
    topic: t("충돌 해결", "Conflict resolution", "競合解決"),
    difficulty: "ADVANCED",
    xpReward: 80,
    initialState: mergePlayground(true),
    successConditions: [{ type: "MERGE_COMPLETED" }],
    hints: [
      t(
        "먼저 두 브랜치를 병합해 충돌 위치를 확인하세요.",
        "First merge the branches to locate the conflict.",
        "先にブランチをマージして競合箇所を確認します。",
      ),
      t(
        "State의 파일 편집기에서 유지할 내용을 결정하세요.",
        "Choose the final content in the State file editor.",
        "Stateのファイルエディターで残す内容を決めましょう。",
      ),
      t(
        "충돌 표시 제거 후 파일을 스테이징해야 합니다.",
        "Stage the file after removing conflict markers.",
        "競合マーカーを除いた後でステージします。",
      ),
    ],
  },
  {
    templateKey: "stage-new-file",
    title: t(
      "다음 커밋의 준비",
      "Ready for the Next Commit",
      "次のコミットの準備",
    ),
    description: t(
      "새 notes.txt를 다음 커밋에 포함할 준비를 하세요.",
      "Prepare the new notes.txt for the next commit.",
      "新しいnotes.txtを次のコミットに含める準備をしてください。",
    ),
    topic: t(
      "새 파일 스테이징",
      "Staging a new file",
      "新しいファイルをステージ",
    ),
    difficulty: "BEGINNER",
    xpReward: 80,
    initialState: modifyWorkingFile(
      seedCommand(
        createRepository({ "README.md": "# Notes\n" }),
        "git branch notes",
      ),
      "notes.txt",
      "Today I learned about Git.\n",
    ),
    successConditions: [{ type: "FILE_STAGED", path: "notes.txt" }],
    hints: [
      t(
        "untracked는 아직 추적하지 않는 파일입니다.",
        "Untracked means the file is not yet tracked.",
        "untrackedはまだ追跡していないファイルです。",
      ),
      t(
        "파일을 저장했어도 스테이징 영역은 비어 있을 수 있습니다.",
        "The staging area can remain empty after saving a file.",
        "保存してもステージが空の場合があります。",
      ),
      t(
        "파일이 다음 스냅샷의 선택 목록에 들어가야 합니다. 아직 이력에 기록할 필요는 없습니다.",
        "The file belongs in the selection for the next snapshot. It does not need a history entry yet.",
        "次のスナップショットの選択一覧にファイルを含めます。まだ履歴に記録する必要はありません。",
      ),
    ],
  },
];
