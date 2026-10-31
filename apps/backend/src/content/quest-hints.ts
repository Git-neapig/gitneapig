import type { LocalizedText, QuestDefinition } from "@gitneapig/shared";
import { t } from "./lessons";

const hint = (
  ko: string,
  en: string,
  ja: string,
  commands: string,
): [LocalizedText, LocalizedText] => [
  t(ko, en, ja),
  t(
    `풀이 예시:\n${commands}`,
    `Sample solution:\n${commands}`,
    `解法の例：\n${commands}`,
  ),
];
const close = [
  t(
    "Git 작업과 이슈 관리는 별개입니다. 완료한 작업을 팀에 표시하세요.",
    "Git history and issue tracking are separate. Mark your finished work for the team.",
    "Git履歴とIssue管理は別です。完了した作業をチームに示しましょう。",
  ),
  t(
    "목표 영역의 ‘이슈 완료’를 선택하세요. Git 명령을 실행하는 단계가 아닙니다.",
    "Select Close issue in the objectives area. This step is not a Git command.",
    "目標欄の「Issueを完了」を選択してください。Gitコマンドではありません。",
  ),
] satisfies [LocalizedText, LocalizedText];
const hints: Record<string, Record<string, [LocalizedText, LocalizedText]>> = {
  "quest-1": {
    inspect: hint(
      "변경하기 전에 현재 브랜치와 파일 상태를 확인하세요.",
      "Inspect the current branch and files before changing them.",
      "変更前に現在のブランチとファイルを確認しましょう。",
      "git status",
    ),
    branch: hint(
      "브랜치를 만드는 것과 이동하는 것은 다릅니다. 생성과 이동을 함께 할 수도 있습니다.",
      "Creating and switching branches are different operations; they can also be combined.",
      "作成と切り替えは別操作ですが、一度に行うこともできます。",
      "git switch -c feature/login",
    ),
    record: hint(
      "팀원이 전달한 login.txt를 선택한 뒤 요청받은 메시지로 기록하세요.",
      "Stage the delivered login.txt and record the requested message.",
      "届いたlogin.txtをステージし、指定のメッセージで記録しましょう。",
      'git add login.txt\ngit commit -m "Add login draft"',
    ),
  },
  "quest-2": {
    stage: hint(
      "완성된 문서만 선택하세요. add에 특정 파일 이름을 지정할 수 있습니다.",
      "Select only the finished document by giving add a specific file name.",
      "addにファイル名を指定し、完成した文書だけを選びましょう。",
      "git add README.md",
    ),
    compare: hint(
      "일반 diff는 미선택 변경, --staged는 다음 커밋에 담을 변경을 보여줍니다.",
      "Plain diff shows unstaged changes; --staged shows the next commit's changes.",
      "通常のdiffは未ステージの変更、--stagedは次のコミットの変更を表示します。",
      "git diff --staged",
    ),
    record: hint(
      "스테이징한 README를 커밋합니다. notes.txt는 포함하지 마세요.",
      "Commit the staged README without including notes.txt.",
      "notes.txtを含めず、ステージ済みのREADMEをコミットします。",
      'git commit -m "Improve team docs"',
    ),
  },
  "quest-3": {
    push: hint(
      "로컬 브랜치를 origin에 공유하세요. -u로 추적 관계를 함께 설정할 수 있습니다.",
      "Publish the local branch to origin; -u also configures its upstream.",
      "ローカルブランチをoriginに共有します。-uで追跡先も設定できます。",
      "git push -u origin feature/login",
    ),
    pr: [
      t(
        "브랜치가 공유되었으므로 팀이 변경을 검토할 수 있습니다.",
        "The shared branch is now ready for team review.",
        "共有したブランチをチームがレビューできます。",
      ),
      t(
        "목표 영역에서 ‘PR 열기’를 선택하세요. feature/login에서 main으로 보내는 요청입니다.",
        "Select Open PR in the objectives area, from feature/login to main.",
        "目標欄で「PRを開く」を選択します。feature/loginからmainへのリクエストです。",
      ),
    ],
    review: [
      t(
        "Sage의 팀 메시지를 읽고 리뷰를 확인 처리하세요.",
        "Read Sage's team message and acknowledge the review.",
        "Sageのメッセージを読み、レビューを確認しましょう。",
      ),
      t(
        "목표 영역에서 ‘리뷰 확인’을 선택하세요. 확인 처리가 완료돼야 다음 목표로 진행합니다.",
        "Select Acknowledge review in the objectives area to proceed.",
        "目標欄で「レビュー確認」を選択し、次の目標へ進みます。",
      ),
    ],
  },
  "quest-4": {
    fetch: hint(
      "원격 정보를 가져오는 것만으로 작업 파일이 바뀌지는 않습니다.",
      "Fetching remote information does not change your working files.",
      "リモート情報の取得だけでは作業ファイルは変わりません。",
      "git fetch origin",
    ),
    merge: hint(
      "fetch 후 origin/main의 이력을 현재 main에 합치세요. pull도 가져오기와 병합을 수행합니다.",
      "Merge fetched origin/main into main. Pull can also fetch and merge.",
      "取得したorigin/mainをmainに統合します。pullでも取得と統合ができます。",
      "git merge origin/main",
    ),
    share: hint(
      "두 이력을 통합한 결과를 원격 main에 공유하세요.",
      "Publish the integrated histories to remote main.",
      "統合した履歴をリモートmainに共有しましょう。",
      "git push origin main",
    ),
  },
  "quest-5": {
    merge: hint(
      "main에서 feature/login을 병합하면 같은 줄의 충돌을 확인할 수 있습니다.",
      "Merge feature/login while on main to expose the conflicting line.",
      "mainでfeature/loginをマージし、同じ行の競合を確認します。",
      "git switch main\ngit merge feature/login",
    ),
    resolve: [
      t(
        "상태의 파일 편집기에서 양쪽 의도를 읽고 최종 내용을 남기세요. 충돌 표시를 모두 제거해야 합니다.",
        "Read both intentions in the State file editor. Keep final content and remove every conflict marker.",
        "状態のエディターで両方の意図を読み、最終内容を残して競合マーカーをすべて除きます。",
      ),
      t(
        "상태 → app.txt 편집에서 예를 들어 아래 내용을 저장한 뒤 stage하세요. 다른 적절한 제목도 가능합니다.\ntitle=GitneaPig Team Login\nstatus=ready\n\ngit add app.txt",
        "In State, edit app.txt and save the following example, then stage it. Other appropriate titles are valid.\ntitle=GitneaPig Team Login\nstatus=ready\n\ngit add app.txt",
        "状態でapp.txtを編集し、次の例を保存してステージします。他の適切なタイトルも有効です。\ntitle=GitneaPig Team Login\nstatus=ready\n\ngit add app.txt",
      ),
    ],
    record: hint(
      "해결 내용을 stage했으므로 두 부모를 가진 병합 커밋을 기록할 수 있습니다.",
      "The resolution is staged; record a merge commit with both parents.",
      "解決内容がステージ済みなので、両方の親を持つマージコミットを記録できます。",
      'git commit -m "Resolve title"',
    ),
    publish: hint(
      "충돌 해결 커밋까지 원격에 공유해야 팀이 결과를 볼 수 있습니다.",
      "Publish the resolution commit so the team can see the result.",
      "解決コミットを共有するとチームが結果を確認できます。",
      "git push origin main",
    ),
  },
};

export function attachObjectiveHints(quest: QuestDefinition): void {
  for (const objective of quest.objectives) {
    const detail =
      objective.id === "close" ? close : hints[quest.id]?.[objective.id];
    if (!detail)
      throw new Error(`Missing objective hints: ${quest.id}/${objective.id}`);
    objective.hints = [objective.description, ...detail];
  }
}
