import type { LessonDefinition, LessonStage, LocalizedText } from "@gitneapig/shared";
import { createRepository, modifyWorkingFile, seedCommit } from "@gitneapig/simulator";
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
