import type {
  CommandReferenceDefinition,
  ReferenceCommandKey,
  LocalizedText,
} from "@gitneapig/shared";
import { referenceDifficulty } from "@gitneapig/shared";
import { t } from "./lessons";
const entry = (
  key: ReferenceCommandKey,
  when: LocalizedText,
  command: string,
  before: LocalizedText,
  after: LocalizedText,
  mistake: LocalizedText,
  related: ReferenceCommandKey[],
  lesson: number,
): CommandReferenceDefinition => ({
  id: `command-${key}`,
  key,
  difficulty: referenceDifficulty(key),
  whenToUse: when,
  examples: [{ command, description: when, before, after }],
  commonMistakes: [mistake],
  relatedCommandKeys: related,
  relatedLessonIds: [`lesson-${lesson}`],
  relatedQuestIds: [],
});
export const extraReferences: CommandReferenceDefinition[] = [
  entry(
    "init",
    t(
      "새 프로젝트를 Git으로 기록하기 시작할 때 사용합니다. 기존 파일을 자동 커밋하지는 않습니다.",
      "Start tracking a new project with Git; existing files are not committed automatically.",
      "新しいプロジェクトをGitで記録し始めるときに使います。既存ファイルは自動コミットされません。",
    ),
    "git init -b main",
    t(
      "프로젝트 폴더에 파일은 있지만 .git은 없습니다.",
      "The project has files but no .git directory.",
      "ファイルはありますが.gitはありません。",
    ),
    t(
      "main을 초기 브랜치로 하는 저장소가 생기며 파일은 미추적 상태입니다.",
      "A repository with initial branch main exists; files remain untracked.",
      "初期ブランチmainのリポジトリができ、ファイルは未追跡のままです。",
    ),
    t(
      "기존 저장소 안에 실수로 중첩 저장소를 만들지 마세요.",
      "Avoid accidentally creating a nested repository.",
      "既存リポジトリ内に誤って入れ子のリポジトリを作らないでください。",
    ),
    ["clone", "config", "add"],
    1,
  ),
  entry(
    "clone",
    t(
      "팀의 기존 저장소를 로컬에서 작업하려고 할 때 사용합니다. 원격 이름은 기본적으로 origin입니다.",
      "Use when joining an existing repository locally. The default remote name is origin.",
      "既存リポジトリでローカル作業を始めるときに使います。既定のリモート名はoriginです。",
    ),
    "git clone https://example.com/team/project.git project",
    t(
      "접근 가능한 원격 저장소가 있고 로컬 project 폴더는 없습니다.",
      "An accessible remote exists; local project does not.",
      "アクセス可能なリモートがあり、ローカルprojectはありません。",
    ),
    t(
      "project 폴더에 이력과 기본 브랜치의 파일이 생깁니다. URL은 실제 저장소 주소로 바꾸세요.",
      "project contains history and default-branch files. Replace the example URL with your repository.",
      "projectに履歴と既定ブランチのファイルができます。例のURLは実際のURLに置き換えます。",
    ),
    t(
      "다운로드 ZIP에는 Git 이력이 없습니다. --depth로 복제하면 과거 이력이 제한됩니다.",
      "A ZIP has no Git history; --depth creates a limited history.",
      "ZIPにはGit履歴がありません。--depthは過去の履歴を制限します。",
    ),
    ["init", "remote", "fetch"],
    1,
  ),
  entry(
    "config",
    t(
      "커밋 작성자나 저장소별 동작을 설정할 때 사용합니다. 최신 구문은 get/set 하위 명령입니다.",
      "Set commit identity or repository behavior. Modern syntax uses get/set subcommands.",
      "コミット作成者やリポジトリの動作を設定します。新しい構文はget/setサブコマンドです。",
    ),
    'git config set --local user.name "Mina"',
    t(
      "현재 저장소에 user.name의 로컬 설정이 없습니다.",
      "No local user.name is set for this repository.",
      "このリポジトリにuser.nameのローカル設定がありません。",
    ),
    t(
      "이 저장소의 이후 커밋에서 작성자 이름 Mina를 사용합니다.",
      "Future commits in this repository use author name Mina.",
      "このリポジトリの今後のコミットは作成者名Minaを使います。",
    ),
    t(
      "user.name은 로그인 계정이 아닙니다. --global은 다른 저장소에도 영향을 줍니다.",
      "user.name is not a login account. --global also affects other repositories.",
      "user.nameはログインアカウントではありません。--globalは他のリポジトリにも影響します。",
    ),
    ["init", "commit", "log"],
    1,
  ),
  entry(
    "remote",
    t(
      "팀 서버의 주소를 등록하거나 확인할 때 사용합니다. 이름 등록만으로 이력을 가져오지는 않습니다.",
      "Register or inspect a team server URL. Adding a remote does not fetch its history.",
      "チームサーバーのURLを登録・確認します。登録だけでは履歴を取得しません。",
    ),
    "git remote add origin https://example.com/team/project.git",
    t(
      "origin이라는 원격 이름이 없습니다.",
      "There is no remote named origin.",
      "originというリモート名はありません。",
    ),
    t(
      "origin 이름에 예시 URL이 연결됩니다. 실제 저장소 주소를 사용하세요.",
      "origin maps to the example URL. Use your actual repository URL.",
      "originが例のURLに対応します。実際のURLを使ってください。",
    ),
    t(
      "이미 있는 이름은 add 대신 set-url로 변경합니다. 원격 제거는 서버 저장소를 삭제하지 않습니다.",
      "Use set-url for an existing name. Removing a remote does not delete the server repository.",
      "既存の名前はset-urlで変更します。リモート削除はサーバーのリポジトリを消しません。",
    ),
    ["clone", "fetch", "push"],
    5,
  ),
  entry(
    "restore",
    t(
      "잘못 스테이징했거나 작업 파일을 기준 내용으로 되돌릴 때 사용합니다. 대상 영역을 먼저 구분하세요.",
      "Use to unstage changes or restore working files. Choose the destination carefully.",
      "誤ったステージを解除したり作業ファイルを戻すときに使います。対象領域を確認しましょう。",
    ),
    "git restore --staged README.md",
    t(
      "README.md 수정이 스테이징되어 있습니다.",
      "README.md edits are staged.",
      "README.mdの編集はステージ済みです。",
    ),
    t(
      "스테이지만 HEAD 내용으로 돌아가고 작업 파일의 수정은 남습니다.",
      "The index returns to HEAD while working edits remain.",
      "ステージだけがHEADの内容に戻り、作業ファイルの編集は残ります。",
    ),
    t(
      "옵션 없는 restore는 미커밋 작업을 덮어쓸 수 있습니다. 되돌릴 내용은 먼저 보관하세요.",
      "Plain restore can overwrite uncommitted work. Preserve anything you need first.",
      "引数なしのrestoreは未コミット作業を上書きし得ます。必要な変更は先に保管してください。",
    ),
    ["status", "diff", "reset"],
    2,
  ),
  entry(
    "rm",
    t(
      "버전 관리에서 파일을 제거하고 그 삭제를 다음 커밋에 담을 때 사용합니다.",
      "Remove a tracked file and stage its deletion for the next commit.",
      "追跡ファイルを削除し、次のコミットに削除を含めます。",
    ),
    "git rm old.txt",
    t(
      "old.txt는 추적 중이며 수정되지 않았습니다.",
      "old.txt is tracked and unmodified.",
      "old.txtは追跡中で変更されていません。",
    ),
    t(
      "작업 파일이 제거되고 삭제가 스테이징됩니다. 커밋해야 이력에 기록됩니다.",
      "The file is removed and deletion is staged; commit to record it.",
      "作業ファイルが削除され、削除がステージされます。履歴への記録にはコミットします。",
    ),
    t(
      "미추적 파일에는 rm이 아니라 파일 시스템 삭제를 사용합니다. -f는 보호 검사를 무시합니다.",
      "Untracked files need filesystem deletion. -f bypasses safety checks.",
      "未追跡ファイルはファイルシステムで削除します。-fは保護チェックを無視します。",
    ),
    ["add", "restore", "commit"],
    2,
  ),
  entry(
    "mv",
    t(
      "추적 파일의 이름이나 경로를 바꾸고 스테이지도 함께 갱신할 때 사용합니다.",
      "Rename or move a tracked file and update the index together.",
      "追跡ファイルを改名・移動し、ステージも更新します。",
    ),
    "git mv old.txt new.txt",
    t(
      "추적 파일 old.txt가 있고 new.txt는 없습니다.",
      "Tracked old.txt exists; new.txt does not.",
      "追跡ファイルold.txtがあり、new.txtはありません。",
    ),
    t(
      "new.txt로 이동한 변경이 스테이징됩니다. 커밋은 별도로 필요합니다.",
      "The move to new.txt is staged; a commit is still needed.",
      "new.txtへの移動がステージされます。コミットは別途必要です。",
    ),
    t(
      "Git은 내용 비교로 이름 변경을 감지합니다. mv 자체가 별도 이력을 만드는 것은 아닙니다.",
      "Git detects renames by content similarity; mv does not create history by itself.",
      "Gitは内容の類似性から改名を検出します。mv自体は履歴を作りません。",
    ),
    ["rm", "add", "status"],
    2,
  ),
  entry(
    "stash",
    t(
      "커밋하기 애매한 작업을 잠시 치우고 다른 브랜치로 이동해야 할 때 사용합니다.",
      "Set unfinished work aside before switching tasks.",
      "未完成の作業を一時的に片付けて別の作業へ移るときに使います。",
    ),
    'git stash push -u -m "Login draft"',
    t(
      "추적 파일의 수정과 새 미추적 파일이 있습니다.",
      "Tracked edits and new untracked files exist.",
      "追跡ファイルの編集と新規未追跡ファイルがあります。",
    ),
    t(
      "수정과 미추적 파일이 stash에 보관되고 작업 폴더에서 치워집니다. ignored 파일은 남습니다.",
      "Edits and untracked files are stored and removed from the worktree; ignored files remain.",
      "編集と未追跡ファイルが保管され、作業フォルダから除かれます。ignoredファイルは残ります。",
    ),
    t(
      "기본 stash는 미추적 파일을 제외합니다. pop은 충돌할 수 있으며 충돌 시 보관 항목이 유지됩니다.",
      "Default stash excludes untracked files. pop may conflict; a conflicting entry is retained.",
      "既定のstashは未追跡ファイルを除外します。popで競合すると保管項目は残ります。",
    ),
    ["switch", "status", "restore"],
    3,
  ),
  entry(
    "tag",
    t(
      "릴리스 커밋처럼 바뀌지 않는 지점을 이름으로 표시할 때 사용합니다.",
      "Mark a stable point such as a release commit with a name.",
      "リリースコミットなど固定の時点に名前を付けます。",
    ),
    'git tag -a v1.0 -m "Release 1.0"',
    t(
      "현재 HEAD가 배포할 커밋이고 v1.0 태그가 없습니다.",
      "HEAD is the release commit and v1.0 does not exist.",
      "HEADがリリース対象でv1.0タグはありません。",
    ),
    t(
      "태그 작성자·메시지를 가진 v1.0 태그가 생깁니다. 원격에는 아직 없습니다.",
      "An annotated v1.0 tag exists locally, not yet remotely.",
      "作成者とメッセージを持つv1.0タグがローカルにでき、まだリモートにはありません。",
    ),
    t(
      "일반 push는 모든 태그를 자동 공유하지 않습니다. 공개한 릴리스 태그를 재지정하지 마세요.",
      "A normal push does not send every tag. Avoid moving published release tags.",
      "通常のpushは全タグを自動共有しません。公開済みリリースタグを付け直さないでください。",
    ),
    ["show", "log", "push"],
    1,
  ),
  entry(
    "show",
    t(
      "검토할 커밋의 메시지와 변경 패치 또는 특정 파일 버전을 확인할 때 사용합니다.",
      "Inspect a commit message and patch, or a specific file version.",
      "コミットのメッセージと差分や特定のファイル版を確認します。",
    ),
    "git show HEAD:README.md",
    t(
      "HEAD 커밋에 README.md가 저장되어 있습니다.",
      "HEAD contains README.md.",
      "HEADにREADME.mdが保存されています。",
    ),
    t(
      "커밋 속 README.md 내용이 출력됩니다. 작업 파일은 바뀌지 않습니다.",
      "The committed file content is printed; working files stay unchanged.",
      "コミット内の内容が表示され、作業ファイルは変わりません。",
    ),
    t(
      "HEAD:path는 현재 작업 파일이 아닌 커밋 속 파일입니다. 없는 경로는 오류입니다.",
      "HEAD:path names a committed file, not the working copy. Missing paths fail.",
      "HEAD:pathは作業ファイルではなくコミット内のファイルです。存在しないパスはエラーです。",
    ),
    ["log", "diff", "tag"],
    1,
  ),
  entry(
    "revert",
    t(
      "공유된 이력을 지우지 않고 잘못된 커밋의 효과를 취소할 때 사용합니다.",
      "Undo a bad change while preserving shared history.",
      "共有履歴を消さずに誤った変更の効果を取り消します。",
    ),
    "git revert HEAD",
    t(
      "깨끗한 작업 폴더에서 HEAD가 취소할 일반 커밋입니다.",
      "The worktree is clean and HEAD is the ordinary commit to undo.",
      "作業フォルダはクリーンでHEADは取り消したい通常コミットです。",
    ),
    t(
      "변경을 반대로 적용한 새 커밋이 생깁니다. 원래 커밋은 남습니다.",
      "A new inverse commit is created; the original remains.",
      "逆の変更を持つ新しいコミットができ、元のコミットは残ります。",
    ),
    t(
      "이후 변경과 충돌할 수 있습니다. 병합 커밋 취소에는 -m의 기준 부모를 이해해야 합니다.",
      "Later changes can conflict. Reverting a merge requires understanding the -m mainline parent.",
      "後の変更と競合し得ます。マージの取消には-mの基準親の理解が必要です。",
    ),
    ["reset", "log", "show"],
    4,
  ),
  entry(
    "reset",
    t(
      "공유하지 않은 마지막 커밋을 다시 정리하거나 스테이지를 되돌릴 때 사용합니다. 모드별 보존 영역이 다릅니다.",
      "Rework unpublished commits or reset the index. Each mode preserves different areas.",
      "未公開コミットを整理したりステージを戻します。モードで保存される領域が異なります。",
    ),
    "git reset --soft HEAD~1",
    t(
      "일반 커밋 두 개가 있고 작업 폴더는 깨끗합니다.",
      "Two ordinary commits exist and the worktree is clean.",
      "通常コミットが2つあり、作業フォルダはクリーンです。",
    ),
    t(
      "브랜치가 한 커밋 뒤로 이동하며 마지막 변경은 스테이지와 작업 폴더에 남습니다.",
      "The branch moves back one commit; its changes remain staged and in working files.",
      "ブランチが1コミット戻り、最後の変更はステージと作業ファイルに残ります。",
    ),
    t(
      "--hard는 미커밋 변경을 잃게 할 수 있습니다. 공유 이력 취소에는 revert를 검토하세요.",
      "--hard can lose uncommitted work. Consider revert for shared history.",
      "--hardは未コミット作業を失い得ます。共有履歴にはrevertを検討してください。",
    ),
    ["restore", "revert", "reflog"],
    2,
  ),
  entry(
    "rebase",
    t(
      "로컬 기능 브랜치의 커밋을 최신 main 위로 정리할 때 사용합니다. 새 커밋 ID가 만들어집니다.",
      "Move local feature commits onto updated main; rewritten commits get new IDs.",
      "ローカル機能コミットを最新mainの上へ整理します。新しいコミットIDになります。",
    ),
    "git rebase main",
    t(
      "현재 feature 브랜치와 main이 공통 조상에서 갈라졌고 작업 폴더는 깨끗합니다.",
      "Current feature and main diverged from a common ancestor; the worktree is clean.",
      "現在のfeatureとmainは共通祖先から分岐し、作業フォルダはクリーンです。",
    ),
    t(
      "feature의 고유 변경이 main 다음에 재적용됩니다. 충돌하면 해결 후 continue가 필요합니다.",
      "Feature changes replay after main; conflicts need resolution and continue.",
      "feature固有の変更がmainの後へ再適用されます。競合時は解決後にcontinueが必要です。",
    ),
    t(
      "다른 사람이 기반으로 삼은 커밋을 협의 없이 재작성하지 마세요.",
      "Do not rewrite commits others depend on without coordination.",
      "他の人が基にしているコミットを相談なく書き換えないでください。",
    ),
    ["merge", "log", "reflog"],
    4,
  ),
  entry(
    "cherry-pick",
    t(
      "다른 브랜치의 특정 수정 하나만 현재 브랜치에 가져올 때 사용합니다.",
      "Bring one selected fix from another branch onto the current branch.",
      "別ブランチの特定の修正だけを現在のブランチへ取り込みます。",
    ),
    "git cherry-pick fix/login",
    t(
      "fix/login의 끝 커밋이 필요한 수정이며 현재 브랜치에는 없습니다.",
      "The tip commit of fix/login is a needed fix absent from the current branch.",
      "fix/loginの先端が必要な修正で、現在のブランチにはありません。",
    ),
    t(
      "해당 커밋의 변경으로 새 커밋이 생깁니다. 원래 브랜치는 이동하지 않습니다.",
      "A new commit applies that change; the source branch does not move.",
      "その変更を適用する新コミットができ、元ブランチは動きません。",
    ),
    t(
      "브랜치 전체를 가져오는 명령이 아닙니다. 의존 커밋이 없으면 기능이 깨지거나 충돌할 수 있습니다.",
      "This does not merge the entire branch. Missing dependencies may break the fix or cause conflicts.",
      "ブランチ全体のマージではありません。依存コミットがないと動作不良や競合が起き得ます。",
    ),
    ["merge", "show", "revert"],
    4,
  ),
  entry(
    "reflog",
    t(
      "reset이나 브랜치 이동 전의 로컬 커밋 위치를 찾을 때 사용합니다.",
      "Find a local commit position from before a reset or branch move.",
      "resetやブランチ移動前のローカルコミット位置を探します。",
    ),
    "git reflog show HEAD",
    t(
      "로컬에서 커밋과 브랜치 전환을 수행했습니다.",
      "Commits and branch switches have occurred locally.",
      "ローカルでコミットやブランチ切り替えを行いました。",
    ),
    t(
      "HEAD가 가리켰던 위치가 표시됩니다. 이 명령은 복원 자체를 수행하지 않습니다.",
      "Previous HEAD positions are shown; this command does not restore anything by itself.",
      "過去のHEAD位置が表示されます。このコマンド自体は復元しません。",
    ),
    t(
      "reflog는 로컬 기록이며 영구 백업이 아닙니다. 만료되거나 객체가 정리되면 복구할 수 없습니다.",
      "Reflogs are local and not permanent backups. Expired entries or pruned objects may be unrecoverable.",
      "reflogはローカル記録で永久バックアップではありません。期限切れやオブジェクト削除で復旧できない場合があります。",
    ),
    ["reset", "branch", "log"],
    3,
  ),
  entry(
    "bisect",
    t(
      "문제가 재현되는 버전과 정상 버전을 알고 있을 때 최초 원인 커밋을 이진 탐색합니다.",
      "Use a known good and bad revision to binary-search the first bad commit.",
      "正常版と不具合版が分かるとき、最初の原因コミットを二分探索します。",
    ),
    "git bisect start HEAD v1.0",
    t(
      "HEAD에서 오류가 재현되고 v1.0에서는 같은 테스트가 통과합니다.",
      "The same test fails at HEAD and passes at v1.0.",
      "同じテストがHEADで失敗し、v1.0で成功します。",
    ),
    t(
      "중간 커밋이 체크아웃됩니다. 테스트 후 good 또는 bad를 반복하고 종료 시 reset합니다.",
      "A midpoint is checked out. Test, mark good/bad repeatedly, then reset when finished.",
      "中間コミットがチェックアウトされます。テストしてgood/badを繰り返し、終了時にresetします。",
    ),
    t(
      "판정이 일관되지 않으면 잘못된 원인을 찾습니다. 실행 불가능한 커밋은 skip으로 건너뜁니다.",
      "Inconsistent tests misidentify the cause. Use skip for untestable commits.",
      "判定が不安定だと原因を誤ります。テスト不能なコミットにはskipを使います。",
    ),
    ["log", "show", "revert"],
    1,
  ),
  entry(
    "worktree",
    t(
      "현재 작업을 치우지 않고 다른 브랜치를 별도 폴더에서 테스트할 때 사용합니다.",
      "Test another branch in a separate folder without setting current work aside.",
      "現在の作業を片付けず、別フォルダで他のブランチをテストします。",
    ),
    "git worktree add -b hotfix ../project-hotfix main",
    t(
      "main이 있고 hotfix 브랜치와 대상 폴더는 없습니다.",
      "main exists; hotfix and the target folder do not.",
      "mainがあり、hotfixと対象フォルダはありません。",
    ),
    t(
      "main에서 만든 hotfix가 별도 폴더에 체크아웃됩니다. 객체 저장소는 공유합니다.",
      "A new hotfix based on main is checked out separately; the object database is shared.",
      "mainから作ったhotfixが別フォルダにチェックアウトされ、オブジェクトDBは共有されます。",
    ),
    t(
      "한 브랜치를 여러 worktree에 동시에 체크아웃하는 것은 기본적으로 거절됩니다. 제거는 worktree remove를 사용하세요.",
      "The same branch is normally refused in multiple worktrees. Remove them with worktree remove.",
      "同じブランチを複数worktreeへ同時チェックアウトすることは通常拒否されます。削除にはworktree removeを使います。",
    ),
    ["branch", "switch", "stash"],
    3,
  ),
  entry(
    "clean",
    t(
      "빌드 잔여물 같은 미추적 파일을 정리할 때 사용합니다. 반드시 먼저 삭제 대상을 미리 확인하세요.",
      "Remove untracked build leftovers. Always preview the selection first.",
      "ビルド残骸など未追跡ファイルを整理します。先に削除対象を確認してください。",
    ),
    "git clean -nd",
    t(
      "미추적 파일과 디렉터리, ignored 파일이 있습니다.",
      "Untracked files, directories, and ignored files exist.",
      "未追跡ファイル・ディレクトリとignoredファイルがあります。",
    ),
    t(
      "ignored를 제외한 삭제 예정 목록만 표시됩니다. 실제 파일은 유지됩니다.",
      "Only a proposed deletion list excluding ignored files is shown; files remain.",
      "ignored以外の削除予定一覧だけが表示され、ファイルは残ります。",
    ),
    t(
      "-f는 실제 삭제이며 Git이 추적하지 않은 내용은 보통 복구할 수 없습니다. -x는 ignored 파일까지 포함합니다.",
      "-f deletes for real; untracked content is usually unrecoverable through Git. -x includes ignored files.",
      "-fは実際に削除します。未追跡内容は通常Gitで復旧できません。-xはignoredも対象にします。",
    ),
    ["status", "stash", "restore"],
    2,
  ),
];
