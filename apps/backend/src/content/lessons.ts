import type {
  LessonDefinition,
  LessonStage,
  LocalizedText,
} from "@gitneapig/shared";
import {
  createRepository,
  mergePlayground,
  modifyWorkingFile,
  seedCommit,
} from "@gitneapig/simulator";
export const t = (ko: string, en: string, ja: string): LocalizedText => ({
  ko,
  en,
  ja,
});
const stage = (
  type: LessonStage["type"],
  title: LocalizedText,
  body: LocalizedText,
  extra: Partial<LessonStage> = {},
): LessonStage => ({ type, title, body, ...extra });
const basic = createRepository(
  { "README.md": "# Our project\n", "app.txt": "Welcome\n" },
  true,
);
const first = modifyWorkingFile(
  createRepository(),
  "README.md",
  "# My first repository\n",
);
const staging = modifyWorkingFile(
  modifyWorkingFile(
    basic,
    "README.md",
    "# Our project\nInstallation instructions\n",
  ),
  "notes.txt",
  "Unfinished ideas\n",
);
const mergeState = mergePlayground();
const remote = seedCommit(
  basic,
  "README.md",
  "# Our project\nReady to share\n",
  "Prepare release",
);

export const lessons: LessonDefinition[] = [
  {
    id: "lesson-1",
    slug: "git-repository",
    order: 1,
    title: t("Git과 저장소", "Git & Repository", "Gitとリポジトリ"),
    summary: t(
      "변경을 기록하는 저장소와 첫 커밋을 만납니다.",
      "Meet repositories and record your first commit.",
      "変更を記録するリポジトリと最初のコミットを学びます。",
    ),
    difficulty: "BEGINNER",
    guestAccessible: true,
    xpReward: 100,
    stages: [
      stage(
        "SITUATION",
        t(
          "어느 파일이 최신일까요?",
          "Which file is the latest?",
          "最新のファイルはどれ？",
        ),
        t(
          "project-final, project-final-2, project-really-final. 수정할 때마다 복사본을 만들면 이유와 순서를 잃기 쉽습니다.",
          "project-final, project-final-2, project-really-final. Copying a folder for every edit makes it hard to track what changed and why.",
          "project-final、project-final-2、project-really-final。編集のたびにコピーすると、変更理由と順序が分からなくなります。",
        ),
        {
          visualization: {
            type: "TEAM_CONVERSATION",
            messages: [
              {
                id: "l1-m1",
                speakerName: "Milo",
                avatarKey: "cream",
                message: t(
                  "어제 잘 동작하던 버전으로 돌아갈 수 있을까요?",
                  "Can we find the version that worked yesterday?",
                  "昨日動いていたバージョンを見つけられますか？",
                ),
              },
              {
                id: "l1-m2",
                speakerName: "Pip",
                avatarKey: "primary",
                message: t(
                  "각 변경을 커밋으로 기록해 두면 이력을 따라갈 수 있어요.",
                  "If we record changes as commits, we can follow their history.",
                  "変更をコミットとして記録すれば、履歴をたどれます。",
                ),
              },
            ],
          },
        },
      ),
      stage(
        "WHY",
        t(
          "변경에 이름과 순서를",
          "Give changes a name and order",
          "変更に名前と順序を",
        ),
        t(
          "Git은 프로젝트의 스냅샷과 그 사이의 관계를 보관합니다. 커밋 메시지는 무엇을 왜 바꿨는지 팀에 설명합니다. 파일 저장과 커밋은 다릅니다.",
          "Git stores project snapshots and the relationships between them. Commit messages explain what changed and why. Saving a file is not the same as committing it.",
          "Gitはプロジェクトのスナップショットとその関係を保存します。コミットメッセージは変更内容と理由を伝えます。ファイル保存とコミットは別の操作です.",
        ),
        {
          visualization: {
            type: "COMPARISON",
            left: t(
              "폴더 복사: 변경 이유와 최신 버전을 찾기 어려움",
              "Folder copies: the latest version and reasons are hard to find",
              "フォルダのコピー：最新版と変更理由が分かりにくい",
            ),
            right: t(
              "커밋 기록: 메시지와 연결된 스냅샷으로 변경을 추적",
              "Commit history: follow changes through messages and connected snapshots",
              "コミット履歴：メッセージとつながったスナップショットで変更を追跡",
            ),
          },
        },
      ),
      stage(
        "CONCEPT",
        t("저장소와 커밋", "Repository and commit", "リポジトリとコミット"),
        t(
          "저장소는 파일과 Git 이력을 관리하는 공간입니다. 커밋은 선택한 변경을 포함한 프로젝트 전체 스냅샷입니다. HEAD는 현재 작업 위치를 가리킵니다.",
          "A repository holds files and Git history. A commit is a complete project snapshot containing selected changes. HEAD identifies your current position.",
          "リポジトリはファイルとGit履歴を管理する場所です。コミットは選択した変更を含むプロジェクト全体のスナップショットです。HEADは現在の位置を示します。",
        ),
        {
          visualization: {
            type: "GIT_GRAPH",
            state: seedCommit(
              createRepository(),
              "README.md",
              "# My first repository\n",
              "First record",
            ),
          },
          guideNote: t(
            "첫 커밋 후의 예시입니다. 실습은 커밋이 없는 상태에서 시작합니다.",
            "This shows the first recorded commit. The exercise starts with no commits.",
            "最初のコミット後の例です。実習はコミットがない状態で始まります。",
          ),
        },
      ),
      stage(
        "COMMAND",
        t(
          "상태 확인부터 기록까지",
          "From inspection to a record",
          "確認から記録まで",
        ),
        t(
          "이미 준비된 저장소에서 상태를 확인하고, 파일을 선택한 뒤 기록합니다. 메시지는 변경의 목적을 설명하세요.",
          "In this prepared repository, inspect the state, select a file, and record it. Use a message that describes the purpose of the change.",
          "準備済みのリポジトリで状態を確認し、ファイルを選んで記録します。メッセージには変更の目的を書きましょう。",
        ),
        {
          commandExamples: [
            {
              command: "git status [--short]",
              example: "git status",
              explanation: t(
                "현재 파일 상태를 확인합니다.",
                "Inspect current file state.",
                "現在のファイル状態を確認します。",
              ),
            },
            {
              command: "git add <path>",
              example: "git add README.md",
              explanation: t(
                "README를 다음 커밋에 선택합니다.",
                "Select the README for the next commit.",
                "READMEを次のコミットに選びます。",
              ),
            },
            {
              command: 'git commit -m "<message>"',
              example: 'git commit -m "First record"',
              explanation: t(
                "선택한 내용을 첫 스냅샷으로 기록합니다.",
                "Record the selected content as the first snapshot.",
                "選択した内容を最初のスナップショットに記録します。",
              ),
            },
          ],
        },
      ),
      stage(
        "PRACTICE",
        t("첫 기록 남기기", "Make your first record", "最初の記録を残す"),
        t(
          "README.md를 포함하고 First record라는 메시지를 가진 커밋을 만드세요.",
          "Create a commit containing README.md with the message First record.",
          "README.mdを含むFirst recordというメッセージのコミットを作りましょう。",
        ),
      ),
      stage(
        "RESULT",
        t(
          "파일이 이력이 되었습니다",
          "Your file now has a history",
          "ファイルに履歴ができました",
        ),
        t(
          "새 커밋이 HEAD와 main에 연결되었습니다. 다음에는 여러 변경 중 무엇을 기록할지 직접 선택합니다.",
          "Your new commit is referenced by HEAD and main. Next, choose which changes belong together in a commit.",
          "新しいコミットをHEADとmainが指しています。次は、複数の変更から記録する内容を選びます。",
        ),
      ),
    ],
    practice: {
      goal: t(
        "First record 커밋 만들기",
        "Create the First record commit",
        "First recordコミットを作成",
      ),
      initialState: first,
      successConditions: [
        { type: "CURRENT_BRANCH", branchName: "main" },
        {
          type: "COMMIT_EXISTS",
          messageEquals: "First record",
          containsPath: "README.md",
          branchName: "main",
        },
      ],
      relevantCommandKeys: ["status", "add", "commit", "log"],
    },
  },
  {
    id: "lesson-2",
    slug: "staging-commit",
    order: 2,
    title: t(
      "작업 폴더 · 스테이징 · 커밋",
      "Working Directory · Staging · Commit",
      "作業フォルダ・ステージ・コミット",
    ),
    summary: t(
      "수정 내용과 다음 커밋에 담을 내용을 구분합니다.",
      "Separate working changes from your next commit.",
      "作業中の変更と次のコミットに含める内容を分けます。",
    ),
    difficulty: "BEGINNER",
    guestAccessible: true,
    xpReward: 140,
    stages: [
      stage(
        "SITUATION",
        t(
          "완성된 문서, 미완성 메모",
          "Finished docs, unfinished notes",
          "完成した文書、未完成のメモ",
        ),
        t(
          "README 안내는 완성했지만 notes.txt는 초안입니다. 모든 파일을 한꺼번에 기록하면 미완성 작업도 함께 남습니다.",
          "Your README instructions are ready, but notes.txt is still a draft. Recording everything would include unfinished work.",
          "READMEの案内は完成しましたが、notes.txtはまだ下書きです。すべてを記録すると未完成の作業も含まれます。",
        ),
        {
          visualization: {
            type: "TEAM_CONVERSATION",
            messages: [
              {
                id: "l2-m1",
                speakerName: "Milo",
                avatarKey: "cream",
                message: t(
                  "README 설치 안내는 검토가 끝났어요. notes.txt 초안도 같이 공유하나요?",
                  "The README setup guide is reviewed. Should we share the notes.txt draft too?",
                  "READMEの手順は確認済みです。notes.txtの下書きも共有しますか？",
                ),
              },
              {
                id: "l2-m2",
                speakerName: "Pip",
                avatarKey: "primary",
                message: t(
                  "아직 메모는 미완성이에요. 이번에는 README 수정만 스테이징할게요.",
                  "The notes are unfinished. I’ll stage only the README modification this time.",
                  "メモはまだ未完成です。今回はREADMEの修正だけをステージします。",
                ),
              },
            ],
          },
        },
      ),
      stage(
        "WHY",
        t(
          "한 커밋에는 한 가지 의도",
          "One purpose per commit",
          "1つのコミットに1つの目的",
        ),
        t(
          "작고 일관된 커밋은 검토와 문제 추적을 쉽게 합니다. 작업 폴더에서 수정한 내용을 전부 커밋할 필요는 없습니다.",
          "Small, coherent commits are easier to review and troubleshoot. You do not have to commit every working change.",
          "小さく一貫したコミットはレビューと原因調査を容易にします。作業中の変更をすべてコミットする必要はありません。",
        ),
        {
          visualization: {
            type: "COMPARISON",
            left: t(
              "모든 변경을 함께 선택: 완성된 문서에 초안이 섞임",
              "Stage everything: unfinished notes join completed documentation",
              "すべてを選択：完成した文書に下書きが混ざる",
            ),
            right: t(
              "파일별 선택: README만 준비하고 메모는 작업 폴더에 유지",
              "Select by path: prepare only README and keep notes in the working directory",
              "ファイルを選択：READMEだけを準備し、メモは作業フォルダに残す",
            ),
          },
        },
      ),
      stage(
        "CONCEPT",
        t("세 공간의 차이", "Three different spaces", "3つの場所の違い"),
        t(
          "작업 폴더는 지금 편집 중인 내용입니다. 스테이징 영역은 다음 커밋의 준비본입니다. 커밋은 스테이징 영역을 기록합니다. add 이후 파일을 다시 수정하면 두 내용은 달라집니다.",
          "The working directory contains your current edits. The staging area prepares the next snapshot. Commit records the staging area. Editing a file after add makes working and staged content different.",
          "作業フォルダには現在の編集内容があります。ステージは次のスナップショットの準備場所です。コミットはステージを記録します。add後に編集すると作業内容とステージ内容は異なります。",
        ),
        {
          visualization: { type: "GIT_GRAPH", state: staging },
          guideNote: t(
            "add는 준비본만 바꾸므로 새 커밋 노드는 생기지 않습니다. 스테이징과 이력을 구분하세요.",
            "add changes the prepared snapshot, so it creates no commit node; distinguish staging from history.",
            "addは準備内容だけを変え、新しいコミットは作りません。ステージと履歴を区別しましょう。",
          ),
        },
      ),
      stage(
        "COMMAND",
        t("선택하고 비교하기", "Select and compare", "選択して比較する"),
        t(
          "특정 파일 경로를 사용하면 다른 파일은 그대로 둡니다. git add .은 현재 범위의 모든 변경을 선택하므로 실행 전에 상태를 확인하세요.",
          "A specific path leaves other files untouched. git add . stages all changes in scope, so inspect the state first.",
          "ファイルを指定すると他のファイルはそのままです。git add .は範囲内の変更をすべて選ぶため、先に状態を確認しましょう。",
        ),
        {
          commandExamples: [
            {
              command: "git add <path>",
              example: "git add README.md",
              explanation: t(
                "완성된 문서만 선택합니다.",
                "Select only the completed documentation.",
                "完成した文書だけを選びます。",
              ),
            },
            {
              command: "git diff [--staged]",
              example: "git diff --staged",
              explanation: t(
                "커밋에 포함될 변경을 비교합니다.",
                "Inspect what the commit will contain.",
                "コミットに含まれる変更を確認します。",
              ),
            },
            {
              command: 'git commit -m "<message>"',
              example: 'git commit -m "Document setup"',
              explanation: t(
                "후속 개념: 선택한 변경을 기록하는 명령입니다. 이번 실습은 README 수정만 스테이징하면 완료되므로 실행하지 않습니다.",
                "Next concept: record selected changes. Do not run this in the exercise; it ends when only the README modification is staged.",
                "次の概念：選んだ変更を記録します。今回の実習はREADMEの修正だけをステージすると完了するため、実行しません。",
              ),
            },
          ],
        },
      ),
      stage(
        "PRACTICE",
        t("문서를 준비하세요", "Prepare the documentation", "文書を準備する"),
        t(
          "README.md의 수정만 스테이징하세요. notes.txt는 제외하고 README를 삭제하지 마세요. 커밋 전 선택이 목표이며 올바르게 스테이징하면 결과 화면으로 이동합니다.",
          "Stage only the README.md modification. Leave notes.txt out and do not delete README. Selecting changes before a commit is the goal; correct staging opens the result.",
          "README.mdの修正だけをステージしてください。notes.txtは含めず、READMEを削除しないでください。コミット前の選択が目標で、正しくステージすると結果へ進みます。",
        ),
      ),
      stage(
        "RESULT",
        t(
          "선택권은 여러분에게",
          "You choose what to record",
          "記録する内容は自分で選ぶ",
        ),
        t(
          "스테이징된 내용만 다음 커밋에 포함됩니다. add 이후 편집했다면 다시 add할 때까지 그 수정은 커밋에 포함되지 않습니다.",
          "Only staged content goes into the next commit. Edits made after add stay out until you stage them again.",
          "次のコミットに入るのはステージした内容だけです。add後の編集は再びステージするまで含まれません。",
        ),
      ),
    ],
    practice: {
      goal: t(
        "README.md 수정만 스테이징하고 메모는 제외하기",
        "Stage only the README.md modification; leave notes out",
        "README.mdの修正だけをステージし、メモは含めない",
      ),
      initialState: staging,
      successConditions: [
        {
          type: "STAGED_FILES",
          files: [{ path: "README.md", status: "modified" }],
        },
      ],
      relevantCommandKeys: ["status", "diff", "add", "commit"],
    },
  },
  {
    id: "lesson-3",
    slug: "branch",
    order: 3,
    title: t("브랜치", "Branch", "ブランチ"),
    summary: t(
      "안정적인 작업과 새 기능 작업을 분리합니다.",
      "Separate stable work from a new feature.",
      "安定した作業と新機能の作業を分けます。",
    ),
    difficulty: "BEGINNER",
    guestAccessible: true,
    xpReward: 180,
    stages: [
      stage(
        "SITUATION",
        t(
          "새 로그인 기능을 맡았습니다",
          "A new login feature",
          "新しいログイン機能の担当に",
        ),
        t(
          "팀은 main의 안정적인 버전을 사용 중입니다. 아직 실험 중인 로그인 기능을 바로 main에 기록해도 될까요?",
          "The team is using the stable version on main. Should an experimental login feature go directly into main?",
          "チームはmainの安定版を使用中です。実験中のログイン機能を直接mainに記録してよいでしょうか？",
        ),
        {
          visualization: {
            type: "TEAM_CONVERSATION",
            messages: [
              {
                id: "l3-m1",
                speakerName: "Milo",
                avatarKey: "cream",
                message: t(
                  "main은 팀이 사용 중이에요. 로그인 기능은 어디에서 작업할까요?",
                  "The team is using main. Where should we develop the login feature?",
                  "チームはmainを使っています。ログイン機能はどこで開発しましょうか？",
                ),
              },
              {
                id: "l3-m2",
                speakerName: "Pip",
                avatarKey: "primary",
                message: t(
                  "feature/login을 만들고 이동해서 main과 작업 흐름을 분리할게요.",
                  "I’ll create and switch to feature/login to separate this work from main.",
                  "feature/loginを作って切り替え、mainと作業の流れを分けます。",
                ),
              },
            ],
          },
        },
      ),
      stage(
        "WHY",
        t("동시에 작업하기", "Work in parallel", "並行して作業する"),
        t(
          "브랜치를 사용하면 안정된 기준점을 유지하며 별도로 작업할 수 있습니다. 브랜치는 폴더 복사본이 아니라 커밋을 가리키는 이름입니다.",
          "Branches let you work independently while keeping a stable baseline. A branch is a name pointing to a commit, not a copied folder.",
          "ブランチを使うと安定した基準を保ちながら別に作業できます。ブランチはコピーしたフォルダではなく、コミットを指す名前です。",
        ),
        {
          visualization: {
            type: "COMPARISON",
            left: t(
              "main에서 실험: 안정된 작업과 미완성 기능이 같은 이력에 섞임",
              "Experiment on main: stable work and unfinished features share one history",
              "mainで実験：安定した作業と未完成の機能が同じ履歴に混ざる",
            ),
            right: t(
              "기능 브랜치: main의 기준점을 유지하며 별도 이력을 작성",
              "Feature branch: keep the main baseline while developing a separate history",
              "機能ブランチ：mainの基準を保ちながら別の履歴で開発",
            ),
          },
        },
      ),
      stage(
        "CONCEPT",
        t(
          "HEAD와 브랜치 포인터",
          "HEAD and branch pointers",
          "HEADとブランチのポインタ",
        ),
        t(
          "새 브랜치는 현재 커밋에서 시작합니다. 브랜치를 전환하면 HEAD의 대상과 파일 내용이 바뀝니다. 새 커밋은 현재 브랜치만 앞으로 이동시킵니다.",
          "A new branch starts at the current commit. Switching changes the branch HEAD follows and the files you see. A new commit advances only the current branch.",
          "新しいブランチは現在のコミットから始まります。切り替えるとHEADの対象とファイル内容が変わります。新しいコミットが進めるのは現在のブランチだけです。",
        ),
        {
          visualization: { type: "GIT_GRAPH", state: basic },
          guideNote: t(
            "브랜치를 만들기만 하면 HEAD는 그대로입니다. switch로 현재 브랜치를 바꾸세요.",
            "creating a branch leaves HEAD where it is; switch changes the current branch.",
            "ブランチを作るだけではHEADは変わりません。switchで現在のブランチを切り替えます。",
          ),
        },
      ),
      stage(
        "COMMAND",
        t("만들기와 이동하기", "Create and switch", "作成と切り替え"),
        t(
          "branch는 만들기만 하고 switch는 이동합니다. switch -c는 두 동작을 함께 합니다. checkout -b도 이 실습에서 동일한 결과를 만듭니다.",
          "branch only creates; switch changes your current branch. switch -c does both. checkout -b produces the same result in this exercise.",
          "branchは作成だけ、switchは切り替えです。switch -cは両方を行います。この実習ではcheckout -bも同じ結果になります。",
        ),
        {
          commandExamples: [
            {
              command: "git branch <name>",
              example: "git branch feature/login",
              explanation: t(
                "현재 위치에서 브랜치를 만듭니다.",
                "Create a branch at the current position.",
                "現在の位置でブランチを作ります。",
              ),
            },
            {
              command: "git switch <branch>",
              example: "git switch feature/login",
              explanation: t(
                "생성한 브랜치로 이동합니다.",
                "Switch to the new branch.",
                "作成したブランチに切り替えます。",
              ),
            },
            {
              command: "git switch -c <new-branch>",
              example: "git switch -c feature/login",
              explanation: t(
                "한 번에 생성하고 이동합니다.",
                "Create and switch in one command.",
                "1回で作成して切り替えます。",
              ),
              comparisonNote: t(
                "위의 두 명령 대신 사용합니다.",
                "Use instead of the two commands above.",
                "上の2つのコマンドの代わりに使います。",
              ),
            },
          ],
        },
      ),
      stage(
        "PRACTICE",
        t(
          "기능 브랜치로 이동",
          "Move to your feature branch",
          "機能ブランチへ移動",
        ),
        t(
          "feature/login 브랜치를 만들고 그 브랜치로 이동하세요. 어떤 지원 명령 조합을 사용해도 됩니다.",
          "Create feature/login and switch to it. Any supported command combination is valid.",
          "feature/loginを作り、そのブランチに切り替えてください。対応するコマンドの組み合わせならどれでも構いません。",
        ),
      ),
      stage(
        "RESULT",
        t(
          "독립된 작업 공간",
          "An independent line of work",
          "独立した作業の流れ",
        ),
        t(
          "이제 새 커밋은 feature/login을 움직이고 main은 기존 위치에 남습니다. 완성된 작업을 통합하는 방법을 다음에 배웁니다.",
          "New commits now move feature/login while main stays where it was. Next, learn how to integrate completed work.",
          "新しいコミットはfeature/loginを進め、mainは元の位置に残ります。次は完成した作業の統合を学びます。",
        ),
      ),
    ],
    practice: {
      goal: t(
        "feature/login으로 이동하기",
        "Switch to feature/login",
        "feature/loginに切り替える",
      ),
      initialState: basic,
      successConditions: [
        { type: "CURRENT_BRANCH", branchName: "feature/login" },
        { type: "BRANCH_EXISTS", branchName: "feature/login" },
      ],
      relevantCommandKeys: ["branch", "switch", "checkout", "log"],
    },
  },
  {
    id: "lesson-4",
    slug: "merge",
    order: 4,
    title: t("병합", "Merge", "マージ"),
    summary: t(
      "두 작업 흐름을 통합하고 충돌의 의미를 이해합니다.",
      "Integrate two lines of work and understand conflicts.",
      "2つの作業を統合し、競合の意味を理解します。",
    ),
    difficulty: "INTERMEDIATE",
    guestAccessible: false,
    xpReward: 220,
    stages: [
      stage(
        "SITUATION",
        t(
          "각자 끝낸 작업을 합치려면",
          "Bring completed work together",
          "完成した作業をまとめるには",
        ),
        t(
          "로그인 기능을 만드는 동안 팀원이 main의 문서를 개선했습니다. 두 브랜치는 서로 다른 새 커밋을 갖습니다.",
          "While you built login, a teammate improved documentation on main. Both branches now have new commits.",
          "ログインを作る間にチームメンバーがmainの文書を改善しました。両方のブランチに新しいコミットがあります。",
        ),
        {
          visualization: {
            type: "TEAM_CONVERSATION",
            messages: [
              {
                id: "l4-m1",
                speakerName: "Milo",
                avatarKey: "cream",
                message: t(
                  "main의 문서 개선을 마쳤어요. 로그인 기능도 준비됐나요?",
                  "The documentation update on main is ready. Is login ready too?",
                  "mainの文書改善が終わりました。ログイン機能も準備できましたか？",
                ),
              },
              {
                id: "l4-m2",
                speakerName: "Pip",
                avatarKey: "primary",
                message: t(
                  "네, feature/login의 완성된 작업을 main으로 병합할게요.",
                  "Yes. I’ll merge the completed work from feature/login into main.",
                  "はい。feature/loginの完成した作業をmainへマージします。",
                ),
              },
            ],
          },
        },
      ),
      stage(
        "WHY",
        t(
          "복사보다 이력 통합",
          "Integrate history, not just files",
          "ファイルだけでなく履歴を統合",
        ),
        t(
          "파일만 복사하면 어느 작업에서 온 변경인지 연결이 끊깁니다. merge는 두 이력의 관계를 유지하며 내용을 통합합니다.",
          "Copying files loses the relationship to the work that produced them. Merge combines content while preserving both histories.",
          "ファイルのコピーだけでは変更の由来との関係が失われます。mergeは両方の履歴を保ちながら内容を統合します。",
        ),
        {
          visualization: {
            type: "COMPARISON",
            left: t(
              "파일 복사: 결과만 옮기고 두 작업의 이력 관계는 연결하지 못함",
              "Copy files: transfer content without connecting the two histories",
              "ファイルのコピー：内容は移るが2つの履歴はつながらない",
            ),
            right: t(
              "병합: 공통 조상을 기준으로 두 이력을 연결하고 변경을 통합",
              "Merge: connect both histories and integrate changes from their common ancestor",
              "マージ：共通祖先を基準に2つの履歴をつなぎ変更を統合",
            ),
          },
        },
      ),
      stage(
        "CONCEPT",
        t(
          "공통 조상에서 비교하기",
          "Compare from a common ancestor",
          "共通の祖先から比較する",
        ),
        t(
          "분기된 이력은 공통 조상·현재 브랜치·상대 브랜치를 비교하는 3-way merge로 합칩니다. 같은 부분을 다르게 바꾸면 충돌이 생깁니다. 한쪽 이력이 다른 쪽에 포함되면 fast-forward로 포인터만 이동할 수 있습니다.",
          "Diverging histories use a three-way merge of the common ancestor and both branch tips. Conflicting edits to the same region need a decision. If one history includes the other, a fast-forward can simply move the pointer.",
          "分岐した履歴は共通祖先と両ブランチの先端を比較する3-way mergeで統合します。同じ箇所への異なる変更は判断が必要です。一方の履歴が他方を含む場合、fast-forwardでポインタだけを進められます。",
        ),
        {
          visualization: { type: "GIT_GRAPH", state: mergeState },
          guideNote: t(
            "main에서 병합하면 main이 이동하고 feature/login은 기존 위치에 남습니다.",
            "merging on main moves main while feature/login stays at its existing tip.",
            "mainでマージするとmainが進み、feature/loginは元の先端に残ります。",
          ),
        },
      ),
      stage(
        "COMMAND",
        t(
          "받아들일 브랜치에서 병합",
          "Merge from the receiving branch",
          "受け入れるブランチでマージ",
        ),
        t(
          "merge는 현재 브랜치를 바꿉니다. 먼저 목적지로 이동하세요. 충돌이 있으면 파일을 수정하고 add한 뒤 commit하여 병합을 끝냅니다.",
          "Merge updates the current branch. Switch to the destination first. If a conflict occurs, edit the file, add it, and commit to finish the merge.",
          "mergeは現在のブランチを更新します。先に統合先へ切り替えましょう。競合時はファイルを編集し、addしてからcommitで完了します。",
        ),
        {
          commandExamples: [
            {
              command: "git switch <branch>",
              example: "git switch main",
              explanation: t(
                "통합 대상인 main으로 이동합니다.",
                "Switch to main, the receiving branch.",
                "統合先のmainに切り替えます。",
              ),
            },
            {
              command: "git merge <branch>",
              example: "git merge feature/login",
              explanation: t(
                "기능 이력을 main에 통합합니다.",
                "Integrate feature history into main.",
                "機能の履歴をmainに統合します。",
              ),
            },
          ],
        },
      ),
      stage(
        "PRACTICE",
        t(
          "두 이력을 연결하세요",
          "Connect both histories",
          "2つの履歴をつなぐ",
        ),
        t(
          "main에서 feature/login을 병합하세요. 이 프로젝트는 서로 다른 파일을 수정했으므로 자동으로 통합할 수 있습니다.",
          "Merge feature/login into main. These changes affect different files, so they can be integrated automatically.",
          "mainでfeature/loginをマージしてください。異なるファイルを変更したので自動で統合できます。",
        ),
      ),
      stage(
        "RESULT",
        t("부모가 둘인 커밋", "A commit with two parents", "親が2つのコミット"),
        t(
          "병합 커밋은 두 브랜치의 이전 끝점을 부모로 갖습니다. Graph에서 두 이력이 연결되었는지 확인하세요.",
          "The merge commit has both previous branch tips as parents. Inspect how the histories connect in Graph.",
          "マージコミットは両ブランチの以前の先端を親に持ちます。Graphで履歴の接続を確認しましょう。",
        ),
      ),
    ],
    practice: {
      goal: t(
        "main에 기능 병합하기",
        "Merge the feature into main",
        "mainに機能をマージ",
      ),
      initialState: mergeState,
      successConditions: [
        { type: "CURRENT_BRANCH", branchName: "main" },
        { type: "MERGE_COMPLETED" },
        {
          type: "COMMIT_REACHABLE",
          commitId: mergeState.branches.find(
            (branch) => branch.name === "feature/login",
          )!.commitId!,
          branchName: "main",
        },
      ],
      relevantCommandKeys: ["status", "switch", "merge", "log"],
    },
  },
  {
    id: "lesson-5",
    slug: "remote",
    order: 5,
    title: t(
      "원격 · Fetch · Pull · Push",
      "Remote · Fetch · Pull · Push",
      "リモート・Fetch・Pull・Push",
    ),
    summary: t(
      "로컬 이력과 팀의 원격 이력을 동기화합니다.",
      "Synchronize local history with the team remote.",
      "ローカル履歴とチームのリモート履歴を同期します。",
    ),
    difficulty: "INTERMEDIATE",
    guestAccessible: false,
    xpReward: 260,
    stages: [
      stage(
        "SITUATION",
        t(
          "커밋했는데 팀원에게 안 보여요",
          "A commit your teammate cannot see",
          "コミットがチームに見えない",
        ),
        t(
          "로컬 커밋은 내 저장소에만 있습니다. 팀이 사용하는 원격 저장소에 공유해야 다른 사람이 가져갈 수 있습니다.",
          "A local commit exists only in your repository. Publish it to the team remote so others can fetch it.",
          "ローカルのコミットは自分のリポジトリにだけ存在します。チームのリモートに共有すると他の人が取得できます。",
        ),
        {
          visualization: {
            type: "TEAM_CONVERSATION",
            messages: [
              {
                id: "l5-m1",
                speakerName: "Milo",
                avatarKey: "cream",
                message: t(
                  "릴리스 커밋을 원격에서 찾을 수 없어요. 아직 로컬에 있나요?",
                  "I cannot find the release commit on the remote. Is it still local?",
                  "リモートでリリースのコミットが見つかりません。まだローカルですか？",
                ),
              },
              {
                id: "l5-m2",
                speakerName: "Pip",
                avatarKey: "primary",
                message: t(
                  "네, 로컬 main에 기록했어요. 이제 origin으로 보내 공유할게요.",
                  "Yes, it is committed on local main. I’ll publish it to origin now.",
                  "はい、ローカルmainに記録しました。これからoriginに送って共有します。",
                ),
              },
            ],
          },
        },
      ),
      stage(
        "WHY",
        t("서로 다른 저장소", "Separate repositories", "別々のリポジトリ"),
        t(
          "원격 저장소는 실시간으로 자동 동기화되지 않습니다. 가져오기와 보내기를 명시적으로 수행해야 합니다. 먼저 원격의 변경을 이해하면 팀 작업을 덮어쓰는 실수를 줄입니다.",
          "Repositories do not automatically synchronize in real time. Fetching and pushing are explicit operations. Understanding remote changes first helps avoid overwriting team work.",
          "リポジトリはリアルタイムに自動同期しません。取得と送信を明示的に行います。先にリモート変更を理解するとチームの作業を上書きするミスを減らせます。",
        ),
        {
          visualization: {
            type: "COMPARISON",
            left: t(
              "로컬 커밋만 생성: 팀원의 저장소에는 아직 없음",
              "Commit locally: the teammate’s repository does not have it yet",
              "ローカルでコミット：チームのリポジトリにはまだない",
            ),
            right: t(
              "원격에 push: 공유 저장소에 게시해 팀원이 fetch할 수 있음",
              "Push to the remote: publish so teammates can fetch the commit",
              "リモートにpush：共有先に公開するとチームがfetchできる",
            ),
          },
        },
      ),
      stage(
        "CONCEPT",
        t(
          "origin/main은 관찰한 위치",
          "origin/main is your last observation",
          "origin/mainは最後に観測した位置",
        ),
        t(
          "fetch는 원격 커밋과 추적 포인터를 갱신하지만 현재 파일은 바꾸지 않습니다. pull은 fetch 후 현재 브랜치에 통합합니다. push는 로컬 커밋을 보냅니다. upstream은 기본 원격·브랜치를 지정합니다.",
          "Fetch updates remote objects and tracking pointers without changing working files. Pull fetches and integrates into your current branch. Push sends local commits. An upstream specifies the default remote and branch.",
          "fetchはファイルを変えずにリモートのコミットと追跡ポインタを更新します。pullは取得後に現在のブランチへ統合します。pushはローカルコミットを送ります。upstreamは既定のリモートとブランチです。",
        ),
        {
          visualization: { type: "GIT_GRAPH", state: remote },
          guideNote: t(
            "로컬 main과 origin/main의 차이를 보세요. 공유 전에는 로컬 커밋이 한 개 앞서 있습니다.",
            "compare local main with origin/main; before publishing, local main is one commit ahead.",
            "ローカルmainとorigin/mainを比べましょう。共有前はローカルが1コミット先にあります。",
          ),
        },
      ),
      stage(
        "COMMAND",
        t("방향을 구분하세요", "Know the direction", "方向を区別する"),
        t(
          "이 명령들은 상황에 따라 선택하며 모두 순서대로 실행하는 지시가 아닙니다. fetch는 가져오기, pull은 가져온 이력의 통합, push는 공유에 사용합니다. 원격이 앞서면 이력을 통합한 뒤 push하세요. -u는 upstream을 설정합니다.",
          "Choose these commands for the situation; this is not a required sequence. Fetch retrieves history, pull fetches and integrates it, and push publishes it. Integrate remote work before pushing if it is ahead. -u sets upstream.",
          "これらは状況に合わせて選ぶコマンドで、すべてを順番に実行する指示ではありません。fetchは取得、pullは取得と統合、pushは共有です。リモートが先に進んでいる場合は統合後にpushしましょう。-uはupstreamを設定します。",
        ),
        {
          commandExamples: [
            {
              command: "git fetch <remote>",
              example: "git fetch origin",
              explanation: t(
                "원격의 최신 이력을 관찰합니다.",
                "Observe the latest remote history.",
                "最新のリモート履歴を取得します。",
              ),
            },
            {
              command: "git pull <remote> <branch>",
              example: "git pull origin main",
              explanation: t(
                "원격 main을 현재 브랜치에 통합합니다.",
                "Integrate remote main into the current branch.",
                "リモートmainを現在のブランチに統合します。",
              ),
            },
            {
              command: "git push [-u] <remote> <branch>",
              example: "git push -u origin main",
              explanation: t(
                "로컬 main을 공유하고 upstream을 설정합니다.",
                "Publish local main and set its upstream.",
                "ローカルmainを共有しupstreamを設定します。",
              ),
            },
          ],
        },
      ),
      stage(
        "PRACTICE",
        t(
          "준비한 릴리스를 공유",
          "Share the prepared release",
          "準備したリリースを共有",
        ),
        t(
          "로컬 main에는 아직 원격에 없는 커밋이 있습니다. origin의 main과 로컬 main이 같은 끝점을 가리키도록 공유하세요.",
          "Local main has a commit that is not on the remote. Publish it so local main and origin main point to the same tip.",
          "ローカルmainにはリモートにないコミットがあります。ローカルとoriginのmainが同じ先端を指すよう共有しましょう。",
        ),
      ),
      stage(
        "RESULT",
        t(
          "팀에 전달된 이력",
          "History shared with your team",
          "チームに共有された履歴",
        ),
        t(
          "로컬과 원격이 같은 커밋을 가리킵니다. 이제 퀘스트에서 브랜치·커밋·병합·원격을 함께 사용해 보세요.",
          "Local and remote now point to the same commit. Apply branches, commits, merges, and remotes together in Quests.",
          "ローカルとリモートが同じコミットを指しています。クエストでブランチ・コミット・マージ・リモートを組み合わせましょう。",
        ),
      ),
    ],
    practice: {
      goal: t(
        "origin/main과 동기화하기",
        "Synchronize with origin/main",
        "origin/mainと同期",
      ),
      initialState: remote,
      successConditions: [
        { type: "REMOTE_SYNCED", remoteName: "origin", branchName: "main" },
      ],
      relevantCommandKeys: ["fetch", "pull", "push", "log"],
    },
  },
];

// Valid sample sequences, not an exhaustive list of accepted Git workflows.
const solutionIndexes = [[0, 1, 2], [0], [0, 1], [0, 1], [2]];
for (const lesson of lessons) {
  const examples = lesson.stages.find(
    (item) => item.type === "COMMAND",
  )!.commandExamples!;
  lesson.practice.solution = solutionIndexes[lesson.order - 1].map((index) => ({
    ...examples[index],
    command: examples[index].example ?? examples[index].command,
  }));
}
