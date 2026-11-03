import { useLocale } from "../lib/i18n";
import { PageHeading } from "../components/feedback";
import {
  privacyContactHref,
  privacyOperatingValues,
} from "../lib/privacy-policy";
const { retention } = privacyOperatingValues;
const operatingCopy = {
  ko: {
    updated: "최종 업데이트",
    operator: "운영자",
    contact: "개인정보 문의",
    requests:
      "개인정보 관련 질문과 정정·계정 삭제 요청은 GitneaPig 전용 팀 이메일로 접수합니다. 계정 삭제는 요청 확인 후 운영자가 처리하며, 현재 앱에는 계정 삭제 버튼이 없습니다.",
    placeholder:
      "임시 연락처: 아직 개설되지 않은 주소이며 현재 문의를 받을 수 없습니다. 정식 운영·배포 및 최종 제출 전에 실제 전용 팀 이메일로 교체해야 합니다. 팀원의 개인 이메일은 사용하지 않습니다.",
    retention: "개인정보 보관 기간",
    deletion: `삭제된 계정 정보: 계정 삭제가 확인된 날부터 ${retention.confirmedAccountDeletionDays}일 이내에 영구 삭제합니다.`,
    logs: `운영·보안 로그: 최대 ${retention.operationalLogMaxDays}일 동안 보관합니다.`,
  },
  en: {
    updated: "Last updated",
    operator: "Operator",
    contact: "Privacy contact",
    requests:
      "Privacy questions and requests to correct data or delete an account go to the dedicated GitneaPig team email. The operator handles account deletion after confirming the request; there is currently no account-deletion button in the app.",
    placeholder:
      "Placeholder contact: this address has not been created and cannot receive requests. Replace it with the real dedicated team email before production deployment and final submission. Do not use a team member's personal email.",
    retention: "Data retention",
    deletion: `Deleted account data: permanently deleted within ${retention.confirmedAccountDeletionDays} days of confirmed account deletion.`,
    logs: `Operational and security logs: retained for up to ${retention.operationalLogMaxDays} days.`,
  },
  ja: {
    updated: "最終更新日",
    operator: "運営者",
    contact: "個人情報の問い合わせ先",
    requests:
      "個人情報に関する質問、訂正・アカウント削除の依頼はGitneaPig専用のチームメールで受け付けます。削除は依頼の確認後に運営者が処理します。現在、アプリにアカウント削除ボタンはありません。",
    placeholder:
      "仮の連絡先：まだ作成されておらず、現在は依頼を受信できません。本番運用・デプロイと最終提出の前に、実際の専用チームメールに置き換えてください。メンバー個人のメールは使用しません。",
    retention: "個人情報の保管期間",
    deletion: `削除されたアカウントの情報：アカウント削除の確認から${retention.confirmedAccountDeletionDays}日以内に完全に削除します。`,
    logs: `運用・セキュリティログ：最大${retention.operationalLogMaxDays}日間保管します。`,
  },
};
const policy = {
  ko: {
    privacy: [
      [
        "수집하는 정보",
        "이메일 가입 시 이메일, 비밀번호의 단방향 해시, 닉네임을 저장합니다. 42 로그인은 42 계정의 고유 식별자로 연결하며, 같은 이메일이라는 이유로 다른 계정과 합치지 않습니다. 선택한 아바타 또는 업로드 이미지, 언어 설정을 저장합니다.",
      ],
      [
        "학습과 협업 기록",
        "Lesson·Quest·Daily 완료 기록, XP, 연속 학습 일자, 업적, 북마크와 친구 관계를 저장합니다. 마지막 인증 활동 시각으로 온라인 상태를 계산합니다. 연습 중인 가상 저장소와 터미널 기록은 기본적으로 브라우저 메모리에만 존재합니다.",
      ],
      [
        "이용 목적과 공개 범위",
        "정보는 로그인, 학습 진도 저장, 프로필 표시와 친구 기능에 사용합니다. 다른 사용자에게는 닉네임, 아바타, 레벨, XP와 온라인 상태만 공개하며 이메일, 비밀번호 해시, 인증 비밀값은 공개하지 않습니다.",
      ],
      [
        "쿠키와 브라우저 저장소",
        "로그인에는 8시간의 HttpOnly 세션 쿠키를 사용합니다. 42 인증 과정에는 10분 상태 쿠키와 15분 온보딩 쿠키를 사용합니다. 언어 설정과 임시 게스트 진도는 브라우저에 보관할 수 있습니다. PWA는 공개 정적 자원과 공개 학습만 캐시하며 개인 API 응답은 공유 캐시에 보관하지 않습니다.",
      ],
      [
        "보안",
        "API 키 원문은 생성 시에만 표시하고 서버에는 HMAC 해시를 저장합니다. 폐기한 키는 즉시 인증에서 거절됩니다. 교체된 아바타는 관리 저장소에서 삭제합니다. 서비스 운영에 필요한 계정·학습 정보는 운영 데이터베이스에 보관됩니다.",
      ],
    ],
    terms: [
      [
        "서비스의 목적",
        "GitneaPig는 Git 명령과 협업 과정을 연습하는 교육용 서비스입니다. 가상 저장소는 실제 파일 시스템이나 사용자의 GitHub 저장소를 변경하지 않습니다.",
      ],
      [
        "계정과 책임",
        "사용자는 본인이 사용할 권한이 있는 계정으로 가입하고 인증 정보와 API 키를 안전하게 관리해야 합니다. 다른 사람의 계정 접근, 개인정보 수집, 서비스 방해와 비정상적인 대량 요청은 허용되지 않습니다.",
      ],
      [
        "학습 기록과 보상",
        "게스트 체험 기록은 계정 진도로 자동 이전되지 않습니다. 회원의 완료 기록과 보상은 서버가 관리하며 같은 과제를 반복 완료해도 중복 XP를 지급하지 않습니다. 연습 초기화는 저장된 완료 기록을 삭제하지 않습니다.",
      ],
      [
        "이미지와 콘텐츠",
        "업로드하는 이미지에 대한 사용 권한은 사용자에게 있어야 합니다. 악성 파일이나 타인의 권리를 침해하는 자료를 업로드해서는 안 됩니다. 서비스의 교육 콘텐츠와 승인된 시각 자산은 해당 권리자의 권리를 따릅니다.",
      ],
      [
        "외부 인증과 API",
        "42 로그인은 외부 제공자의 이용 가능 여부와 정책에 영향을 받습니다. Public API는 발급한 API 키의 사용자 범위로 제한되며 키별 요청 제한을 적용합니다. 키를 폐기하면 해당 키의 접근은 중단됩니다.",
      ],
      [
        "제한과 변경",
        `교육용 시뮬레이터는 명시적으로 지원하는 명령과 옵션만 제공합니다. 실제 Git 전체 동작을 대체하지 않습니다. 운영자 ${privacyOperatingValues.operatorName}은 안정성과 보안을 위해 서비스를 수정하거나 점검할 수 있습니다. 개인정보 문의와 보관 기준은 개인정보 처리방침에서 확인할 수 있습니다.`,
      ],
    ],
  },
  en: {
    privacy: [
      [
        "Information collected",
        "Email registration stores your email, a one-way password hash and nickname. 42 sign-in links only by the provider’s unique account identifier, never by matching email alone. We store your selected or uploaded avatar and language preference.",
      ],
      [
        "Learning and collaboration records",
        "We store lesson, quest and daily completions, XP, activity dates, achievements, bookmarks and friendships. Online status derives from the last authenticated activity time. Practice repository state and terminal history normally remain in browser memory.",
      ],
      [
        "Purpose and visibility",
        "Data supports authentication, progress, profiles and friendships. Other users receive only your nickname, avatar, level, XP and online status. Email, password hashes and authentication secrets are not part of public user projections.",
      ],
      [
        "Cookies and browser storage",
        "Authentication uses an eight-hour HttpOnly session cookie. 42 sign-in uses a ten-minute state cookie and a fifteen-minute onboarding cookie. Language and temporary guest progress may be stored in the browser. The PWA caches public assets and public lessons, not private API responses in shared caches.",
      ],
      [
        "Security",
        "Full API keys appear only when created; the server stores HMAC hashes. Revoked keys immediately stop authenticating. Replaced avatars are removed from managed storage. Account and learning records are kept in the operational database.",
      ],
    ],
    terms: [
      [
        "Purpose",
        "GitneaPig is an educational service for practicing Git and collaboration. Its virtual repositories do not modify your actual filesystem or GitHub repositories.",
      ],
      [
        "Accounts and responsibility",
        "Use only accounts you are authorized to access and protect your credentials and API keys. Unauthorized account access, personal-data harvesting, service disruption and abusive request volumes are prohibited.",
      ],
      [
        "Progress and rewards",
        "Guest experience does not automatically become account progress. The server manages member completions and rewards; repeating a completed activity does not award duplicate XP. Resetting a practice attempt does not remove saved completions.",
      ],
      [
        "Images and content",
        "You must have permission to use uploaded images. Do not upload malicious files or material that infringes another person’s rights. Educational content and approved visual assets remain subject to their respective rights.",
      ],
      [
        "External authentication and API",
        "42 sign-in depends on the external provider’s availability and policies. The Public API is scoped to the key owner and enforces per-key request limits. Revoking a key stops its access.",
      ],
      [
        "Limitations and changes",
        `The educational simulator implements only explicitly supported commands and options, not all of real Git. The operator, ${privacyOperatingValues.operatorName}, may maintain or modify the service for stability and security. See the Privacy Policy for privacy contact and retention information.`,
      ],
    ],
  },
  ja: {
    privacy: [
      [
        "収集する情報",
        "メール登録ではメールアドレス、パスワードの一方向ハッシュ、ニックネームを保存します。42ログインは固有のアカウント識別子だけで連携し、メール一致だけでは統合しません。選択またはアップロードしたアバターと言語設定も保存します。",
      ],
      [
        "学習と協力の記録",
        "Lesson・Quest・Dailyの完了、XP、活動日、実績、ブックマーク、友達関係を保存します。オンライン状態は最後の認証済み活動時刻から計算します。練習中のリポジトリとターミナル履歴は通常ブラウザのメモリーにだけ存在します。",
      ],
      [
        "目的と公開範囲",
        "情報は認証、進捗、プロフィールと友達機能に使います。他のユーザーにはニックネーム、アバター、レベル、XP、オンライン状態だけを公開します。メール、パスワードハッシュ、認証秘密情報は公開しません。",
      ],
      [
        "Cookieとブラウザ保存",
        "認証には8時間のHttpOnlyセッションCookieを使用します。42認証では10分の状態Cookieと15分のオンボーディングCookieを使います。言語と一時的なゲスト進捗はブラウザに保存できます。PWAは公開資源と公開レッスンをキャッシュし、個人API応答は共有キャッシュに保存しません。",
      ],
      [
        "セキュリティ",
        "APIキー全体は作成時だけ表示し、サーバーにはHMACハッシュを保存します。無効化したキーは直ちに認証できなくなります。交換したアバターは管理保存領域から削除します。アカウントと学習情報は運用データベースに保管します。",
      ],
    ],
    terms: [
      [
        "目的",
        "GitneaPigはGitと協力作業を練習する教育サービスです。仮想リポジトリは実際のファイルシステムやGitHubリポジトリを変更しません。",
      ],
      [
        "アカウントと責任",
        "アクセス権のあるアカウントだけを使い、認証情報とAPIキーを安全に管理してください。不正アクセス、個人情報収集、サービス妨害、不正な大量リクエストを禁止します。",
      ],
      [
        "進捗と報酬",
        "ゲストの体験は自動でアカウント進捗に移行しません。会員の完了と報酬はサーバーが管理し、完了済み課題の繰り返しでXPを重複付与しません。練習のリセットは保存済み完了を削除しません。",
      ],
      [
        "画像とコンテンツ",
        "アップロード画像の使用権を持っている必要があります。悪意あるファイルや他者の権利を侵害する資料をアップロードしないでください。教育内容と承認済み視覚資産は各権利者の権利に従います。",
      ],
      [
        "外部認証とAPI",
        "42ログインは外部提供者の稼働状況と方針に依存します。Public APIはキー所有者の範囲に限定し、キーごとのリクエスト制限を適用します。キーを無効化するとアクセスは停止します。",
      ],
      [
        "制限と変更",
        `教育シミュレーターは明示的に対応するコマンドとオプションだけを実装し、実際のGit全体を代替しません。運営者の${privacyOperatingValues.operatorName}は安定性と安全性のためサービスを変更・保守できます。個人情報の問い合わせ先と保管方針はプライバシーポリシーをご確認ください。`,
      ],
    ],
  },
};
export function PolicyPage({ type }: { type: "privacy" | "terms" }) {
  const { t, language } = useLocale();
  const copy = operatingCopy[language];
  const contactHref = privacyContactHref();
  return (
    <article className="policy-page">
      <PageHeading title={t(type)} />
      {type === "privacy" ? (
        <>
          <p className="muted">
            {copy.updated}:{" "}
            <time dateTime={privacyOperatingValues.updatedAt}>
              {privacyOperatingValues.updatedAt}
            </time>
          </p>
          <section>
            <h2>{copy.operator}</h2>
            <p>{privacyOperatingValues.operatorName}</p>
            <h2>{copy.contact}</h2>
            <p>
              {contactHref ? (
                <a href={contactHref}>{privacyOperatingValues.contactEmail}</a>
              ) : (
                <span>{privacyOperatingValues.contactEmail}</span>
              )}
            </p>
            {!contactHref ? <p>{copy.placeholder}</p> : null}
            <p>{copy.requests}</p>
          </section>
        </>
      ) : null}
      {policy[language][type].map(([title, body]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{body}</p>
        </section>
      ))}
      {type === "privacy" ? (
        <section>
          <h2>{copy.retention}</h2>
          <ul>
            {[
              retention.accountAndProfile[language],
              retention.relatedUserData[language],
              retention.uploadedAvatars[language],
              retention.apiKeyMetadata[language],
              copy.deletion,
              copy.logs,
            ].map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
