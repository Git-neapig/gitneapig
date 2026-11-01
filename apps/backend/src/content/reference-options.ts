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
export const referenceOptions: Partial<Record<ReferenceCommandKey, ReferenceOption[]>> =
  {
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
  };
