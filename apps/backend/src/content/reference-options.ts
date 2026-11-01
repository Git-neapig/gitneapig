import type {
  ReferenceCommandKey,
  ReferenceOption,
  LocalizedText,
} from "@gitneapig/shared";
import { t } from "./lessons";
const o = (
  flag: string,
  effect: LocalizedText,
  example: string,
  caution: LocalizedText,
): ReferenceOption => ({ flag, effect, example, caution });
export const referenceOptions: Record<ReferenceCommandKey, ReferenceOption[]> =
  {
    init: [
      o(
        "-b <name>",
        t(
          "초기 브랜치 이름 지정",
          "Set the initial branch name",
          "初期ブランチ名を指定",
        ),
        "git init -b main",
        t(
          "첫 커밋은 별도로 필요합니다.",
          "A first commit is still needed.",
          "最初のコミットは別途必要です。",
        ),
      ),
    ],
    clone: [
      o(
        "--depth <n>",
        t(
          "최근 n단계로 이력 제한",
          "Limit history to a depth of n",
          "履歴を深さnに制限",
        ),
        "git clone --depth 1 https://example.com/team/project.git",
        t(
          "과거 커밋 조사에는 추가 fetch가 필요할 수 있습니다.",
          "Older history may require a further fetch.",
          "過去の調査には追加fetchが必要な場合があります。",
        ),
      ),
    ],
    config: [
      o(
        "--global",
        t(
          "사용자 전체 설정 변경",
          "Change user-wide configuration",
          "ユーザー全体の設定を変更",
        ),
        'git config set --global user.name "Mina"',
        t(
          "저장소별 설정이 우선할 수 있습니다.",
          "Repository settings can override it.",
          "リポジトリ設定が優先される場合があります。",
        ),
      ),
    ],
    status: [
      o(
        "--short",
        t(
          "두 열의 간결한 상태 표시",
          "Show compact two-column status",
          "2列の短い状態を表示",
        ),
        "git status --short",
        t(
          "첫 열은 스테이지, 둘째 열은 작업 파일입니다.",
          "The first column is index state; the second is working-tree state.",
          "第1列はステージ、第2列は作業ファイルです。",
        ),
      ),
    ],
    add: [
      o(
        "-p",
        t(
          "변경 조각을 대화식 선택",
          "Select patch hunks interactively",
          "変更部分を対話式に選択",
        ),
        "git add -p README.md",
        t(
          "선택하지 않은 변경은 작업 폴더에 남습니다.",
          "Unselected edits stay in working files.",
          "選ばない変更は作業ファイルに残ります。",
        ),
      ),
      o(
        "-A",
        t(
          "저장소 전체 추가·수정·삭제 스테이징",
          "Stage additions, edits, and deletions throughout the repository",
          "リポジトリ全体の追加・編集・削除をステージ",
        ),
        "git add -A",
        t(
          "비밀 파일이나 무관한 변경이 없는지 검토하세요.",
          "Review for secrets and unrelated changes.",
          "秘密ファイルや無関係な変更がないか確認します。",
        ),
      ),
    ],
    commit: [
      o(
        "-m <message>",
        t(
          "커밋 메시지 지정",
          "Set the commit message",
          "コミットメッセージを指定",
        ),
        'git commit -m "Document setup"',
        t(
          "스테이지가 비어 있으면 일반 커밋은 만들어지지 않습니다.",
          "An ordinary commit needs staged changes.",
          "通常のコミットにはステージ済み変更が必要です。",
        ),
      ),
      o(
        "--amend",
        t(
          "마지막 커밋 교체",
          "Replace the last commit",
          "最後のコミットを置換",
        ),
        "git commit --amend",
        t(
          "커밋 ID가 바뀝니다. 공유한 이력은 협의 없이 바꾸지 마세요.",
          "This changes the commit ID; coordinate before rewriting shared history.",
          "IDが変わります。共有履歴の書換えは相談してください。",
        ),
      ),
    ],
    log: [
      o(
        "--oneline",
        t(
          "커밋별 한 줄 표시",
          "Show one line per commit",
          "コミットごとに1行表示",
        ),
        "git log --oneline",
        t(
          "전체 메시지와 패치는 생략됩니다.",
          "Full messages and patches are omitted.",
          "完全なメッセージと差分は省略されます。",
        ),
      ),
      o(
        "--all --graph",
        t(
          "모든 참조에서 이력을 그래프로 표시",
          "Graph history reachable from all refs",
          "全参照からたどれる履歴をグラフ表示",
        ),
        "git log --all --graph --oneline",
        t(
          "삭제된 참조의 모든 과거 위치를 표시하는 것은 아닙니다.",
          "This is not a record of every deleted reference position.",
          "削除済み参照の全過去位置の記録ではありません。",
        ),
      ),
    ],
    diff: [
      o(
        "--staged",
        t(
          "HEAD와 스테이지 비교",
          "Compare HEAD with the index",
          "HEADとステージを比較",
        ),
        "git diff --staged",
        t(
          "add 후의 추가 수정은 기본 diff로 확인합니다.",
          "Use plain diff for edits made after staging.",
          "add後の追加編集は通常のdiffで確認します。",
        ),
      ),
    ],
    branch: [
      o(
        "-d <name>",
        t(
          "병합된 브랜치 삭제",
          "Delete a merged branch",
          "マージ済みブランチを削除",
        ),
        "git branch -d feature/login",
        t(
          "현재 브랜치에서는 거절됩니다. -D는 병합 확인을 무시합니다.",
          "The current branch is protected. -D bypasses the merge check.",
          "現在のブランチは保護されます。-Dはマージ確認を無視します。",
        ),
      ),
    ],
    switch: [
      o(
        "-c <name>",
        t(
          "생성 후 브랜치 전환",
          "Create and switch branches",
          "作成してブランチを切替",
        ),
        "git switch -c feature/login",
        t(
          "이미 존재하는 이름에는 -c를 빼세요.",
          "Omit -c for an existing branch.",
          "既存ブランチには-cを外します。",
        ),
      ),
    ],
    checkout: [
      o(
        "-b <name>",
        t(
          "브랜치 생성 및 전환",
          "Create and switch to a branch",
          "ブランチを作成して切替",
        ),
        "git checkout -b feature/login",
        t(
          "파일 복원 구문과 혼동하지 마세요. switch -c가 더 명확합니다.",
          "Do not confuse this with file restoration; switch -c is clearer.",
          "ファイル復元構文と混同しないでください。switch -cの方が明確です。",
        ),
      ),
    ],
    merge: [
      o(
        "--ff-only",
        t(
          "fast-forward만 허용",
          "Allow fast-forward updates only",
          "fast-forwardのみ許可",
        ),
        "git merge --ff-only feature/login",
        t(
          "이력이 갈라졌으면 실패하며 병합 커밋을 만들지 않습니다.",
          "Diverged history fails without creating a merge commit.",
          "分岐した履歴では失敗し、マージコミットを作りません。",
        ),
      ),
      o(
        "--abort",
        t(
          "진행 중 병합 중단",
          "Abort a merge in progress",
          "進行中マージを中止",
        ),
        "git merge --abort",
        t(
          "시작 전 미커밋 변경이 있으면 완전 복원이 어려울 수 있습니다.",
          "Pre-existing uncommitted edits can prevent full restoration.",
          "開始前の未コミット編集があると完全復元できない場合があります。",
        ),
      ),
    ],
    fetch: [
      o(
        "--prune",
        t(
          "사라진 원격 브랜치의 추적 참조 정리",
          "Remove stale remote-tracking references",
          "消えたリモートブランチの追跡参照を整理",
        ),
        "git fetch --prune origin",
        t(
          "현재 로컬 작업 브랜치를 자동 삭제하지 않습니다.",
          "This does not automatically delete local working branches.",
          "ローカル作業ブランチは自動削除されません。",
        ),
      ),
    ],
    pull: [
      o(
        "--ff-only",
        t(
          "fetch 후 fast-forward만 수행",
          "Fetch and permit only fast-forward integration",
          "fetch後にfast-forwardのみ実行",
        ),
        "git pull --ff-only origin main",
        t(
          "로컬과 원격이 갈라졌다면 별도의 통합 판단이 필요합니다.",
          "Divergence requires a separate integration decision.",
          "ローカルとリモートの分岐には別途統合判断が必要です。",
        ),
      ),
      o(
        "--rebase",
        t(
          "fetch 후 로컬 커밋 재적용",
          "Fetch then rebase local commits",
          "fetch後にローカルコミットを再適用",
        ),
        "git pull --rebase origin main",
        t(
          "로컬 커밋 ID가 바뀔 수 있습니다. 공유된 커밋에 주의하세요.",
          "Local commit IDs may change; take care with shared commits.",
          "ローカルIDが変わり得ます。共有コミットに注意してください。",
        ),
      ),
    ],
    push: [
      o(
        "-u, --set-upstream",
        t(
          "성공하거나 최신인 브랜치의 추적 관계 설정",
          "Set tracking for successful or up-to-date branches",
          "成功または最新のブランチの追跡関係を設定",
        ),
        "git push -u origin feature/login",
        t(
          "권한 오류나 거절을 해결하는 옵션은 아닙니다.",
          "This does not bypass permissions or rejections.",
          "権限エラーや拒否を回避するものではありません。",
        ),
      ),
      o(
        "--dry-run",
        t(
          "실제 갱신 없이 전송 미리 확인",
          "Preview without updating remote refs",
          "リモート更新なしで確認",
        ),
        "git push --dry-run origin main",
        t(
          "실제 전송 시점의 서버 상태는 달라질 수 있습니다.",
          "Server state can change before the real push.",
          "実際のpush時にはサーバー状態が変わる場合があります。",
        ),
      ),
      o(
        "--tags",
        t(
          "다른 지정 참조와 함께 모든 로컬 태그 전송",
          "Send all local tags in addition to other selected refs",
          "他の指定参照に加えて全ローカルタグを送信",
        ),
        "git push origin --tags",
        t(
          "공유하지 않을 태그가 포함되지 않는지 확인하세요.",
          "Check for tags that should remain private.",
          "共有しないタグが含まれないか確認してください。",
        ),
      ),
      o(
        "--force-with-lease",
        t(
          "예상 원격 상태를 조건으로 강제 갱신",
          "Force an update conditional on expected remote state",
          "期待するリモート状態を条件に強制更新",
        ),
        "git push --force-with-lease origin feature/login",
        t(
          "고급·위험: 안전 보장이 아닙니다. 공유 이력 변경은 협의하고 원격 변경을 확인하세요.",
          "Advanced risk: not a safety guarantee. Coordinate history rewrites and inspect remote changes.",
          "上級・危険: 安全の保証ではありません。履歴書換えを相談し、リモート変更を確認します。",
        ),
      ),
    ],
    remote: [
      o(
        "-v",
        t(
          "원격별 fetch/push URL 표시",
          "Show fetch and push URLs",
          "fetch/push URLを表示",
        ),
        "git remote -v",
        t(
          "URL에 자격 증명을 넣지 마세요.",
          "Do not embed credentials in URLs.",
          "URLに認証情報を含めないでください。",
        ),
      ),
    ],
    restore: [
      o(
        "--staged",
        t(
          "HEAD에서 스테이지 복원",
          "Restore the index from HEAD",
          "HEADからステージを復元",
        ),
        "git restore --staged README.md",
        t(
          "--worktree도 함께 주면 작업 파일까지 바뀝니다.",
          "Adding --worktree also changes working files.",
          "--worktreeも付けると作業ファイルも変わります。",
        ),
      ),
    ],
    rm: [
      o(
        "--cached",
        t(
          "작업 파일은 남기고 추적 제거 스테이징",
          "Stage untracking while keeping the working file",
          "作業ファイルを残して追跡解除をステージ",
        ),
        "git rm --cached notes.txt",
        t(
          "이미 커밋한 비밀은 과거 이력에서 사라지지 않습니다.",
          "Previously committed secrets remain in history.",
          "以前コミットした秘密は履歴に残ります。",
        ),
      ),
    ],
    mv: [
      o(
        "-n, --dry-run",
        t("파일 이동 미리 확인", "Preview the move", "ファイル移動を事前確認"),
        "git mv -n old.txt new.txt",
        t(
          "실제로 이동하지 않으므로 후속 실행이 필요합니다.",
          "This does not perform the move.",
          "実際には移動しません。",
        ),
      ),
    ],
    stash: [
      o(
        "-u, --include-untracked",
        t(
          "미추적 파일도 보관",
          "Include untracked files",
          "未追跡ファイルも保管",
        ),
        "git stash push -u",
        t(
          "ignored 파일은 포함되지 않습니다. -a는 ignored도 포함합니다.",
          "Ignored files are excluded; -a includes them.",
          "ignoredは対象外です。-aはignoredも含みます。",
        ),
      ),
    ],
    tag: [
      o(
        "-a",
        t(
          "메타데이터가 있는 주석 태그 생성",
          "Create an annotated tag with metadata",
          "メタデータ付き注釈タグを作成",
        ),
        'git tag -a v1.0 -m "Release 1.0"',
        t(
          "태그는 자동 이동하는 브랜치가 아닙니다.",
          "Tags do not advance like branches.",
          "タグはブランチのように自動で進みません。",
        ),
      ),
    ],
    show: [
      o(
        "--stat",
        t(
          "파일별 변경 통계 표시",
          "Show per-file change statistics",
          "ファイル別変更統計を表示",
        ),
        "git show --stat HEAD",
        t(
          "세부 검토에는 전체 패치를 확인하세요.",
          "Read the full patch for detailed review.",
          "詳細レビューには完全な差分を確認します。",
        ),
      ),
    ],
    revert: [
      o(
        "--no-commit",
        t(
          "반대 변경을 적용하되 커밋하지 않음",
          "Apply inverse changes without committing",
          "逆変更を適用しコミットしない",
        ),
        "git revert --no-commit HEAD",
        t(
          "변경을 확인하고 별도로 commit해야 기록됩니다.",
          "Review and commit separately to record the undo.",
          "確認して別途commitすると取消が記録されます。",
        ),
      ),
    ],
    reset: [
      o(
        "--soft",
        t("HEAD만 이동", "Move HEAD only", "HEADだけ移動"),
        "git reset --soft HEAD~1",
        t(
          "공유한 커밋을 협의 없이 재작성하지 마세요.",
          "Do not rewrite shared commits without coordination.",
          "共有コミットを相談なく書き換えないでください。",
        ),
      ),
      o(
        "--mixed",
        t(
          "HEAD와 스테이지 초기화, 작업 파일 유지",
          "Reset HEAD and index, preserve working files",
          "HEADとステージを戻し作業ファイルを維持",
        ),
        "git reset --mixed HEAD~1",
        t(
          "스테이징 선택은 사라집니다. 기본 모드입니다.",
          "Staging selections are lost; this is the default mode.",
          "ステージの選択は失われます。既定モードです。",
        ),
      ),
      o(
        "--hard",
        t(
          "HEAD·스테이지·작업 파일 일치",
          "Reset HEAD, index, and working files",
          "HEAD・ステージ・作業ファイルを一致",
        ),
        "git reset --hard HEAD",
        t(
          "미커밋 변경을 삭제하며 방해되는 미추적 경로도 덮어쓸 수 있습니다.",
          "Deletes uncommitted changes and may overwrite obstructing untracked paths.",
          "未コミット変更を削除し、妨げる未追跡パスも上書きし得ます。",
        ),
      ),
    ],
    rebase: [
      o(
        "--continue",
        t(
          "충돌 해결 후 재적용 계속",
          "Continue after resolving conflicts",
          "競合解決後に再適用を続行",
        ),
        "git rebase --continue",
        t(
          "먼저 충돌 파일을 수정하고 add하세요.",
          "Resolve and add conflicted files first.",
          "先に競合ファイルを修正してaddします。",
        ),
      ),
      o(
        "--abort",
        t(
          "시작 전 상태로 돌아가며 중단",
          "Abort and return to the original branch state",
          "中止し開始前の状態へ戻る",
        ),
        "git rebase --abort",
        t(
          "진행 중 직접 수정한 내용을 잃을 수 있습니다.",
          "Manual edits made during the rebase may be lost.",
          "rebase中の手動編集が失われる場合があります。",
        ),
      ),
    ],
    "cherry-pick": [
      o(
        "-x",
        t(
          "메시지에 원본 커밋 출처 기록",
          "Record the source commit in the message",
          "メッセージに元コミットを記録",
        ),
        "git cherry-pick -x fix/login",
        t(
          "공개 브랜치 간 수정 이식에 유용하며 충돌을 예방하지는 않습니다.",
          "Useful for public backports; it does not prevent conflicts.",
          "公開ブランチ間の移植に便利ですが競合は防ぎません。",
        ),
      ),
    ],
    reflog: [
      o(
        "--date=iso",
        t(
          "기록 시간을 읽기 쉬운 형식으로 표시",
          "Show timestamps in a readable ISO format",
          "時刻を読みやすいISO形式で表示",
        ),
        "git reflog --date=iso",
        t(
          "원격 사용자의 reflog는 가져오지 않습니다.",
          "This does not fetch another user’s reflog.",
          "他のユーザーのreflogは取得しません。",
        ),
      ),
    ],
    bisect: [
      o(
        "reset",
        t(
          "탐색 종료 후 원래 위치 복귀",
          "End the search and return to the original position",
          "探索終了後に元の位置へ戻る",
        ),
        "git bisect reset",
        t(
          "원인을 찾은 뒤에도 명시적으로 종료하세요.",
          "Explicitly finish even after finding the cause.",
          "原因発見後も明示的に終了してください。",
        ),
      ),
    ],
    worktree: [
      o(
        "-b <branch>",
        t(
          "새 브랜치로 작업 폴더 추가",
          "Add a worktree with a new branch",
          "新ブランチで作業フォルダを追加",
        ),
        "git worktree add -b hotfix ../project-hotfix main",
        t(
          "이미 있는 브랜치 이름에는 -b를 쓰지 않습니다.",
          "Do not use -b for an existing branch name.",
          "既存ブランチ名には-bを使いません。",
        ),
      ),
    ],
    clean: [
      o(
        "-n, --dry-run",
        t(
          "삭제할 항목만 표시",
          "Only preview what would be removed",
          "削除予定項目だけ表示",
        ),
        "git clean -nd",
        t(
          "미리 확인 뒤에도 중요한 파일은 별도 백업하세요.",
          "Back up important files even after previewing.",
          "確認後も重要なファイルは別途保管します。",
        ),
      ),
      o(
        "-f -d",
        t(
          "미추적 파일과 디렉터리 삭제",
          "Delete untracked files and directories",
          "未追跡ファイルとディレクトリを削除",
        ),
        "git clean -fd",
        t(
          "Git으로 복구할 수 없는 데이터가 삭제될 수 있습니다. -x는 ignored도 지웁니다.",
          "This can delete data Git cannot recover. -x also removes ignored files.",
          "Gitで復旧できないデータを削除し得ます。-xはignoredも消します。",
        ),
      ),
    ],
  };
