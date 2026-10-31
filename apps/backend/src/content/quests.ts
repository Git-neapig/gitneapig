import type {
  LocalizedText,
  QuestCondition,
  QuestDefinition,
  QuestEventAction,
  QuestEventDefinition,
  QuestObjective,
  TeamMessage,
} from "@gitneapig/shared";
import { createRepository, modifyWorkingFile } from "@gitneapig/simulator";
import { t } from "./lessons";
const team = [
  {
    id: "pip",
    name: "Pip",
    avatarKey: "primary",
    role: t("팀 리드", "Team lead", "チームリード"),
  },
  {
    id: "milo",
    name: "Milo",
    avatarKey: "cream",
    role: t("개발자", "Developer", "開発者"),
  },
  {
    id: "sage",
    name: "Sage",
    avatarKey: "grey-white",
    role: t("리뷰어", "Reviewer", "レビュアー"),
  },
  {
    id: "rusty",
    name: "Rusty",
    avatarKey: "orange-black",
    role: t("릴리스 담당", "Release coordinator", "リリース担当"),
  },
];
const message = (
  id: string,
  person: number,
  content: LocalizedText,
): TeamMessage => ({
  id,
  teammateId: team[person].id,
  speakerName: team[person].name,
  avatarKey: team[person].avatarKey,
  role: team[person].role,
  message: content,
});
const say = (
  id: string,
  person: number,
  content: LocalizedText,
): QuestEventAction => ({
  type: "ADD_MESSAGE",
  message: message(id, person, content),
});
const objective = (
  id: string,
  title: LocalizedText,
  conditions: QuestCondition[],
  description = title,
): QuestObjective => ({ id, title, description, conditions });
const occurred = (
  eventType: Extract<
    QuestCondition,
    { type: "SIMULATOR_EVENT_OCCURRED" }
  >["eventType"],
): QuestCondition => ({ type: "SIMULATOR_EVENT_OCCURRED", eventType });
const close = objective(
  "close",
  t("이슈 완료 처리", "Close the issue", "Issueを完了にする"),
  [{ type: "ISSUE_DONE", issueId: "issue-1" }],
);
const base = createRepository(
  { "README.md": "# Team project\n", "app.txt": "Welcome\n" },
  true,
);
const intros = (action: QuestEventAction): QuestEventDefinition[] => [
  { id: "intro", trigger: "QUEST_START", actions: [action] },
];

