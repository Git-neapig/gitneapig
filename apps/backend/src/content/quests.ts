import type {
  LocalizedText,
  QuestCondition,
  QuestDefinition,
  QuestEventAction,
  QuestEventDefinition,
  QuestObjective,
  TeamMessage,
} from "@gitneapig/shared";
import {
  createRepository,
  mergePlayground,
  modifyWorkingFile,
  seedCommand,
  seedCommit,
  snapshots,
} from "@gitneapig/simulator";
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
const prEvents: QuestEventDefinition[] = [
  {
    id: "pr-enabled",
    trigger: "CONDITION_MET",
    condition: {
      type: "REMOTE_SYNCED",
      remoteName: "origin",
      branchName: "feature/login",
    },
    actions: [
      { type: "ENABLE_PULL_REQUEST", pullRequestId: "pr-1" },
      say(
        "shared",
        0,
        t(
          "원격에서 기능 브랜치를 확인했어요. 이제 PR을 열어 주세요.",
          "I can see the feature branch on the remote. Open a PR now.",
          "リモートの機能ブランチを確認しました。PRを開いてください。",
        ),
      ),
    ],
  },
  {
    id: "review",
    trigger: "CONDITION_MET",
    condition: { type: "PULL_REQUEST_OPENED", pullRequestId: "pr-1" },
    actions: [
      { type: "OPEN_REVIEW", reviewId: "review-1" },
      say(
        "review-message",
        2,
        t(
          "변경 범위와 커밋을 확인했습니다. 이 리뷰를 확인 처리하면 병합 준비가 끝납니다.",
          "I checked the changes and commit scope. Acknowledge this review to finish preparing the PR.",
          "変更範囲とコミットを確認しました。このレビューを確認済みにしてPRの準備を完了しましょう。",
        ),
      ),
    ],
  },
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
  {
    id: "quest-3",
    slug: "push-pull-request",
    order: 3,
    title: t(
      "Push와 Pull Request",
      "Push & Pull Request",
      "PushとPull Request",
    ),
    summary: t(
      "로컬 작업을 공유하고 팀 리뷰를 받으세요.",
      "Share your work and receive a team review.",
      "作業を共有してチームのレビューを受けましょう。",
    ),
    story: t(
      "feature/login에는 로그인 화면 커밋이 있지만 원격에는 아직 공유되지 않았습니다. Pip은 공유 상태를 확인하고 Sage는 PR을 검토합니다. 브랜치를 push한 뒤 main으로 향하는 PR을 열고 리뷰를 확인 처리하세요. 이 퀘스트의 기대 결과는 실제 main 병합이 아니라 공유·리뷰 준비와 이슈 완료입니다.",
      "feature/login has the login-screen commit, but it is not published. Pip checks publication and Sage reviews the PR. Push the branch, open a PR targeting main and acknowledge the review. This quest ends with publication, review preparation and issue closure, not an actual merge into main.",
      "feature/loginにはログイン画面のコミットがありますが未共有です。Pipが共有状態を確認し、SageがPRをレビューします。push後にmainへのPRを開いてレビューを確認済みにしてください。実際のmainへのマージではなく、共有・レビュー準備とIssue完了が目標です。",
    ),
    team,
    initialState: seedCommit(
      seedCommand(base, "git switch -c feature/login"),
      "login.txt",
      "Email\nPassword\nSign in\n",
      "Add login form",
    ),
    unlockRule: { prerequisiteQuestId: "quest-2" },
    xpReward: 220,
    objectives: [
      objective(
        "push",
        t(
          "기능 브랜치 공유",
          "Publish the feature branch",
          "機能ブランチを共有",
        ),
        [
          {
            type: "REMOTE_SYNCED",
            remoteName: "origin",
            branchName: "feature/login",
          },
        ],
      ),
      objective(
        "pr",
        t("Pull Request 열기", "Open a Pull Request", "Pull Requestを開く"),
        [{ type: "PULL_REQUEST_OPENED", pullRequestId: "pr-1" }],
      ),
      objective(
        "review",
        t("리뷰 확인", "Acknowledge the review", "レビューを確認"),
        [{ type: "REVIEW_RESOLVED", reviewId: "review-1" }],
      ),
      close,
    ],
    events: [
      ...intros(
        say(
          "start",
          0,
          t(
            "로컬 커밋은 아직 팀에 보이지 않습니다. 원격에 공유하면 PR을 열 수 있어요.",
            "Your local commits are not visible to the team yet. Publish them to enable a PR.",
            "ローカルコミットはまだチームに見えません。共有するとPRを開けます。",
          ),
        ),
      ),
      ...prEvents,
    ],
    successConditions: [
      {
        type: "REMOTE_SYNCED",
        remoteName: "origin",
        branchName: "feature/login",
      },
      { type: "REVIEW_RESOLVED" },
      { type: "ISSUE_DONE" },
    ],
    hints: [
      t(
        "새 브랜치에는 upstream이 없습니다.",
        "A new branch has no upstream.",
        "新しいブランチにはupstreamがありません。",
      ),
      t(
        "원격 이름은 origin이고 공유할 브랜치는 feature/login입니다.",
        "The remote is origin and the branch is feature/login.",
        "リモートはorigin、ブランチはfeature/loginです。",
      ),
      t(
        "push에 원격과 브랜치를 명시하거나 upstream을 설정하세요.",
        "Give push an explicit remote and branch, or configure an upstream.",
        "pushにリモートとブランチを指定するか、upstreamを設定しましょう。",
      ),
      t(
        "git push -u origin feature/login 후 PR과 리뷰를 확인하세요.",
        "Run git push -u origin feature/login, then handle the PR and review.",
        "git push -u origin feature/loginの後にPRとレビューを進めましょう。",
      ),
    ],
  },
  {
    id: "quest-4",
    slug: "remote-ahead",
    order: 4,
    title: t("앞서간 원격 저장소", "Remote Ahead", "先に進んだリモート"),
    summary: t(
      "팀의 새 커밋을 통합한 뒤 자신의 작업을 공유하세요.",
      "Integrate team commits before sharing your work.",
      "チームの新しいコミットを統合してから作業を共有しましょう。",
    ),
    story: t(
      "로컬 main에는 release.txt 커밋이 있고, 개발자 Milo는 원격 main에 문서를 추가했습니다. 릴리스 담당 Rusty는 두 작업이 모두 포함된 결과를 기다립니다. 먼저 원격 이력을 가져와 로컬 작업과 통합한 뒤 다시 push하세요. 양쪽 커밋을 유지한 원격 main을 만들고 이슈를 완료 처리합니다.",
      "Local main has your release.txt commit; developer Milo added documentation to remote main. Release coordinator Rusty needs both changes. Fetch remote history, integrate it with local work, then push. Preserve both histories on remote main and close the issue.",
      "ローカルmainにはrelease.txtのコミットがあり、開発者Miloはリモートmainに文書を追加しました。リリース担当Rustyは両方の変更を待っています。取得した履歴をローカル作業と統合してpushし、両方の履歴を残してIssueを完了にします。",
    ),
    team: [team[1], team[3]],
    initialState: seedCommit(
      base,
      "release.txt",
      "Release checklist\n",
      "Prepare release",
    ),
    unlockRule: { prerequisiteQuestId: "quest-3" },
    xpReward: 260,
    objectives: [
      objective(
        "fetch",
        t("원격 이력 가져오기", "Fetch remote history", "リモート履歴を取得"),
        [occurred("REMOTE_FETCHED")],
      ),
      objective(
        "merge",
        t("두 작업 통합", "Integrate both changes", "両方の変更を統合"),
        [{ type: "MERGE_COMPLETED" }],
      ),
      objective(
        "share",
        t("통합 결과 공유", "Publish the integrated result", "統合結果を共有"),
        [
          { type: "REMOTE_SYNCED", remoteName: "origin", branchName: "main" },
          occurred("REMOTE_PUSHED"),
        ],
      ),
      close,
    ],
    events: [
      {
        id: "teammate-work",
        trigger: "QUEST_START",
        actions: [
          {
            type: "APPLY_REMOTE_COMMIT",
            remoteCommit: {
              remoteName: "origin",
              branchName: "main",
              message: "Add team guidelines",
              snapshot: {
                ...snapshots(base).head,
                "CONTRIBUTING.md": "Review before merge.\n",
              },
            },
          },
          say(
            "ahead",
            1,
            t(
              "방금 원격 main에 팀 규칙을 올렸어요. 여러분의 릴리스 작업과 함께 남겨 주세요.",
              "I just pushed team guidelines to remote main. Keep them alongside your release work.",
              "リモートmainにチーム規則を追加しました。リリース作業と一緒に残してください。",
            ),
          ),
        ],
      },
      {
        id: "fetched",
        trigger: "AFTER_SIMULATOR_EVENT",
        simulatorEventType: "REMOTE_FETCHED",
        actions: [
          say(
            "fetched",
            3,
            t(
              "fetch만으로 작업 파일은 바뀌지 않습니다. 이력을 통합한 후 공유해 주세요.",
              "Fetch alone does not change working files. Integrate the histories, then publish.",
              "fetchだけでは作業ファイルは変わりません。履歴を統合してから共有しましょう。",
            ),
          ),
        ],
      },
    ],
    successConditions: [
      { type: "MERGE_COMPLETED" },
      { type: "REMOTE_SYNCED", remoteName: "origin", branchName: "main" },
      { type: "ISSUE_DONE" },
    ],
    hints: [
      t(
        "push 거절은 원격의 작업을 보호합니다.",
        "Push rejection protects remote work.",
        "push拒否はリモートの作業を守ります。",
      ),
      t(
        "fetch는 관찰, merge는 통합입니다. pull로 함께 수행할 수도 있습니다.",
        "Fetch observes; merge integrates. Pull can do both.",
        "fetchは取得、mergeは統合です。pullで両方を行うこともできます。",
      ),
      t(
        "원격을 가져오고 통합하는 명령 계열을 먼저 사용하세요.",
        "Use the commands for retrieving and integrating remote work before publishing.",
        "公開する前に、リモートの取得と統合を行うコマンドを使いましょう。",
      ),
      t(
        "git pull origin main으로 통합한 뒤 git push하세요.",
        "Integrate with git pull origin main, then git push.",
        "git pull origin mainで統合してからgit pushしましょう。",
      ),
    ],
  },
  {
    id: "quest-5",
    slug: "merge-conflict",
    order: 5,
    title: t("병합 충돌", "Merge Conflict", "マージ競合"),
    summary: t(
      "같은 줄의 다른 의도를 읽고 충돌을 해결하세요.",
      "Read both intentions and resolve a conflicting edit.",
      "同じ行の異なる意図を読み、競合を解決しましょう。",
    ),
    story: t(
      "main과 feature/login이 app.txt의 같은 제목 줄을 서로 다르게 바꿨습니다. 팀은 한쪽 작업을 버리지 않고 최종 문구를 결정해야 합니다. main에서 병합해 충돌을 확인하고 파일 편집기로 최종 내용을 작성하세요. 충돌 표시를 없애고 stage·병합 커밋·push를 마친 뒤 이슈를 완료 처리하면 팀이 결과를 공유할 수 있습니다.",
      "main and feature/login changed the same title line in app.txt differently. The team needs a final wording, not a discarded branch. Merge on main, inspect the conflict and choose the content in the file editor. Remove markers, stage, create the merge commit and push, then close the issue to share the resolved result.",
      "mainとfeature/loginがapp.txtの同じタイトル行を別々に変更しました。片方の作業を捨てずに最終文言を決めます。mainでマージして競合を確認し、エディターで内容を確定してください。マーカーを除き、ステージ・マージコミット・pushを終えてIssueを完了にします。",
    ),
    team,
    initialState: mergePlayground(true),
    unlockRule: { prerequisiteQuestId: "quest-4" },
    xpReward: 300,
    objectives: [
      objective(
        "merge",
        t(
          "기능 브랜치 병합 시도",
          "Merge the feature branch",
          "機能ブランチをマージ",
        ),
        [occurred("MERGE_CONFLICT_CREATED")],
      ),
      objective(
        "resolve",
        t(
          "충돌 수정 후 스테이징",
          "Resolve and stage the conflict",
          "競合を修正してステージ",
        ),
        [occurred("CONFLICT_RESOLVED")],
      ),
      objective(
        "record",
        t(
          "병합 커밋 만들기",
          "Create the merge commit",
          "マージコミットを作成",
        ),
        [{ type: "MERGE_COMPLETED" }],
      ),
      objective(
        "publish",
        t("해결 결과 공유", "Publish the resolution", "解決結果を共有"),
        [{ type: "REMOTE_SYNCED", remoteName: "origin", branchName: "main" }],
      ),
      close,
    ],
    events: [
      ...intros(
        say(
          "start",
          0,
          t(
            "main에서 feature/login을 병합해 주세요. 제목은 두 의견을 읽고 팀에 맞게 정할 수 있습니다.",
            "Merge feature/login into main. Read both title proposals and choose an appropriate result for the team.",
            "mainでfeature/loginをマージしてください。両方のタイトル案を読み、チームに合う内容を選べます。",
          ),
        ),
      ),
      {
        id: "conflicted",
        trigger: "AFTER_SIMULATOR_EVENT",
        simulatorEventType: "MERGE_CONFLICT_CREATED",
        actions: [
          say(
            "conflict",
            2,
            t(
              "충돌 표시는 두 버전을 구분합니다. 파일 편집기에서 최종 내용을 남기고 표시를 제거한 다음 add와 commit으로 마무리하세요.",
              "Conflict markers separate both versions. Keep your final content in the file editor, remove the markers, then add and commit.",
              "競合マーカーは両方の版を区別します。エディターで最終内容を残し、マーカーを除いてaddとcommitで完了しましょう。",
            ),
          ),
        ],
      },
    ],
    successConditions: [
      { type: "MERGE_COMPLETED" },
      { type: "REMOTE_SYNCED", remoteName: "origin", branchName: "main" },
      { type: "ISSUE_DONE" },
    ],
    hints: [
      t(
        "병합 대상은 feature/login, 현재 위치는 main입니다.",
        "The source is feature/login; the destination is main.",
        "統合元はfeature/login、統合先はmainです。",
      ),
      t(
        "State에서 app.txt의 최종 내용을 편집하세요.",
        "Edit the final content of app.txt in State.",
        "Stateでapp.txtの最終内容を編集しましょう。",
      ),
      t(
        "merge로 두 흐름을 합치고, 편집한 해결 내용을 add와 commit으로 기록하세요.",
        "Merge the histories, then stage and commit your edited resolution.",
        "mergeで履歴を統合し、編集した解決内容をaddとcommitで記録しましょう。",
      ),
      t(
        '충돌 표시를 없애고 git add app.txt, git commit -m "Resolve title", git push를 실행하세요.',
        'Remove conflict markers, then run git add app.txt, git commit -m "Resolve title", and git push.',
        '競合マーカーを除き、git add app.txt、git commit -m "Resolve title"、git pushを実行しましょう。',
      ),
    ],
  },
];
