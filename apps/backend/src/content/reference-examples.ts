import type {
  CommandExample,
  CommandKey,
  LocalizedText,
} from "@gitneapig/shared";

const l = (ko: string, en: string, ja: string): LocalizedText => ({
  ko,
  en,
  ja,
});
const example = (
  command: string,
  description: LocalizedText,
  before?: LocalizedText,
  after?: LocalizedText,
): CommandExample => ({ command, description, before, after });

// These are documentation examples, never terminal responses or automatic actions.
export const referenceExamples: Record<CommandKey, CommandExample[]> = {
  status: [
    example(
      "git status",
      l(
        "브랜치와 변경 분류를 확인합니다. 표시된 파일이 다음 커밋에 들어가는지는 staging 항목으로 구분합니다.",
        "Inspect the branch and change categories. Only the staged category is ready for the next commit.",
        "ブランチと変更の分類を確認します。次のコミット対象はステージ済みの項目です。",
      ),
      l(
        "main에서 README.md를 수정했고 notes.txt는 새 파일입니다. 아직 add하지 않았습니다.",
        "On main, README.md is modified and notes.txt is new. Neither is staged.",
        "mainでREADME.mdを編集し、notes.txtを新規作成しました。まだステージしていません。",
      ),
      l(
        "README.md는 modified, notes.txt는 untracked로 표시됩니다. 파일과 이력은 바뀌지 않습니다.",
        "README.md appears as modified and notes.txt as untracked. Files and history stay unchanged.",
        "README.mdはmodified、notes.txtはuntrackedと表示されます。ファイルと履歴は変わりません。",
      ),
    ),
  ],
  add: [
    example(
      "git add README.md",
      l(
        "파일 이름을 지정해 필요한 변경만 선택합니다. 삭제한 파일 이름을 지정하면 삭제도 stage합니다.",
        "Select only the named file. Naming a deleted tracked file stages its deletion too.",
        "指定したファイルだけを選びます。削除した追跡ファイルを指定すると削除もステージします。",
      ),
      l(
        "README.md 수정과 notes.txt 새 파일이 있으며 staging은 비어 있습니다.",
        "README.md is modified, notes.txt is new, and staging is empty.",
        "README.mdの編集と新規notes.txtがあり、ステージは空です。",
      ),
      l(
        "README.md만 staging에 들어갑니다. notes.txt와 커밋 이력은 그대로입니다.",
        "Only README.md enters staging. notes.txt and commit history stay unchanged.",
        "README.mdだけがステージされます。notes.txtとコミット履歴は変わりません。",
      ),
    ),
    example(
      "git add .",
      l(
        "현재 디렉터리 아래의 변경을 함께 선택합니다. 커밋에 포함하면 안 되는 파일이 없는지 먼저 status로 확인하세요.",
        "Stage changes under the current directory together. Check status first for files that must be excluded.",
        "現在のディレクトリ配下の変更をまとめて選びます。除外すべきファイルがないか先にstatusで確認しましょう。",
      ),
    ),
  ],
  commit: [
    example(
      'git commit -m "Document setup"',
      l(
        "-m 뒤의 따옴표 안에 변경 이유를 적습니다. 작업 파일이 아닌 staging 내용을 기록합니다.",
        "Put the change's purpose in quotes after -m. The snapshot comes from staging, not all working files.",
        "-mの後の引用符内に変更理由を書きます。全作業ファイルではなくステージ内容を記録します。",
      ),
      l(
        "README.md만 staging에 있고 notes.txt는 미추적 상태입니다.",
        "Only README.md is staged; notes.txt remains untracked.",
        "README.mdだけがステージ済みで、notes.txtは未追跡です。",
      ),
      l(
        "현재 브랜치에 새 커밋이 생기고 staging이 비워집니다. notes.txt는 커밋되지 않습니다.",
        "The current branch gains a commit and staging clears. notes.txt is not committed.",
        "現在のブランチにコミットが増え、ステージが空になります。notes.txtは記録されません。",
      ),
    ),
  ],
  log: [
    example(
      "git log --oneline",
      l(
        "--oneline은 커밋 ID와 메시지를 한 줄씩 표시합니다.",
        "--oneline shows each commit ID and message on one line.",
        "--onelineは各コミットIDとメッセージを1行で表示します。",
      ),
      l(
        "main에 부모로 이어진 두 커밋이 있습니다.",
        "main has two commits linked by a parent relationship.",
        "mainに親でつながった2つのコミットがあります。",
      ),
      l(
        "최신 커밋부터 두 줄이 표시됩니다. 브랜치와 파일은 바뀌지 않습니다.",
        "Two lines appear, newest first. Branches and files are unchanged.",
        "新しい順に2行表示されます。ブランチとファイルは変わりません。",
      ),
    ),
    example(
      "git log --graph --oneline",
      l(
        "--graph는 부모 연결을 함께 표시합니다. 현재 HEAD에서 도달할 수 있는 이력을 확인합니다.",
        "--graph also draws parent connections. Inspect history reachable from the current HEAD.",
        "--graphは親への接続も表示します。現在のHEADからたどれる履歴を確認します。",
      ),
    ),
  ],
  diff: [
    example(
      "git diff --staged",
      l(
        "--staged는 HEAD와 staging을 비교해 다음 커밋에 들어갈 변경을 보여줍니다.",
        "--staged compares HEAD with staging to show changes prepared for the next commit.",
        "--stagedはHEADとステージを比較し、次のコミットに入る変更を表示します。",
      ),
      l(
        "README.md를 수정하고 add했습니다. 그 뒤에는 편집하지 않았습니다.",
        "README.md was edited and staged, with no edits after staging.",
        "README.mdを編集してステージし、その後は編集していません。",
      ),
      l(
        "README.md의 변경이 표시되지만 실제 상태는 바뀌지 않습니다.",
        "README.md's staged changes are displayed without changing state.",
        "README.mdのステージ済み変更を表示し、状態は変えません。",
      ),
    ),
    example(
      "git diff",
      l(
        "옵션이 없으면 staging과 작업 파일을 비교합니다. 위 상태에서는 빈 결과이며, add 후 다시 편집하면 그 추가 수정만 보입니다. 미추적 파일은 표시하지 않습니다.",
        "Without an option, compare staging with working files. The example above gives empty output; editing again after add reveals only those later edits. Untracked files are omitted.",
        "引数なしではステージと作業ファイルを比較します。上の状態では空で、add後に再編集するとその差だけが表示されます。未追跡ファイルは表示しません。",
      ),
    ),
  ],
  branch: [
    example(
      "git branch feature/login",
      l(
        "현재 커밋을 가리키는 새 이름을 만듭니다. 작업 브랜치는 바꾸지 않습니다.",
        "Create a new name pointing to the current commit without switching branches.",
        "現在のコミットを指す名前を作ります。作業ブランチは変えません。",
      ),
      l(
        "현재 브랜치는 main이며 feature/login은 없습니다.",
        "The current branch is main; feature/login does not exist.",
        "現在はmainで、feature/loginは存在しません。",
      ),
      l(
        "두 브랜치가 같은 커밋을 가리킵니다. HEAD는 여전히 main에 있습니다.",
        "Both branches point to the same commit. HEAD remains on main.",
        "両ブランチは同じコミットを指します。HEADはmainのままです。",
      ),
    ),
    example(
      "git branch -d feature/login",
      l(
        "-d는 안전한 삭제입니다. 현재 브랜치가 아니고 병합된 브랜치만 삭제할 수 있습니다. 위처럼 새 커밋이 없는 브랜치는 main에서 삭제할 수 있습니다.",
        "-d safely deletes a non-current, merged branch. In the example above it has no unique commits, so main can delete it.",
        "-dは現在以外のマージ済みブランチを安全に削除します。上の例は固有コミットがないのでmainから削除できます。",
      ),
    ),
  ],
  switch: [
    example(
      "git switch -c feature/login",
      l(
        "-c는 생성과 전환을 한 번에 수행합니다. 이미 존재하는 이름에는 -c를 빼세요.",
        "-c creates and switches in one command. Omit -c for a name that already exists.",
        "-cは作成と切り替えを同時に行います。既存の名前には-cを付けません。",
      ),
      l(
        "main의 작업 상태가 깨끗하고 feature/login은 없습니다.",
        "main is clean and feature/login does not exist.",
        "mainの作業状態はクリーンでfeature/loginは存在しません。",
      ),
      l(
        "feature/login이 생기고 현재 브랜치가 됩니다. 새 커밋은 생기지 않습니다.",
        "feature/login is created and becomes current. No commit is created.",
        "feature/loginが作成され現在のブランチになります。コミットは増えません。",
      ),
    ),
    example(
      "git switch main",
      l(
        "기존 main으로 돌아갑니다. 이동 때문에 미커밋 변경을 잃게 되는 경우 먼저 정리해야 합니다.",
        "Return to existing main. Resolve uncommitted changes first if switching would overwrite them.",
        "既存のmainに戻ります。切り替えで未コミット変更が失われる場合は先に整理します。",
      ),
    ),
  ],
  checkout: [
    example(
      "git checkout -b feature/login",
      l(
        "이 시뮬레이터에서 -b는 switch -c와 같은 브랜치 생성·전환 동작입니다.",
        "In this simulator, -b creates and switches like switch -c.",
        "このシミュレーターでは-bはswitch -cと同じ作成・切り替え操作です。",
      ),
      l(
        "main은 깨끗하고 feature/login은 없는 상태입니다.",
        "main is clean and feature/login is absent.",
        "mainはクリーンでfeature/loginは存在しません。",
      ),
      l(
        "현재 커밋에서 feature/login을 만들고 이동합니다. 파일 내용은 그대로입니다.",
        "Create feature/login at the current commit and switch to it; file content is unchanged.",
        "現在のコミットにfeature/loginを作成して移動します。ファイル内容は同じです。",
      ),
    ),
    example(
      "git checkout main",
      l(
        "기존 main으로 이동합니다. 파일 복원이나 detached HEAD는 이 실습의 지원 범위가 아닙니다.",
        "Switch to existing main. File restoration and detached HEAD are outside this simulator's scope.",
        "既存のmainに移動します。ファイル復元やdetached HEADは対応範囲外です。",
      ),
    ),
  ],
  merge: [
    example(
      "git merge feature/login",
      l(
        "통합할 브랜치를 지정합니다. 먼저 목적지 main으로 이동해야 합니다.",
        "Name the source branch to integrate. Switch to destination main first.",
        "統合元を指定します。先に統合先mainに移動してください。",
      ),
      l(
        "main에서 작업 중이며 feature/login에만 새 커밋이 있습니다. main은 그 조상이고 작업 폴더는 깨끗합니다.",
        "You are on clean main, an ancestor of feature/login's new commit.",
        "クリーンなmainで作業中です。mainはfeature/loginの新しいコミットの祖先です。",
      ),
      l(
        "main이 새 커밋으로 fast-forward합니다. 이력이 갈라졌다면 별도 병합 커밋이나 충돌 해결이 필요합니다.",
        "main fast-forwards to the new commit. Diverged histories instead need a merge commit or conflict resolution.",
        "mainが新しいコミットへfast-forwardします。履歴が分岐している場合はマージコミットや競合解決が必要です。",
      ),
    ),
  ],
  fetch: [
    example(
      "git fetch origin",
      l(
        "origin의 최신 이력을 가져옵니다. 원격 저장소와 로컬의 origin/main은 서로 다른 상태임에 주의하세요.",
        "Fetch origin's latest history. The remote repository and local origin/main are distinct states.",
        "originの最新履歴を取得します。リモート本体とローカルのorigin/mainは別の状態です。",
      ),
      l(
        "원격 main에 새 커밋이 있고 로컬 main과 origin/main은 이전 커밋에 있습니다.",
        "Remote main has a new commit; local main and origin/main still point to the older one.",
        "リモートmainに新しいコミットがあり、ローカルmainとorigin/mainは以前の位置です。",
      ),
      l(
        "origin/main만 새 커밋을 가리킵니다. 현재 main과 작업 파일은 유지됩니다.",
        "origin/main advances. Current main and working files remain unchanged.",
        "origin/mainが進みます。現在のmainと作業ファイルは維持されます。",
      ),
    ),
    example(
      "git fetch",
      l(
        "이 시뮬레이터에서 원격 이름을 생략하면 origin을 사용합니다.",
        "This simulator uses origin when the remote name is omitted.",
        "このシミュレーターでは省略時にoriginを使います。",
      ),
    ),
  ],
  pull: [
    example(
      "git pull origin main",
      l(
        "origin의 main을 가져와 현재 브랜치에 병합합니다. 이 실습 엔진은 merge 방식을 사용합니다.",
        "Fetch origin/main and merge it into the current branch. This simulator uses merge integration.",
        "originのmainを取得し現在のブランチにマージします。この実習エンジンはmerge方式です。",
      ),
      l(
        "현재 main은 원격 main보다 뒤처졌고 로컬의 고유 커밋·미커밋 변경은 없습니다.",
        "Current main is behind remote main, with no unique local commits or uncommitted edits.",
        "現在のmainはリモートmainより遅れ、固有コミットや未コミット変更はありません。",
      ),
      l(
        "원격 변경이 현재 main과 작업 파일에 반영됩니다. 양쪽에서 같은 부분을 바꿨다면 충돌할 수 있습니다.",
        "Remote changes reach current main and working files. Conflicting edits on both sides may require resolution.",
        "リモート変更が現在のmainと作業ファイルに反映されます。双方の編集が重なると競合する場合があります。",
      ),
    ),
    example(
      "git pull",
      l(
        "현재 브랜치의 upstream을 사용합니다. upstream이 없으면 명시적인 원격·브랜치 이름이 필요합니다.",
        "Use the current branch's upstream. Without one, specify remote and branch explicitly.",
        "現在のブランチのupstreamを使います。未設定ならリモートとブランチを明示します。",
      ),
    ),
  ],
  push: [
    example(
      "git push -u origin feature/login",
      l(
        "-u는 전송 성공 후 feature/login의 upstream을 origin/feature/login으로 설정합니다.",
        "After a successful push, -u sets feature/login's upstream to origin/feature/login.",
        "push成功後、-uはfeature/loginのupstreamをorigin/feature/loginに設定します。",
      ),
      l(
        "feature/login에 로컬 커밋이 있고 원격에는 이 브랜치가 아직 없습니다.",
        "feature/login has local commits and the remote has no branch with that name yet.",
        "feature/loginにローカルコミットがあり、リモートには同名ブランチがまだありません。",
      ),
      l(
        "원격 브랜치가 생성되고 커밋이 공유됩니다. 다음부터 같은 브랜치에서 push만 입력할 수 있습니다.",
        "The remote branch is created and commits are published. Future pushes from this branch can omit arguments.",
        "リモートブランチが作成されコミットが共有されます。次回からこのブランチでは引数を省略できます。",
      ),
    ),
    example(
      "git push",
      l(
        "설정된 upstream으로 전송합니다. 원격이 먼저 진행되면 거절될 수 있으므로 fetch 후 이력을 확인하세요.",
        "Push to the configured upstream. A remote that has advanced may reject it; fetch and inspect history first.",
        "設定済みupstreamへ送信します。リモートが進んでいると拒否されるため、fetchして履歴を確認しましょう。",
      ),
    ),
  ],
};
