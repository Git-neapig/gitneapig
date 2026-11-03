import type { LocalizedText } from "@gitneapig/shared";

// Public operating values only; replace the team contact before release.
export const privacyOperatingValues = {
  operatorName: "GitneaPig Team",
  contactEmail: "privacy@PLACEHOLDER",
  updatedAt: "2026-09-09",
  retention: {
    accountAndProfile: {
      ko: "계정 및 프로필 정보: 계정이 활성 상태인 동안 보관합니다.",
      en: "Account and profile data: retained while the account is active.",
      ja: "アカウントとプロフィール情報：アカウントが有効な間保管します。",
    } satisfies LocalizedText,
    relatedUserData: {
      ko: "학습 진도, 업적, 북마크, 친구 관계 및 관련 사용자 정보: 계정이 활성 상태인 동안 보관합니다.",
      en: "Progress, achievements, bookmarks, friendships and related user data: retained while the account is active.",
      ja: "学習進捗、実績、ブックマーク、友達関係および関連ユーザー情報：アカウントが有効な間保管します。",
    } satisfies LocalizedText,
    uploadedAvatars: {
      ko: "업로드한 아바타 파일: 계정이 활성 상태인 동안 또는 교체·삭제될 때까지 보관합니다.",
      en: "Uploaded avatar files: retained while the account is active or until replaced or deleted.",
      ja: "アップロードしたアバターファイル：アカウントが有効な間、または交換・削除されるまで保管します。",
    } satisfies LocalizedText,
    apiKeyMetadata: {
      ko: "API 키 메타데이터: 사용자 계정의 수명 주기와 키 폐기 상태에 따라 보관합니다.",
      en: "API key metadata: retained according to the user's account lifecycle and revocation state.",
      ja: "APIキーのメタデータ：ユーザーアカウントのライフサイクルとキーの無効化状態に従って保管します。",
    } satisfies LocalizedText,
    confirmedAccountDeletionDays: 30,
    operationalLogMaxDays: 30,
  },
};

export function privacyContactHref(
  email: string = privacyOperatingValues.contactEmail,
): string | undefined {
  if (
    /placeholder/i.test(email) ||
    !/^[^\s@:?]+@[^\s@:?]+\.[^\s@:?]+$/.test(email)
  )
    return undefined;
  return `mailto:${email}`;
}