export const quests: QuestDefinition[] = [
  {
    id: "quest-1",
    slug: "feature-branch",
    order: 1,
    title: t("기능 브랜치", "Feature Branch", "機能ブランチ"),
    summary: t(
      "첫 팀 작업을 독립된 브랜치에서 시작하세요.",
      "Start your first team task on its own branch.",
      "最初のチーム作業を独立したブランチで始めましょう。",
    ),
    story: t(
      "현재 main에는 팀 프로젝트의 기본 파일만 있습니다. 팀 리드 Pip이 로그인 초안을 맡겼고, 개발자 Milo가 작업 파일을 전달합니다. 저장소를 확인하고 feature/login으로 이동한 뒤 전달받은 login.txt를 Add login draft 메시지로 기록하세요. main의 작업을 분리해 유지하고 마지막에 이슈를 완료 처리하는 것이 기대 결과입니다.",
      "main currently contains the team's base files. Team lead Pip assigns the login draft, and developer Milo will deliver its working file. Inspect the repository, switch to feature/login and record the delivered login.txt with Add login draft. Keep the work separate from main, then close the issue.",
      "現在のmainにはチームの基本ファイルがあります。リードのPipがログインの下書きを依頼し、開発者Miloが作業ファイルを届けます。状態を確認してfeature/loginに移動し、届いたlogin.txtをAdd login draftで記録してください。mainから作業を分離し、最後にIssueを完了にします。",
    ),
    team: team.slice(0, 2),
    initialState: base,
    unlockRule: { prerequisiteQuestId: null },
    xpReward: 140,
    objectives: [
      objective(
        "inspect",
        t("저장소 상태 확인", "Inspect the repository", "リポジトリを確認"),
        [occurred("COMMAND_EXECUTED")],
      ),
      objective(
        "branch",
        t(
          "feature/login에서 작업",
          "Work on feature/login",
          "feature/loginで作業",
        ),
        [{ type: "CURRENT_BRANCH", branchName: "feature/login" }],
      ),
      objective(
        "record",
        t(
          "Add login draft 커밋",
          "Commit Add login draft",
          "Add login draftをコミット",
        ),
        [{ type: "COMMIT_EXISTS", messageContains: "Add login draft" }],
      ),
      close,
    ],
    events: [
      ...intros(
        say(
          "start",
          0,
          t(
            "먼저 상태를 살펴보고 feature/login을 만들어 주세요. 준비되면 작업 파일을 전달할게요.",
            "Inspect the repository and create feature/login. I will send the working file when you are ready.",
            "まず状態を確認してfeature/loginを作ってください。準備ができたら作業ファイルを渡します。",
          ),
        ),
      ),
      {
        id: "file",
        trigger: "CONDITION_MET",
        condition: { type: "CURRENT_BRANCH", branchName: "feature/login" },
        actions: [
          {
            type: "MODIFY_WORKING_FILE",
            path: "login.txt",
            content: "Email\nPassword\nSign in\n",
          },
          say(
            "draft",
            1,
            t(
              "login.txt 초안입니다. Add login draft라는 메시지로 기록해 주세요.",
              "Here is the login.txt draft. Record it with the message Add login draft.",
              "login.txtの下書きです。Add login draftというメッセージで記録してください。",
            ),
          ),
        ],
      },
    ],
    successConditions: [
      { type: "CURRENT_BRANCH", branchName: "feature/login" },
      { type: "COMMIT_EXISTS", messageContains: "Add login draft" },
      { type: "ISSUE_DONE" },
    ],
    hints: [
      t(
        "현재 브랜치와 파일 상태를 먼저 살펴보세요.",
        "Inspect the current branch and file state first.",
        "まず現在のブランチとファイル状態を確認しましょう。",
      ),
      t(
        "생성만 하는 branch와 이동하는 switch를 구분하세요.",
        "Distinguish branch creation from switching.",
        "ブランチの作成と切り替えを区別しましょう。",
      ),
      t(
        "파일을 add한 뒤 Add login draft 메시지로 commit하세요.",
        "Add the file, then commit with Add login draft.",
        "ファイルをaddし、Add login draftでcommitしましょう。",
      ),
      t(
        'git switch -c feature/login, git add login.txt, git commit -m "Add login draft"를 실행한 뒤 이슈를 닫으세요.',
        'Run git switch -c feature/login, git add login.txt, and git commit -m "Add login draft", then close the issue.',
        'git switch -c feature/login、git add login.txt、git commit -m "Add login draft"を実行し、Issueを閉じましょう。',
      ),
    ],
  },
  {
    id: "quest-2",
    slug: "staging-commit",
    order: 2,
    title: t("스테이징과 커밋", "Staging & Commit", "ステージとコミット"),
    summary: t(
      "완료된 문서만 선택해 팀에 전달하세요.",
      "Select completed documentation for your team.",
      "完成した文書を選んでチームに届けましょう。",
    ),
    story: t(
      "main의 README.md 수정과 미완성 notes.txt가 섞여 있습니다. 개발자 Milo는 실행 안내를 정리했고 리뷰어 Sage는 문서 변경만 검토하려고 합니다. README만 선택해 staging 내용을 확인하고 Improve team docs 메시지로 기록하세요. 개인 메모는 제외하고 이슈를 완료 처리합니다.",
      "main contains a modified README.md and unfinished notes.txt. Developer Milo has prepared the instructions; reviewer Sage wants only the documentation change. Stage README alone, inspect staging and record Improve team docs. Leave personal notes out and close the issue.",
      "mainにはREADME.mdの編集と未完成のnotes.txtがあります。開発者Miloが手順を整理し、レビュアーSageは文書変更だけを確認します。READMEのみをステージして内容を確認し、Improve team docsで記録してください。個人メモは除き、Issueを完了にします。",
    ),
    team: [team[1], team[2]],
    initialState: modifyWorkingFile(
      modifyWorkingFile(
        base,
        "README.md",
        "# Team project\nRun the tests before review.\n",
      ),
      "notes.txt",
      "Unfinished ideas\n",
    ),
    unlockRule: { prerequisiteQuestId: "quest-1" },
    xpReward: 180,
    objectives: [
      objective(
        "stage",
        t("README.md 선택", "Stage README.md", "README.mdをステージ"),
        [{ type: "FILE_STAGED", path: "README.md" }],
      ),
      objective(
        "compare",
        t("변경 비교", "Compare the changes", "変更を比較"),
        [occurred("COMMAND_EXECUTED")],
      ),
      objective(
        "record",
        t(
          "Improve team docs 커밋",
          "Commit Improve team docs",
          "Improve team docsをコミット",
        ),
        [{ type: "COMMIT_EXISTS", messageContains: "Improve team docs" }],
      ),
      close,
    ],
    events: [
      ...intros(
        say(
          "start",
          2,
          t(
            "README.md는 검토할 준비가 됐지만 notes.txt는 아직 개인 메모입니다. 기록할 내용을 확인해 주세요.",
            "README.md is ready for review; notes.txt is still a personal draft. Check what belongs in your commit.",
            "README.mdはレビュー可能ですがnotes.txtは個人の下書きです。記録する内容を確認してください。",
          ),
        ),
      ),
      {
        id: "diff-tip",
        trigger: "AFTER_COMMAND",
        commandKey: "diff",
        actions: [
          say(
            "diff",
            2,
            t(
              "스테이징된 diff도 확인하면 실제 커밋 내용을 알 수 있어요.",
              "The staged diff shows exactly what you will commit.",
              "ステージ済みのdiffで実際のコミット内容を確認できます。",
            ),
          ),
        ],
      },
      {
        id: "recorded",
        trigger: "AFTER_SIMULATOR_EVENT",
        simulatorEventType: "COMMIT_CREATED",
        actions: [
          say(
            "recorded",
            1,
            t(
              "이력이 생겼네요. 커밋 메시지와 파일을 확인하고 이슈를 마무리해 주세요.",
              "The history is recorded. Check the message and files, then finish the issue.",
              "履歴ができました。メッセージとファイルを確認し、Issueを完了しましょう。",
            ),
          ),
        ],
      },
    ],
    successConditions: [
      { type: "COMMIT_EXISTS", messageContains: "Improve team docs" },
      { type: "ISSUE_DONE" },
    ],
    hints: [
      t(
        "파일마다 준비 상태가 다릅니다.",
        "Each file has a different readiness state.",
        "各ファイルの準備状態は異なります。",
      ),
      t(
        "add에 파일 경로를 지정할 수 있습니다.",
        "You can pass a specific path to add.",
        "addには特定のファイルを指定できます。",
      ),
      t(
        "README.md를 add하고 Improve team docs 메시지로 commit하세요.",
        "Add README.md and commit with Improve team docs.",
        "README.mdをaddし、Improve team docsでcommitしましょう。",
      ),
      t(
        'git diff, git add README.md, git diff --staged, git commit -m "Improve team docs"로 검토하고 기록하세요.',
        'Inspect and record with git diff, git add README.md, git diff --staged, and git commit -m "Improve team docs".',
        'git diff、git add README.md、git diff --staged、git commit -m "Improve team docs"で確認して記録しましょう。',
      ),
    ],
  },
];
