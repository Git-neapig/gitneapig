import {
  commandRegistry,
  referenceDifficulty,
  type CommandKey,
  type CommandReferenceDefinition,
  type LocalizedText,
} from "@gitneapig/shared";
import { t } from "./lessons";
import { extraReferences } from "./reference-extra";
import { referenceExamples } from "./reference-examples";
const details: Record<
  CommandKey,
  {
    when: LocalizedText;
    mistake: LocalizedText;
    lesson: number;
    related: CommandKey[];
  }
> = {
  status: {
    when: t(
      "작업을 시작하거나 명령 실행 후 현재 브랜치, 스테이징, 미추적 파일을 점검할 때 사용합니다.",
      "Use before or after a change to inspect the branch, staged changes, and untracked files.",
      "作業の前後にブランチ、ステージ済みの変更、未追跡ファイルを確認するときに使います。",
    ),
    mistake: t(
      "status는 변경 내용을 저장하거나 스테이징하지 않습니다.",
      "Status neither saves nor stages changes.",
      "statusは変更の保存もステージも行いません。",
    ),
    lesson: 1,
    related: ["diff", "add", "log"],
  },
  add: {
    when: t(
      "현재 파일 내용을 다음 커밋의 스냅샷에 포함하려고 할 때 사용합니다. 특정 파일이나 디렉터리를 선택할 수 있습니다.",
      "Use to include current file content in the next snapshot. Select a specific file or directory.",
      "現在のファイル内容を次のスナップショットに含めるときに使います。ファイルやディレクトリを選べます。",
    ),
    mistake: t(
      "add 이후 편집한 내용은 다시 add하지 않으면 커밋에 포함되지 않습니다. add .은 불필요한 파일도 선택할 수 있습니다.",
      "Edits after add are not staged automatically. add . may include unwanted files.",
      "add後の編集は自動でステージされません。add .は不要なファイルも含む場合があります。",
    ),
    lesson: 2,
    related: ["status", "diff", "commit"],
  },
  commit: {
    when: t(
      "스테이징된 관련 변경을 설명 가능한 하나의 이력으로 남길 때 사용합니다.",
      "Use to record a coherent set of staged changes as one explainable point in history.",
      "関連するステージ済み変更を、説明できる1つの履歴として記録するときに使います。",
    ),
    mistake: t(
      "commit은 작업 폴더 전체가 아니라 스테이징된 내용을 기록하며 원격에 자동 전송하지 않습니다.",
      "Commit records staged content, not all working edits, and does not automatically push.",
      "commitは作業内容全体ではなくステージを記録し、自動でpushはしません。",
    ),
    lesson: 2,
    related: ["add", "diff", "log", "push"],
  },
  log: {
    when: t(
      "현재 브랜치에서 이어지는 커밋 메시지와 부모 관계를 확인할 때 사용합니다.",
      "Use to inspect commit messages and parent relationships reachable from the current branch.",
      "現在のブランチからたどれるメッセージと親の関係を確認するときに使います。",
    ),
    mistake: t(
      "다른 브랜치의 독립된 커밋은 현재 브랜치의 log에 나타나지 않을 수 있습니다.",
      "Independent commits on other branches may not appear in the current branch log.",
      "他のブランチの独立したコミットは現在のlogに表示されない場合があります。",
    ),
    lesson: 1,
    related: ["branch", "status", "merge"],
  },
  diff: {
    when: t(
      "커밋 전 변경을 검토할 때 사용합니다. 기본은 스테이징과 작업 폴더, --staged는 HEAD와 스테이징을 비교합니다.",
      "Use to review changes before committing. Default compares index to working files; --staged compares HEAD to index.",
      "コミット前の確認に使います。既定ではステージと作業ファイル、--stagedではHEADとステージを比較します。",
    ),
    mistake: t(
      "기본 diff는 미추적 파일을 표시하지 않습니다. 빈 결과가 곧 모든 변경의 부재는 아닙니다.",
      "Default diff omits untracked files. Empty output does not mean there are no changes anywhere.",
      "既定のdiffは未追跡ファイルを表示しません。空の結果が変更なしを意味するとは限りません。",
    ),
    lesson: 2,
    related: ["status", "add", "commit"],
  },
  branch: {
    when: t(
      "독립된 작업 이름을 만들거나 로컬 브랜치를 조회·삭제할 때 사용합니다.",
      "Use to name independent work or list and delete local branches.",
      "独立した作業の名前を作り、ローカルブランチを一覧表示・削除するときに使います。",
    ),
    mistake: t(
      "브랜치를 만드는 것만으로 현재 브랜치가 바뀌지 않습니다. 현재 브랜치나 병합되지 않은 브랜치는 -d로 삭제할 수 없습니다.",
      "Creating a branch does not switch to it. -d refuses the current or an unmerged branch.",
      "作成だけでは切り替わりません。現在のブランチや未マージのブランチは-dで削除できません。",
    ),
    lesson: 3,
    related: ["switch", "checkout", "merge"],
  },
  switch: {
    when: t(
      "작업할 브랜치를 선택할 때 사용합니다. -c를 붙이면 현재 커밋에서 새 브랜치를 만들고 이동합니다.",
      "Use to select a working branch. -c creates a new branch at the current commit and switches to it.",
      "作業ブランチの選択に使います。-cは現在のコミットで新しく作成して切り替えます。",
    ),
    mistake: t(
      "이동으로 미커밋 변경이 덮어써질 경우 거절됩니다. 먼저 현재 작업을 커밋하세요.",
      "Switching is rejected if it would overwrite uncommitted changes. Commit the work first.",
      "未コミットの変更を上書きする切り替えは拒否されます。先に作業をコミットしましょう。",
    ),
    lesson: 3,
    related: ["branch", "checkout", "status"],
  },
  checkout: {
    when: t(
      "기존 Git 문서의 브랜치 전환 구문을 읽거나 사용할 때 활용합니다. 이 시뮬레이터에서는 브랜치 전환과 -b 생성만 지원합니다.",
      "Use the older branch-switching syntax. This simulator supports switching branches and creating them with -b.",
      "従来のブランチ切り替え構文です。このシミュレーターでは切り替えと-bによる作成に対応します。",
    ),
    mistake: t(
      "실제 Git의 파일 복원·detached HEAD 등 다른 checkout 기능은 이 시뮬레이터의 지원 범위가 아닙니다.",
      "Other real-Git checkout features, such as file restoration and detached HEAD, are outside this simulator.",
      "実際のGitのファイル復元やdetached HEADなど、他のcheckout機能は対応範囲外です。",
    ),
    lesson: 3,
    related: ["switch", "branch"],
  },
  merge: {
    when: t(
      "다른 브랜치의 완료된 이력을 현재 브랜치로 통합할 때 사용합니다. 상대 브랜치를 삭제하지는 않습니다.",
      "Use to integrate another branch into the current one. It does not delete the source branch.",
      "別のブランチの履歴を現在のブランチに統合します。統合元のブランチは削除しません。",
    ),
    mistake: t(
      "목적지 브랜치에서 실행해야 합니다. 충돌이 발생하면 파일을 해결·스테이징·커밋하기 전까지 병합이 끝나지 않습니다.",
      "Run from the destination branch. A conflict requires resolution, staging, and committing before the merge is finished.",
      "統合先で実行します。競合時は修正・ステージ・コミットが終わるまでマージは完了しません。",
    ),
    lesson: 4,
    related: ["switch", "log", "add", "commit"],
  },
  fetch: {
    when: t(
      "작업 파일을 건드리지 않고 원격의 변경과 추적 포인터를 갱신할 때 사용합니다.",
      "Use to update remote history and tracking pointers without changing working files.",
      "作業ファイルを変えずにリモート履歴と追跡ポインタを更新するときに使います。",
    ),
    mistake: t(
      "fetch 성공만으로 현재 브랜치가 원격과 같아지지 않습니다. 통합하려면 merge나 pull이 필요합니다.",
      "Successful fetch does not make your branch match the remote. Integrate with merge or pull.",
      "fetch成功だけでは現在のブランチはリモートと同じになりません。mergeやpullで統合します。",
    ),
    lesson: 5,
    related: ["pull", "merge", "log"],
  },
  pull: {
    when: t(
      "원격의 변경을 가져오고 현재 브랜치에 통합할 때 사용합니다. 대상 생략 시 upstream을 사용합니다.",
      "Use to fetch and integrate remote changes into the current branch. Without arguments it uses upstream.",
      "リモート変更を取得して現在のブランチに統合します。引数を省略するとupstreamを使います。",
    ),
    mistake: t(
      "pull은 단순 다운로드가 아닙니다. 브랜치 내용이 바뀌며 충돌이 발생할 수 있습니다.",
      "Pull is not just a download. It changes branch content and may create a conflict.",
      "pullは単なるダウンロードではありません。内容を変え、競合が発生することもあります。",
    ),
    lesson: 5,
    related: ["fetch", "merge", "push"],
  },
  push: {
    when: t(
      "로컬 커밋을 원격 브랜치에 전달할 때 사용합니다. -u는 성공 후 해당 로컬 브랜치에 upstream을 설정합니다.",
      "Use to publish local commits. -u sets the local branch upstream after success.",
      "ローカルコミットを共有します。-uは成功後にローカルブランチのupstreamを設定します。",
    ),
    mistake: t(
      "스테이징하지 않은 파일이나 커밋되지 않은 수정은 전송하지 않습니다. 원격이 앞서 있으면 먼저 이력을 통합해야 합니다.",
      "Uncommitted edits and unstaged files are not sent. Integrate first when the remote is ahead.",
      "未コミットの変更や未ステージのファイルは送信されません。リモートが先なら先に統合しましょう。",
    ),
    lesson: 5,
    related: ["commit", "fetch", "pull"],
  },
};
export const references: CommandReferenceDefinition[] = [
  ...commandRegistry.map((core) => {
    const detail = details[core.key];
    return {
      id: `command-${core.key}`,
      key: core.key,
      difficulty: referenceDifficulty(core.key),
      whenToUse: detail.when,
      examples: referenceExamples[core.key],
      commonMistakes: [detail.mistake],
      relatedCommandKeys: detail.related,
      relatedLessonIds: [`lesson-${detail.lesson}`],
      relatedQuestIds:
        detail.lesson >= 4
          ? ["quest-4", "quest-5"]
          : [`quest-${Math.min(3, detail.lesson)}`],
    };
  }),
  ...extraReferences,
];
