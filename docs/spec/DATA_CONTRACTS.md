# GitneaPig — DATA_CONTRACTS.md

> 이 문서는 GitneaPig의 **데이터 구조, API 계약, Simulator 상태 모델, DB 관계, 인증/파일 업로드 규칙, 동시성 규칙**을 정의한다.
>
> `MASTER_SPEC.md`가 사용자 관점의 기능과 화면 동작을 정의한다면,
> 이 문서는 Frontend / Backend / Database / Simulator가 서로 어떤 형태의 데이터를 주고받는지 고정한다.
>
> 구현 시 이 문서는 데이터 구조의 source of truth로 사용한다.
>
> Codex가 구현 선택을 임의로 갈라놓지 않도록, 데이터 계약에 직접 영향을 주는
> storage / cache / transaction / package boundary 같은 구현 제약도 함께 명시한다.
> 단순한 작업 순서나 UI 스타일은 이 문서의 핵심 계약이 아니다.
>
> UI의 시각적 표현은 `DESIGN_SYSTEM.md`에서 정의한다.

---


# 1. Technical Baseline

## 1.1 Language

```text
TypeScript
```

Frontend / Backend / Simulator / Shared package 전체에서 공통 사용한다.

---

## 1.2 Frontend

```text
React
Vite
TypeScript
Tailwind CSS
React Router
i18next
react-i18next
vite-plugin-pwa
```

---

## 1.3 Backend

```text
NestJS 11
TypeScript
Express Adapter
```

기본 구조:

```text
Controller
    ↓
Service
    ↓
Prisma
    ↓
PostgreSQL
```

---

## 1.4 Database / ORM

```text
PostgreSQL
Prisma
```

---

## 1.5 Runtime / Package Manager

```text
Node.js 22
pnpm
```

pnpm workspace를 사용한다.

권장 repository 구조:

```text
gitneapig/
├── apps/
│   ├── frontend/
│   └── backend/
│
├── packages/
│   ├── simulator/
│   └── shared/
│
├── docs/
│   └── spec/
│
├── pnpm-workspace.yaml
└── package.json
```

---

## 1.6 Authentication

```text
JWT
HttpOnly Cookie
Argon2
42 OAuth 2.0
```

---

## 1.7 Infrastructure

```text
Docker Compose
Nginx
HTTPS
Docker Named Volume
```

최종 실행 목표:

```bash
docker compose up --build
```

한 명령으로 전체 서비스가 실행되어야 한다.

---

## 1.8 Testing

```text
Frontend / Simulator
→ Vitest

Backend
→ Jest

E2E
→ Playwright
```

---

# 2. General Data Contract Rules

## 2.1 IDs

모든 application-level ID는 API와 Frontend에서 `string`으로 취급한다.

```ts
export type UserId = string;
export type LessonId = string;
export type QuestId = string;
export type CommandId = string;
export type AchievementId = string;
export type BookmarkId = string;
export type FriendshipId = string;
export type DailyChallengeId = string;
```

Prisma 내부 ID 생성 전략은 구현 시 `cuid()` 또는 UUID 계열을 사용할 수 있으나,
API contract에서는 구체적인 생성 방식을 노출하지 않는다.

---

## 2.2 Timestamp

API timestamp는 ISO 8601 string을 사용한다.

```ts
export type IsoDateTime = string;
```

예:

```text
2026-09-05T13:24:00.000Z
```

DB에서는 `DateTime`으로 저장한다.

---

## 2.3 Language

```ts
export type Language = "ko" | "en" | "ja";
```

---

## 2.4 Localized Text

콘텐츠 seed / domain data에서 다국어 text가 필요한 경우:

```ts
export type LocalizedText = {
  ko: string;
  en: string;
  ja: string;
};
```

UI label은 i18next resource에서 관리한다.

Lesson / Quest / Reference / Daily Challenge처럼 content 자체가 다국어인 domain data는
PostgreSQL JSONB (`Prisma.Json`)의 `LocalizedText` 구조로 저장한다.

Frontend가 특정 언어로 렌더링할 때
필요한 locale의 text를 선택한다.

---

## 2.5 Difficulty

```ts
export type Difficulty =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED";
```

---

## 2.6 Generic Progress State

```ts
export type ContentProgressStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "CURRENT"
  | "COMPLETED";
```

---

## 2.7 Pagination

공통 query:

```ts
export type PaginationQuery = {
  page?: number;
  pageSize?: number;
};
```

공통 response:

```ts
export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};
```

고정 기본값:

```text
page = 1
pageSize = 20
MAX_PAGE_SIZE = 50
```

Validation:

```text
page >= 1
1 <= pageSize <= 50
```

---

## 2.8 API Error

모든 JSON API error는 공통 구조를 따른다.

```ts
export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, unknown>;
  };
};
```

예:

```json
{
  "error": {
    "code": "NICKNAME_ALREADY_EXISTS",
    "message": "This nickname is already in use.",
    "field": "nickname"
  }
}
```

내부 stack trace, password hash, OAuth secret, DB error raw message는 응답으로 노출하지 않는다.

---


## 2.9 User Input Normalization

Email:

```text
trim
→ lowercase
→ validate
```

Nickname:

```text
trim
→ display value는 원래 대소문자 유지
→ uniqueness 비교용 normalizedNickname은 lowercase
```

고정 validation:

```text
Email
- maximum 254 characters

Nickname
- 3–20 characters
- leading/trailing whitespace 제거
- normalized value unique

Password
- 8–128 characters
```

DB unique source:

```text
normalizedEmail
normalizedNickname
```

같은 사용자가 대소문자만 바꿔 중복 계정을 만들 수 없어야 한다.

---

# 3. Authentication Contracts

## 3.1 Public User Summary

다른 사용자에게 노출 가능한 최소 사용자 정보:

```ts
export type PublicUserSummary = {
  id: UserId;
  nickname: string;
  avatarUrl: string;
  level: number;
  xp: number;
  onlineStatus?: "ONLINE" | "OFFLINE";
};
```

`email`, `passwordHash`, OAuth 내부 identifier는 포함하지 않는다.

---

## 3.2 Current User

```ts
export type CurrentUser = {
  id: UserId;
  email: string | null;
  nickname: string;
  avatarUrl: string;
  language: Language;
  xp: number;
  level: number;
  streak: number;
  createdAt: IsoDateTime;
};
```

---

## 3.3 Sign Up

Request:

```ts
export type SignUpRequest = {
  email: string;
  password: string;
  nickname: string;
  avatarPresetKey?: string;
};
```

Custom image upload는 일반 signup JSON body와 분리하고,
회원 생성 후 profile avatar upload endpoint를 사용할 수 있다.

Response:

```ts
export type AuthResponse = {
  user: CurrentUser;
};
```

JWT는 response body로 전달하지 않는다.

```text
JWT
→ Set-Cookie
→ HttpOnly
```

---

## 3.4 Login

```ts
export type LoginRequest = {
  email: string;
  password: string;
};
```

Response:

```ts
AuthResponse
```

---

## 3.5 Current Session

```text
GET /api/v1/auth/me
```

Authenticated:

```ts
type GetCurrentUserResponse = {
  user: CurrentUser;
};
```

Guest:

```text
401
```

Frontend는 app bootstrap 시 이 endpoint를 사용해 auth 상태를 결정한다.

---

## 3.6 42 OAuth

OAuth start:

```text
GET /api/v1/auth/42?returnTo=<internal-path>
```

Callback:

```text
GET /api/v1/auth/42/callback
```

Backend가 42 OAuth provider와 통신한다.

Frontend는 OAuth access token을 직접 보관하지 않는다.

### Account Linking Rule

42 OAuth identity는 `oauth42Subject`로만 연결한다.

```text
oauth42Subject exists
→ existing GitneaPig account login

oauth42Subject does not exist
→ new OAuth onboarding
```

42에서 받은 email이 기존 Email/Password 계정과 같더라도
**email만으로 자동 account linking 하지 않는다.**

자동 연결은 account takeover 위험이 있으므로 현재 범위에서 지원하지 않는다.

### returnTo Validation

`returnTo`는 application 내부 relative path만 허용한다.

허용 예:

```text
/reference
/quests/merge-conflict
```

거부 예:

```text
https://evil.example
//evil.example
```

유효하지 않으면 `/`를 사용한다.

---

## 3.7 42 OAuth Onboarding

신규 42 OAuth 사용자에게만 사용한다.

42 callback에서 신규 사용자라고 판단되면 완성되지 않은 `User` row를 먼저 만들지 않는다.

대신 Backend는 short-lived onboarding cookie를 발급한다.

```text
Cookie name: gitneapig_onboarding
Lifetime: 15 minutes
HttpOnly
Secure in production
SameSite=Lax
```

Cookie payload는 최소:

```text
42 subject
issued-at
expiry
```

를 서명된 형태로 포함한다.

Frontend redirect:

```text
/onboarding/profile
```

Onboarding submit:

```text
POST /api/v1/auth/42/onboarding
Content-Type: multipart/form-data
```

Fields:

```text
nickname
avatarPresetKey?   # preset 선택 시
avatar?            # custom image 선택 시
```

`avatarPresetKey`와 `avatar`는 동시에 사용하지 않는다.

둘 다 없으면 default avatar를 사용한다.

성공:

```text
1. onboarding cookie 검증
2. nickname uniqueness 검증
3. 필요 시 avatar 검증/저장
4. User 생성
5. oauth42Subject 연결
6. onboarding cookie 제거
7. normal session cookie 발급
8. returnTo 또는 /
```

Response 자체는 Browser navigation flow이므로 최종적으로 Frontend route로 redirect한다.

---

## 3.8 Logout

```text
POST /api/v1/auth/logout
```

Response:

```text
204 No Content
```

Backend는 auth cookie를 제거한다.

---


## 3.9 Session / JWT Lifetime

Normal session:

```text
JWT access token only
Cookie name: gitneapig_session
Fixed lifetime: 8 hours from issuance
JWT_EXPIRES_IN=8h
```

JWT payload 최소:

```ts
export type SessionJwtPayload = {
  sub: UserId;
  iat: number;
  exp: number;
};
```

만료:

```text
session JWT expired
→ API returns 401 SESSION_EXPIRED
→ Frontend clears current-user state
→ /login?reason=session-expired&returnTo=<safe-current-path>
```

사용자가 다시 Login / 42 OAuth를 완료해야 한다.

Session 만료 시각은 발급 시 고정되며 자동 연장하지 않는다.

Logout은 browser cookie를 제거한다.
Session validity는 JWT expiry를 기준으로 판단한다.

---

## 3.10 OAuth State / Redirect Contract

OAuth state와 returnTo는 Login session JWT와 분리한다.

OAuth 시작 시 Backend는 cryptographically random `state`를 생성하고
short-lived HttpOnly cookie에 저장한다.

```text
Cookie name: gitneapig_oauth_state
Lifetime: 10 minutes
```

Callback:

```text
provider error
state mismatch
state expired
OAuth token exchange failure
42 user fetch failure
```

중 하나가 발생하면:

```text
302 → /login?oauthError=42
```

으로 redirect한다.

Internal log에는 구체적인 error code를 남길 수 있지만,
사용자 query string에 provider token/error detail을 포함하지 않는다.

OAuth 성공 시:

```text
existing user
→ normal session cookie
→ safe returnTo 또는 /

new user
→ onboarding cookie
→ /onboarding/profile
```

---

## 3.11 Cookie / CSRF Security

Production authentication cookie는 최소 다음 속성을 사용한다.

```text
HttpOnly
Secure
SameSite=Lax 또는 더 엄격한 정책
Path=/
```

Frontend와 Backend는 Nginx를 통해 동일 origin으로 서비스하는 것을 기본으로 한다.

Cookie 기반 인증을 사용하므로 state-changing request는
cross-site 요청으로부터 보호되어야 한다.

현재 구현 정책:

```text
SameSite=Lax
내부 API의 unsafe method(POST/PUT/PATCH/DELETE)에 Origin 검증
42 OAuth state parameter 검증
```

Production에서 허용 Origin은 `APP_ORIGIN` 하나로 제한한다.

내부 API의 unsafe request는 Origin이 없거나, `null`이거나, malformed이거나,
허용 origin과 다르면 `403 FORBIDDEN`으로 거부한다.
이 규칙은 login/signup, onboarding, API key 관리 endpoint에도 적용한다.
42 OAuth GET callback은 별도의 OAuth state 검증을 사용한다.

`/api/v1/public/*`는 API key 전용 인증 경계다.
이 경로에는 위 cookie CSRF용 Origin 검증을 적용하지 않는다.
Origin이 없는 외부 프로그램의 요청도 유효한 `X-API-Key`가 있으면 처리한다.
Session/onboarding cookie만으로는 Public API에 접근할 수 없으며,
cookie와 API key가 함께 있더라도 소유자는 API key로만 결정한다.
이 예외는 cross-origin browser 접근을 허용하는 CORS 설정을 의미하지 않는다.

현재 초기 구현에서는 별도 CSRF token을 추가하지 않는다.
보안 구조가 변경되어 cross-site cookie 사용이 필요해질 경우에만
CSRF token 도입을 별도 설계 변경으로 처리한다.

---

# 4. Avatar Contracts

## 4.1 Avatar Sources

사용자는 다음 세 방식 중 하나를 사용할 수 있다.

```ts
export type AvatarSource =
  | "DEFAULT"
  | "PRESET"
  | "UPLOAD";
```

---

## 4.2 User Avatar State

```ts
export type UserAvatar = {
  source: AvatarSource;
  presetKey: string | null;
  customPath: string | null;
  publicUrl: string;
};
```

DB에는 binary image 자체를 저장하지 않는다.

---

## 4.3 Custom Avatar Upload

Endpoint:

```text
POST /api/v1/profile/avatar
Content-Type: multipart/form-data
```

Form field:

```text
avatar
```

Allowed formats:

```text
image/jpeg
image/png
image/webp
```

Maximum size:

```text
2 MB
AVATAR_MAX_SIZE_MB=2
```

Frontend validation과 Backend validation을 모두 수행한다.

Backend는 MIME type뿐 아니라 실제 upload metadata를 함께 확인한다.

---

## 4.4 Storage

Custom avatar file:

```text
NestJS
→ local managed upload directory
→ Docker named volume
```

예:

```text
/app/uploads/avatars/
```

DB:

```text
User.avatarPath
→ avatars/<generated-file-name>.<validated-extension>
```

실제 file:

```text
Docker named volume
→ avatar_data
```

Nginx 또는 Backend route를 통해 공개 URL을 제공한다.

예:

```text
/uploads/avatars/<file>
```

---

## 4.5 File Naming

사용자가 업로드한 원래 파일명을 그대로 storage key로 사용하지 않는다.

예:

```text
<generated-id>.<validated-extension>
```

또는:

```text
<user-id>-<generated-id>.<validated-extension>
```

Avatar는 검증된 원본 포맷(JPEG/PNG/WebP)을 유지하며
검증된 포맷에 맞는 안전한 확장자를 사용한다.

경로 조작을 방지해야 한다.

---

## 4.6 Avatar Replacement

새 custom avatar upload 성공 시:

```text
1. 새 파일 validation
2. 새 파일 저장
3. DB path update
4. 이전 custom avatar가 존재하면 안전하게 삭제
```

DB update 실패 시 기존 avatar를 유지한다.

새 파일 저장 이후 DB update가 실패하면 새로 저장한 orphan file을 삭제한다.

Preset/default avatar로 변경하는 경우에도 기존 custom file은
DB update 성공 이후 안전하게 삭제한다.

---

# 5. User / Profile Contracts

## 5.1 Profile Response

```ts
export type UserProfileResponse = {
  user: CurrentUser;
  stats: {
    lessonsDone: number;
    questsDone: number;
    totalXp: number;
    streak: number;
  };
  lessonProgress: LessonProgressSummary[];
  recentAchievements: AchievementSummary[];
  recentActivity: ActivityItem[];
};
```

---

## 5.2 Profile Update

```ts
export type UpdateProfileRequest = {
  nickname?: string;
  language?: Language;
  avatarPresetKey?: string;
};
```

Custom avatar file은 multipart endpoint를 별도로 사용한다.

---

## 5.3 Activity

```ts
export type ActivityType =
  | "LESSON_COMPLETED"
  | "QUEST_COMPLETED"
  | "DAILY_CHALLENGE_COMPLETED"
  | "ACHIEVEMENT_UNLOCKED";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: LocalizedText;
  xpDelta?: number;
  occurredAt: IsoDateTime;
  targetPath?: string;
};
```

---


## 5.4 Recent Activity Source

`ActivityItem` 전용 DB table은 만들지 않는다.

Profile의 Recent Activity는 다음 persistent data를 합쳐 최근 순으로 계산한다.

```text
LessonProgress.completedAt
QuestProgress.completedAt
DailyChallengeProgress.completedAt
UserAchievement.unlockedAt
```

Backend가 이 데이터를 union/merge하여 최근 N개를 반환한다.

고정 기본:

```text
RECENT_ACTIVITY_LIMIT = 10
RECENT_ACHIEVEMENT_LIMIT = 3
```

---

# 6. XP / Level Contracts

## 6.1 XP

```ts
export type XpReward = {
  amount: number;
  reason:
    | "LESSON"
    | "QUEST"
    | "DAILY_CHALLENGE"
    | "ACHIEVEMENT";
};
```

---

## 6.2 Level

Level은 **DB에 독립 필드로 저장하지 않고 XP에서 계산하는 derived value**로 고정한다.

`totalXp`는 0 이상의 정수다.
Level은 1부터 시작한다.

현재 Level `L`에서 다음 Level로 올라가는 데 필요한 XP:

```text
XP_REQUIRED_WITHIN_LEVEL(L) = 60 × L
```

Level `L`에 도달하기 위한 누적 XP threshold:

```text
XP_TO_REACH_LEVEL(L) = 30 × L × (L - 1)
```

예:

```text
Level 1 = 0 XP
Level 2 = 60 XP
Level 3 = 180 XP
Level 4 = 360 XP
Level 5 = 600 XP
Level 12 = 3960 XP
Level 13 = 4680 XP
```

`calculateLevel(totalXp)`는 다음을 반환한다.

```ts
export type LevelProgress = {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
};
```

정의:

```text
level
→ XP_TO_REACH_LEVEL(level) <= totalXp를 만족하는 가장 큰 정수 level

currentLevelXp
→ totalXp - XP_TO_REACH_LEVEL(level)

nextLevelXp
→ XP_REQUIRED_WITHIN_LEVEL(level)
→ 현재 Level에서 다음 Level까지 필요한 전체 XP

progressPercent
→ floor(currentLevelXp / nextLevelXp × 100)
→ 0 이상 99 이하
```

공통 구현:

```ts
calculateLevel(totalXp: number): LevelProgress
```

Frontend와 Backend는 `packages/shared`의 동일한 level domain function을 사용한다.

API의 `CurrentUser.level`, `PublicUserSummary.level` 등은
현재 `xp`를 기준으로 계산해서 반환한다.

동일한 `totalXp`는 항상 동일한 `LevelProgress`를 만든다.

---


## 6.3 Fixed Reward Values

Lesson reward:

| Lesson | XP |
|---|---:|
| Lesson 1 — Git & Repository | 100 |
| Lesson 2 — Working Directory · Staging · Commit | 140 |
| Lesson 3 — Branch | 180 |
| Lesson 4 — Merge | 220 |
| Lesson 5 — Remote · Fetch · Pull · Push | 260 |

Quest reward:

| Quest | XP |
|---|---:|
| Quest 1 — Feature Branch | 140 |
| Quest 2 — Staging & Commit | 180 |
| Quest 3 — Push & Pull Request | 220 |
| Quest 4 — Remote Ahead | 260 |
| Quest 5 — Merge Conflict | 300 |

Daily Challenge:

```text
모든 active DailyChallengeTemplate의 xpReward = 80
```

Reward source는 seed/definition의 `xpReward`이며
completion request body가 reward 값을 결정하지 않는다.

---

## 6.4 Streak

Streak은 persistent gamification value로 유지하되,
Client가 숫자를 직접 제출하거나 수정하지 않는다.

현재 제품 의미는 **연속적인 qualifying activity day 수**다.

Qualifying activity:

```text
Authenticated Lesson first completion
Authenticated Quest first completion
Authenticated Daily Challenge first completion
```

Backend는 `APP_TIME_ZONE=Asia/Seoul`의 `dateKey`를 기준으로 계산한다.

User model은 다음 source fields를 가진다.

```text
streak
streakLastActivityDateKey?
```

첫 qualifying activity가 발생할 때 reward/completion transaction 안에서:

```text
same date as streakLastActivityDateKey
→ streak unchanged

previous calendar date
→ streak + 1

older gap / no prior activity
→ streak = 1

then
→ streakLastActivityDateKey = today
```

동일 날짜의 여러 completion이 동시에 들어와도 streak가 여러 번 증가하지 않아야 한다.

---

# 7. Lesson Contracts

## 7.1 Lesson Summary

```ts
export type LessonSummary = {
  id: LessonId;
  slug: string;
  order: number;
  title: LocalizedText;
  summary: LocalizedText;
  difficulty: Difficulty;
  guestAccessible: boolean;
  xpReward: number;
};
```

---

## 7.2 Lesson Stages

```ts
export type LessonStageType =
  | "SITUATION"
  | "WHY"
  | "CONCEPT"
  | "COMMAND"
  | "PRACTICE"
  | "RESULT";
```

각 Lesson은 기본적으로 6단계 구조를 따른다.

```ts
export type LessonCommandExample = {
  command: string;
  explanation: LocalizedText;
  example?: string;
  comparisonNote?: LocalizedText;
};

export type LessonStage = {
  type: LessonStageType;
  title: LocalizedText;
  body: LocalizedText;
  visualization?: LessonVisualization;
  guideNote?: LocalizedText;
  commandExamples?: LessonCommandExample[];
};
```

Stage-specific rules:

```text
SITUATION
→ TEAM_CONVERSATION 등을 사용할 수 있음
→ 정답 command를 미리 공개하지 않음

WHY
→ COMPARISON 등을 사용할 수 있음
→ 문제/해결 효과 중심

CONCEPT
→ GIT_GRAPH 등을 사용할 수 있음
→ guideNote로 짧은 보충 설명 가능

COMMAND
→ commandExamples에 실제 syntax/example을 명확히 저장
→ Learn에서는 정답 command를 숨기지 않음

PRACTICE
→ LessonPracticeDefinition 사용
→ commandExamples를 Terminal 기본 답으로 노출하지 않음
```

`commandExamples`는 주로 `COMMAND` stage에서 사용한다.
UI가 임의로 별도 command copy를 하드코딩하지 않는다.

---

## 7.3 Lesson Visualization

```ts
export type LessonVisualization =
  | {
      type: "GIT_GRAPH";
      state: RepositoryState;
    }
  | {
      type: "COMPARISON";
      left: LocalizedText;
      right: LocalizedText;
    }
  | {
      type: "TEAM_CONVERSATION";
      messages: TeamMessage[];
    };
```

---

## 7.4 Lesson Practice

```ts
export type LessonPracticeDefinition = {
  goal: LocalizedText;
  initialState: RepositoryState;
  successConditions: SimulatorCondition[];
  relevantCommandKeys: CommandKey[];
};
```

정답 command string을 직접 저장하지 않는다.

성공은 state/event condition으로 판단한다.

Lesson Practice `Reset`은 새로운 DB mutation이 아니다.

```text
Reset
→ 현재 LessonPracticeDefinition.initialState를 runtime에 다시 적용
→ terminal history/output 초기화
→ temporary success/feedback 초기화
→ persisted LessonProgress / XP는 변경하지 않음
```

Reset은 confirmation 없이 실행한다.

---

## 7.5 Lesson Progress

Lesson은 6단계 고정 순서를 사용한다.

```text
0 Situation
1 Why
2 Concept
3 Command
4 Practice
5 Result
```

Authenticated User의 중간 진행도를 저장한다.

```ts
export type LessonProgressSummary = {
  lessonId: LessonId;
  slug: string;
  highestReachedStageIndex: 0 | 1 | 2 | 3 | 4 | 5;
  completed: boolean;
  progressPercent: number;
  completedAt: IsoDateTime | null;
};
```

`progressPercent`는 DB source field가 아니라 `highestReachedStageIndex`와
`completed`에서 계산한다.

Partial progress request:

```ts
export type UpdateLessonProgressRequest = {
  highestReachedStageIndex: 0 | 1 | 2 | 3 | 4 | 5;
};
```

Rules:

```text
Authenticated User only
monotonic increase only
partial progress 자체는 XP를 지급하지 않음
Lesson complete endpoint만 completed=true / reward 처리
Guest progress는 browser-local temporary state
```

DB에서 사용자별로 저장한다.

---

# 8. Practice Contracts

## 8.1 Playground Key

```ts
export type PlaygroundKey =
  | "FREE"
  | "BASIC"
  | "BRANCH"
  | "MERGE"
  | "REMOTE";
```

---

## 8.2 Playground Definition

```ts
export type PlaygroundDefinition = {
  key: PlaygroundKey;
  title: LocalizedText;
  description: LocalizedText;
  initialState: RepositoryState;
  practiceSuggestions: LocalizedText[];
  recommendedCommandKeys: CommandKey[];
};
```

Rules:

```text
FREE
→ practiceSuggestions may be empty
→ Command Guide = all simulator-supported commands

BASIC / BRANCH / MERGE / REMOTE
→ practiceSuggestions = optional guidance only
→ no successConditions
→ no objective completion percentage
→ no XP
→ Command Guide initial projection = recommendedCommandKeys
```

`recommendedCommandKeys`는 category Playground의 contextual Command Guide 기본 목록이다.
사용자가 `View all supported commands`를 선택한 경우에만 전체 목록으로 확장할 수 있다.

---

## 8.3 Free Sandbox

```text
key
→ FREE
```

Rules:

```text
No required objective
All supported Simulator commands allowed
Full Command Guide available
```

Reference에서:

```text
/practice?mode=free&command=push
```

로 들어온 경우:

```ts
export type PracticeEntryContext = {
  playground: PlaygroundKey;
  highlightedCommandKey?: CommandKey;
};
```

`highlightedCommandKey`는 UI highlight용이며
RepositoryState를 변경하지 않는다.

---

# 9. Command Catalog Contracts

## 9.1 Command Key

```ts
export type CommandKey =
  | "status"
  | "add"
  | "commit"
  | "log"
  | "diff"
  | "branch"
  | "switch"
  | "checkout"
  | "merge"
  | "fetch"
  | "pull"
  | "push";
```

추후 지원 명령 추가 시
Core Catalog / Parser / Practice Guide / Terminal Help / Reference가 함께 갱신되어야 한다.

---

## 9.2 Command Category

```ts
export type CommandCategory =
  | "SETUP"
  | "INSPECT"
  | "STAGE"
  | "COMMIT"
  | "BRANCH"
  | "MERGE"
  | "REMOTE";
```

---

## 9.3 Command Core Definition

Simulator와 Guest-accessible Practice Command Guide에 필요한
**guest-safe 최소 metadata**를 정의한다.

```ts
export type CommandCoreDefinition = {
  key: CommandKey;
  name: string;
  syntax: string[];
  category: CommandCategory;

  shortDescription: LocalizedText;
  shortExample?: CommandExample;

  simulatorSupported: boolean;
};
```

이 데이터는 Simulator parser/registry와 Practice Command Guide에서 사용할 수 있다.

---

## 9.4 Practice Command Guide Projection

Guest를 포함한 Practice 사용자가 볼 수 있는 데이터:

```ts
export type CommandGuideItem = {
  key: CommandKey;
  name: string;
  syntax: string[];
  category: CommandCategory;
  shortDescription: LocalizedText;
  shortExample?: CommandExample;
};
```

Practice의 `Full Command Guide`라는 표현은
**Simulator가 지원하는 전체 command 목록을 볼 수 있다**는 뜻이다.

Reference의 전체 상세 콘텐츠를 Guest에게 공개한다는 뜻이 아니다.

---

## 9.5 Reference Detail Definition

Reference 전용 상세 콘텐츠:

```ts
export type CommandExample = {
  command: string;
  description: LocalizedText;
};

export type CommandReferenceDefinition = {
  id: CommandId;
  key: CommandKey;

  difficulty: Difficulty;
  whenToUse: LocalizedText;
  examples: CommandExample[];
  commonMistakes: LocalizedText[];

  relatedCommandKeys: CommandKey[];
  relatedLessonIds: LessonId[];
  relatedQuestIds: QuestId[];
};
```

Reference Detail 응답은 Core + Reference data를 합쳐 제공한다.

```ts
export type CommandReferenceDetail = {
  core: CommandCoreDefinition;
  reference: CommandReferenceDefinition;
};
```

---

## 9.6 Reference List Item

Reference 검색/목록에서는 상세 페이지 전용의 무거운 field를 내려주지 않는다.

```ts
export type CommandReferenceListItem = {
  id: CommandId;
  key: CommandKey;
  name: string;
  syntax: string[];
  category: CommandCategory;
  difficulty: Difficulty;
  shortDescription: LocalizedText;
  simulatorSupported: boolean;
};
```

목록에서 제외되는 대표 field:

```text
whenToUse
examples
commonMistakes
relatedLessonIds
relatedQuestIds
```

이 field들은 상세 endpoint에서만 `CommandReferenceDetail`로 제공한다.

---

## 9.7 Single Source of Truth Rule

`Single Source of Truth`는 화면별로 metadata를 별도 하드코딩하지 않는다는 뜻이지,
모든 화면에 모든 field를 노출한다는 뜻이 아니다.

```text
Command Core
→ Simulator
→ Practice Command Guide
→ Terminal Help

Command Reference Detail
→ Authenticated Reference only
```

Guest가 Free Sandbox를 사용하는 경우
`CommandGuideItem`만 접근 가능하다.

Authenticated Reference 콘텐츠는 Frontend bundle의 guest-safe static data에
통째로 포함하지 않는다.

---


## 9.8 Command Registry / Reference Storage Boundary

Command identity와 Simulator grammar는 guest-safe code registry가 source of truth다.

```text
packages/shared/src/commands/registry.ts
```

여기에 포함:

```text
CommandKey
name
syntax
category
simulatorSupported
shortDescription
shortExample
parser/option metadata
```

Reference 전용 상세 콘텐츠는 Frontend shared bundle에 포함하지 않는다.

Backend/PostgreSQL의 `CommandReference` model에 저장한다.

```text
difficulty
whenToUse
examples
commonMistakes
relatedCommandKeys
relatedLessonIds
relatedQuestIds
```

Seed 시 `CommandKey`로 Registry와 Reference row를 연결한다.

Invariant:

```text
Every CommandReference.key
→ must exist in Command Registry

Every simulator-supported Registry command
→ can produce CommandGuideItem
```

---

# 10. Simulator Core Contracts

## 10.1 Pure Function

핵심 API:

```ts
export function executeCommand(
  state: RepositoryState,
  command: string
): SimulatorResult;
```

Simulator는 React, DOM, NestJS, Prisma에 의존하지 않는
Pure TypeScript package로 구현한다.

---

## 10.2 Repository State

```ts
export type RepositoryState = {
  currentBranch: string;
  headCommitId: string | null;

  branches: Branch[];
  commits: Commit[];

  workingTree: WorkingFileState[];
  stagingArea: StagedFileState[];

  remotes: RemoteRepository[];
  remoteTrackingBranches: RemoteTrackingBranch[];

  mergeState: MergeState | null;

  nextCommitSequence: number;
};
```

---

## 10.3 Branch

```ts
export type Branch = {
  name: string;
  commitId: string | null;
  upstream: {
    remoteName: string;
    branchName: string;
  } | null;
};
```

`upstream`은 local branch별 추적 설정이다. Remote-tracking branch와는 별개다.
새 local branch는 `upstream: null`로 생성하며, seed도 이 필드를 명시한다.
추적이 설정된 seed는 해당 remote가 존재해야 한다.

고정 remote command 규칙:

- `git push -u <remote> <branch>`는 지정한 local branch를 같은 이름의 remote
  branch로 push한다. 성공한 경우에만 해당 local branch의 upstream을 저장한다.
- `git push <remote> <branch>`도 같은 대상으로 push하되 upstream을 변경하지 않는다.
- 인자 없는 `git push`는 current branch의 upstream에 push한다.
- 인자 없는 `git pull`은 current branch의 upstream을 fetch하고 해당 remote-tracking
  commit을 current branch에 merge한다.
- `git pull <remote> <branch>`는 지정한 remote branch를 current branch에 통합하며,
  기존 upstream을 변경하지 않는다.
- 인자 없는 `git fetch`는 current branch upstream의 remote, 없으면 `origin`을 사용한다.
- 인자 없는 push/pull에서 upstream이 없으면 `NO_UPSTREAM`을 반환한다.
  Remote가 없으면 `REMOTE_NOT_FOUND`, 필요한 local/remote branch가 없으면
  `BRANCH_NOT_FOUND`를 반환한다. Push는 없는 remote branch를 생성할 수 있다.
- Non-fast-forward push는 `NON_FAST_FORWARD`로 거부하며 upstream도 변경하지 않는다.
  위 형식 밖의 refspec/option은 지원을 명시하지 않은 한 `INVALID_ARGUMENT`로 거부한다.

Branch 전환은 각 branch의 upstream을 보존한다. 이름만으로 upstream을 추측하지 않는다.

---

## 10.4 Commit

```ts
export type Commit = {
  id: string;
  message: string;
  parentIds: string[];
  snapshot: Record<string, string>;
};
```

Merge commit은 `parentIds.length === 2`일 수 있다.

Simulator commit ID는 random UUID나 wall-clock timestamp를 사용하지 않는다.

```text
nextCommitSequence = 4
→ next commit id = "c4"
→ nextCommitSequence = 5
```

Seed state는 `c1`, `c2`, `c3`처럼 deterministic ID를 사용할 수 있다.
Remote event가 새 commit을 생성할 때도 동일한 sequence 규칙을 사용한다.

---

## 10.5 Working Tree

```ts
export type WorkingFileStatus =
  | "untracked"
  | "modified"
  | "deleted"
  | "conflicted";

export type WorkingFileState = {
  path: string;
  content: string;
  status: WorkingFileStatus;
};
```

---

## 10.6 Staging Area

```ts
export type StagedFileStatus =
  | "added"
  | "modified"
  | "deleted"
  | "resolved";

export type StagedFileState = {
  path: string;
  content: string;
  status: StagedFileStatus;
};
```

---

### Snapshot Reconstruction / Mutation Rules

`stagingArea`와 `workingTree`는 전체 파일 목록이 아닌 **변경분 배열**이다.
각 배열 안에서 `path`는 유일하며, 없는 항목은 파일 삭제를 의미하지 않는다.

전체 snapshot은 다음 순서로 복원한다.

```text
H = HEAD commit snapshot (unborn HEAD이면 {})
I = H에 stagingArea 변경분을 적용한 전체 index snapshot
W = I에 workingTree 변경분을 적용한 전체 working snapshot
```

- `stagingArea`에 없는 path는 H의 내용을 상속한다.
- `workingTree`에 없는 path는 I의 내용을 상속한다.
- `deleted`는 path 제거를 뜻하며 `content`는 빈 문자열로 고정하고 복원 시 무시한다.
- 그 외 상태는 `content`를 해당 path의 전체 파일 내용으로 적용한다.
- Staged `added`/`modified`는 H 대비 상태다. `resolved`는 merge conflict를
  해결하고 stage한 파일이며, snapshot 적용 방식은 added/modified와 같다.
- Working `untracked`는 I에 없는 파일, `modified`는 I와 내용이 다른 파일이다.
  `conflicted`는 아직 해결되지 않은 merge 파일을 나타낸다.

Mutation은 복원된 snapshot을 기준으로 처리한 뒤 변경분을 다시 계산한다.

- `git add <path>`는 현재 W의 해당 파일 내용 또는 삭제를 I에 반영한다.
  W의 실제 내용은 유지하며, stagingArea는 H 대비, workingTree는 새 I 대비로 재계산한다.
- Stage 후 파일을 다시 편집하면 staged 내용은 유지하고 workingTree에 새 변경분을 만든다.
- Commit은 I 전체를 snapshot으로 저장하므로 stage하지 않은 기존 파일도 보존한다.
  새 HEAD 기준으로 stagingArea를 비우고, 기존 W와 새 HEAD의 차이를 workingTree로 유지한다.
- 해결되지 않은 conflict가 있으면 commit을 거부한다. 해결 표시는 mergeState와
  함께 관리하며 snapshot 재계산만으로 conflict가 해결된 것으로 간주하지 않는다.
- UI의 파일 편집, 삭제, conflict 해결도 같은 복원 규칙을 사용하는 simulator domain
  function을 거친다.

필수 예시:

```text
HEAD: a.txt=A0, b.txt=B0
working edit: a.txt=A1
git add a.txt
working edit: a.txt=A2
git commit -m "update a"

new HEAD: a.txt=A1, b.txt=B0
stagingArea: []
workingTree: a.txt=A2 (modified)
```

---

## 10.7 Remote Repository

```ts
export type RemoteRepository = {
  name: string;
  branches: RemoteBranch[];
  commits: Commit[];
};

export type RemoteBranch = {
  name: string;
  commitId: string | null;
};
```

---

## 10.8 Remote-tracking Branch

```ts
export type RemoteTrackingBranch = {
  remoteName: string;
  branchName: string;
  commitId: string | null;
};
```

예:

```text
origin/main
origin/feature/login
```

---

## 10.9 Merge State

```ts
export type MergeState = {
  sourceBranch: string;
  targetBranch: string;
  conflictedPaths: string[];
};
```

Conflict가 해결되기 전까지 merge 완료로 판단하지 않는다.

---

# 11. Simulator Parsing Contracts

## 11.1 Parsed Command

```ts
export type ParsedCommand = {
  key: CommandKey | "help";
  args: string[];
  options: Record<string, string | boolean>;
  raw: string;
};
```

Parser는 raw string에서 normalized key / args / options를 생성한다.

---

## 11.2 Supported Help

최소:

```text
help
git help
git --help
git help <command>
```

Command Catalog를 사용해 help text를 구성한다.

---

# 12. Simulator Result Contracts

## 12.1 Result

```ts
export type SimulatorResult = {
  success: boolean;
  nextState: RepositoryState;
  output: string;
  errorCode?: SimulatorErrorCode;
  events: SimulatorEvent[];
};
```

---

## 12.2 Error Code

예:

```ts
export type SimulatorErrorCode =
  | "UNKNOWN_COMMAND"
  | "INVALID_ARGUMENT"
  | "BRANCH_NOT_FOUND"
  | "BRANCH_ALREADY_EXISTS"
  | "NOTHING_TO_COMMIT"
  | "NOTHING_STAGED"
  | "MERGE_CONFLICT"
  | "MERGE_IN_PROGRESS"
  | "REMOTE_NOT_FOUND"
  | "NON_FAST_FORWARD"
  | "NO_UPSTREAM"
  | "INVALID_STATE";
```

---

## 12.3 Simulator Event

```ts
export type SimulatorEvent =
  | {
      type: "COMMAND_EXECUTED";
      commandKey: CommandKey;
    }
  | {
      type: "BRANCH_CREATED";
      branchName: string;
    }
  | {
      type: "BRANCH_SWITCHED";
      branchName: string;
    }
  | {
      type: "COMMIT_CREATED";
      commitId: string;
      message: string;
    }
  | {
      type: "MERGE_STARTED";
      sourceBranch: string;
      targetBranch: string;
    }
  | {
      type: "MERGE_CONFLICT_CREATED";
      paths: string[];
    }
  | {
      type: "CONFLICT_RESOLVED";
      paths: string[];
    }
  | {
      type: "MERGE_COMPLETED";
      commitId?: string;
    }
  | {
      type: "REMOTE_FETCHED";
      remoteName: string;
    }
  | {
      type: "REMOTE_PUSHED";
      remoteName: string;
      branchName: string;
    }
  | {
      type: "REMOTE_PULLED";
      remoteName: string;
      branchName: string;
    };
```

---

# 13. Simulator Invariants

다음은 반드시 지켜야 한다.

```text
1. Simulator는 scripted response mock이 아니다.
2. 동일 command의 결과는 현재 RepositoryState에 따라 계산된다.
3. 실패한 command는 state를 손상시키지 않는다.
4. invalid command는 history에는 남을 수 있지만 state는 변경하지 않는다.
5. Quest objective와 무관한 valid command도 정상 실행된다.
6. 같은 input state + command는 **ID를 포함해 동일한 deterministic result**를 생성해야 한다.
7. Commit ID 생성은 `nextCommitSequence` 기반 deterministic 규칙을 사용한다.
8. UI component가 직접 RepositoryState를 임의 수정하지 않는다.
9. state 변경은 Simulator domain function을 통해 수행한다.
10. React-specific state는 Simulator package 내부에 존재하지 않는다.
```

---

# 14. `git diff` Contracts

## 14.1 `git diff`

비교:

```text
Working Tree
vs
Staging Area
```

---

## 14.2 `git diff --staged`

비교:

```text
Staging Area
vs
HEAD Commit Snapshot
```

---

## 14.3 Diff Result

```ts
export type FileDiff = {
  path: string;
  before: string | null;
  after: string | null;
  kind: "ADDED" | "MODIFIED" | "DELETED";
};
```

Simulator output string은 해당 diff structure를 사람이 읽을 수 있는 terminal output으로 변환한다.

Section 10.6의 전체 snapshot을 복원해 비교한다. 변경분 배열끼리 직접 비교하지 않는다.
`git diff`는 I를 before, W를 after로 사용하며 untracked 파일은 제외한다.
`git diff --staged`는 H를 before, I를 after로 사용한다.
새 파일은 add 전에는 status에서 untracked로 보이고, add 후에는 staged diff에 나타난다.

---

# 15. Quest Contracts

## 15.1 Quest Teammate

```ts
export type QuestTeammate = {
  id: string;
  name: string;
  avatarKey: string;
  role: LocalizedText;
};
```

Quest의 virtual teammate는 실제 GitneaPig User가 아니다.
`UserId` 또는 Friendship과 연결하지 않는다.

---

## 15.2 Quest Definition

```ts
export type QuestDefinition = {
  id: QuestId;
  slug: string;
  order: number;

  title: LocalizedText;
  summary: LocalizedText;

  story: LocalizedText;
  team: QuestTeammate[];

  initialState: RepositoryState;
  unlockRule: QuestUnlockRule;

  objectives: QuestObjective[];
  events: QuestEventDefinition[];

  successConditions: QuestCondition[];
  hints: LocalizedText[];

  xpReward: number;
};
```

---

## 15.3 Quest Objective

```ts
export type QuestObjective = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  conditions: QuestCondition[];
};
```

---

## 15.4 Team Message

```ts
export type TeamMessage = {
  id: string;
  teammateId?: string;
  speakerName: string;
  avatarKey: string;
  role?: LocalizedText;
  message: LocalizedText;
};
```

---

## 15.5 Quest Trigger

```ts
export type QuestTrigger =
  | "QUEST_START"
  | "AFTER_COMMAND"
  | "AFTER_SIMULATOR_EVENT"
  | "CONDITION_MET";
```

---

## 15.6 Quest Event

```ts
export type QuestEventDefinition = {
  id: string;
  trigger: QuestTrigger;

  commandKey?: CommandKey;
  simulatorEventType?: SimulatorEvent["type"];
  condition?: QuestCondition;

  actions: QuestEventAction[];
};
```

---

## 15.7 Quest Event Action

```ts
export type QuestEventAction =
  | {
      type: "ADD_MESSAGE";
      message: TeamMessage;
    }
  | {
      type: "APPLY_REMOTE_COMMIT";
      remoteCommit: RemoteCommitSpec;
    }
  | {
      type: "MODIFY_WORKING_FILE";
      path: string;
      content: string;
    }
  | {
      type: "ENABLE_PULL_REQUEST";
      pullRequestId: string;
    }
  | {
      type: "OPEN_REVIEW";
      reviewId: string;
    }
  | {
      type: "UPDATE_REVIEW";
      reviewId: string;
      status: QuestReviewState["status"];
    }
  | {
      type: "UPDATE_ISSUE";
      issueId: string;
      status: QuestIssueState["status"];
    }
  | {
      type: "UPDATE_OBJECTIVE";
      objectiveId: string;
    };
```

---

## 15.8 Remote Commit Spec

```ts
export type RemoteCommitSpec = {
  remoteName: string;
  branchName: string;
  message: string;
  snapshot: Record<string, string>;
};
```

Helper:

```ts
applyRemoteCommit(
  state: RepositoryState,
  spec: RemoteCommitSpec
): RepositoryState;
```

---


## 15.9 Quest Unlock Contract

Quest는 순차 prerequisite를 사용한다.

```ts
export type QuestUnlockRule = {
  prerequisiteQuestId: QuestId | null;
};
```

기본 5개 Quest:

```text
Quest 1
→ prerequisite = null

Quest 2
→ Quest 1

Quest 3
→ Quest 2

Quest 4
→ Quest 3

Quest 5
→ Quest 4
```

Authenticated User:

```text
QuestProgress completion
→ next Quest persistently AVAILABLE
```

Guest:

```text
Quest 1 initially AVAILABLE
current browser session에서 Quest 완료
→ next Quest locally AVAILABLE
→ server persistence / XP 없음
```

Guest unlock state는 account progress로 간주하지 않는다.

---

# 16. Condition Contracts

## 16.1 Simulator State Conditions

Learn Practice와 Daily Challenge는 주로 최종 Repository State를 기준으로 판정한다.

```ts
export type SimulatorCondition =
  | {
      type: "CURRENT_BRANCH";
      branchName: string;
    }
  | {
      type: "COMMIT_EXISTS";
      messageContains?: string;
    }
  | {
      type: "BRANCH_EXISTS";
      branchName: string;
    }
  | {
      type: "FILE_STAGED";
      path: string;
    }
  | {
      type: "FILE_CONFLICTED";
      path: string;
    }
  | {
      type: "MERGE_COMPLETED";
    }
  | {
      type: "REMOTE_SYNCED";
      remoteName: string;
      branchName: string;
    };
```

---

## 16.2 Simulator Event Conditions

Quest는 특정 행동이 실제로 발생했는지도 조건으로 사용할 수 있다.

```ts
export type SimulatorEventCondition = {
  type: "SIMULATOR_EVENT_OCCURRED";
  eventType: SimulatorEvent["type"];
};
```

예:

```text
REMOTE_PUSHED
MERGE_CONFLICT_CREATED
MERGE_COMPLETED
```

Raw command string을 비교하지 않고 normalized Simulator Event를 사용한다.

---

## 16.3 Quest UI / Collaboration State

Pull Request, Review, Issue는 Git Simulator의 RepositoryState와 별개의
Quest-only runtime state다.

```ts
export type QuestPullRequestState = {
  id: string;
  sourceBranch: string;
  targetBranch: string;
  status: "AVAILABLE" | "OPEN" | "CHANGES_REQUESTED" | "APPROVED" | "CLOSED";
};

export type QuestReviewState = {
  id: string;
  pullRequestId: string;
  status: "PENDING" | "CHANGES_REQUESTED" | "RESOLVED" | "APPROVED";
};

export type QuestIssueState = {
  id: string;
  status: "OPEN" | "DONE";
};

export type QuestRuntimeState = {
  pullRequests: QuestPullRequestState[];
  reviews: QuestReviewState[];
  issues: QuestIssueState[];
};
```

이 state는 현재 Quest attempt의 client-side runtime state로 사용하며
기본적으로 DB persistence 대상이 아니다.

Reset 시 `initialState`와 함께 초기화된다.

---

## 16.4 Quest UI Conditions

```ts
export type QuestUiCondition =
  | {
      type: "PULL_REQUEST_OPENED";
      pullRequestId?: string;
    }
  | {
      type: "REVIEW_RESOLVED";
      reviewId?: string;
    }
  | {
      type: "ISSUE_DONE";
      issueId?: string;
    };
```

---

## 16.5 Quest Condition

Quest Objective / Success Condition은 다음 세 종류를 조합할 수 있다.

```ts
export type QuestCondition =
  | SimulatorCondition
  | SimulatorEventCondition
  | QuestUiCondition;
```

따라서 Quest는:

```text
Repository State
+
Simulator Event
+
Quest PR/Review/Issue Runtime State
```

를 함께 관찰할 수 있다.

Learn Practice와 Daily Challenge는 Quest-only UI condition에 의존하지 않는다.

---

# 17. Quest Progress

```ts
export type QuestProgressResponse = {
  questId: QuestId;
  completed: boolean;
  completedAt: IsoDateTime | null;
  xpAwarded: boolean;
};
```

현재 attempt의 simulator state / terminal history / QuestRuntimeState는
DB에 저장하지 않는 것을 기본으로 한다.

Reset은 다음을 client-side initial state로 되돌린다.

```text
RepositoryState
QuestRuntimeState
Objectives
Quest events
Terminal history
Hint progress
Feedback
```

---

# 18. Daily Challenge Contracts

## 18.1 Daily Challenge

```ts
export type DailyChallengeDefinition = {
  id: DailyChallengeId;
  dateKey: string;
  title: LocalizedText;
  description: LocalizedText;
  difficulty: Difficulty;
  topic: LocalizedText;

  initialState: RepositoryState;
  successConditions: SimulatorCondition[];

  hints: LocalizedText[];
  xpReward: number;
};
```

`dateKey` 예:

```text
2026-09-05
```

`dateKey`는 Client clock을 신뢰해서 결정하지 않는다.
Backend가 application-configured timezone 기준으로 오늘 날짜를 결정한다.

```text
APP_TIME_ZONE
→ server determines today's dateKey
```

모든 환경에서 동일한 설정을 사용한다.

---

## 18.1A Daily Challenge Runtime View State

Daily Challenge route 내부의 UI runtime state:

```ts
export type DailyChallengeViewState =
  | "INTRO"
  | "WORKSPACE"
  | "COMPLETED";
```

Flow:

```text
INTRO
→ user selects Start Challenge
→ WORKSPACE

WORKSPACE
→ success conditions satisfied
→ COMPLETED
```

이 view state는 persistent DB status가 아니다.

Page reload 시 authenticated completion 여부를 조회해 이미 완료한 오늘 Challenge를
어떻게 표시할지는 UI에서 결정할 수 있지만,
오늘의 `DailyChallenge` assignment와 `DailyChallengeProgress`가 persistence source다.

`INTRO`에서는 정답 command를 노출하지 않는다.

---

## 18.2 Completion

```ts
export type DailyChallengeCompletionResponse = {
  completed: boolean;
  firstCompletion: boolean;
  xpAwarded: number;
};
```

Guest는 completion을 local state에서 경험할 수 있지만
DB persistence / XP award는 하지 않는다.

Guest는 completion endpoint를 호출하지 않는 것을 기본 Frontend 동작으로 한다.
직접 completion endpoint를 호출하면 Backend는 `401 Unauthorized`를 반환한다.

이 정책은 Lesson / Quest / Daily Challenge에 동일하게 적용한다.

---


## 18.3 Today Selection / Generation

평가 날짜가 seed 날짜와 달라도 `/today`가 실패하지 않도록
고정 날짜 row만 seed하지 않는다.

Backend는 reusable challenge template pool을 가진다.

```ts
export type DailyChallengeTemplate = Omit<
  DailyChallengeDefinition,
  "id" | "dateKey"
> & {
  templateKey: string;
};
```

`GET /api/v1/daily-challenge/today`:

```text
1. APP_TIME_ZONE 기준 today dateKey 계산
2. DailyChallenge(dateKey) 조회
3. 존재하면 반환
4. 없으면 template pool에서 deterministic selection
5. DailyChallenge row 생성
6. UNIQUE(dateKey) race가 발생하면 winner row 재조회
7. 반환
```

Template 선택은 dateKey 기반 deterministic index를 사용한다.

```text
same dateKey + same seed/template set
→ same template
```

따라서 서버 재시작 때문에 오늘 Challenge가 바뀌지 않는다.

---

## 18.4 Common Guest Completion Policy

세 콘텐츠의 Guest 정책을 통일한다.

```text
Lesson
Quest
Daily Challenge
```

Guest:

```text
Simulator / condition evaluation
→ Client-side completion UX 표시 가능
→ Progress DB 저장 안 함
→ XP 지급 안 함
→ Achievement unlock 서버 처리 안 함
→ /complete endpoint 호출 안 함
```

Authenticated User:

```text
Client success
→ completion endpoint 호출
→ Backend가 completion/reward를 transaction으로 저장
```

모든 completion mutation endpoint는 authenticated-only다.

Guest가 직접 호출한 경우:

```text
401 Unauthorized
```

---


# 18A. Completion Mutation Request Contract

Completion endpoint는 request body에 `userId`, `xp`, `level`, `xpReward`를 받지 않는다.

최소 request:

```ts
export type CompletionRequest = {
  contentVersion?: string;
};
```

Reward amount와 completion 대상은 server-side Lesson / Quest / Daily definition에서 결정한다.

```text
Client
→ "이 콘텐츠를 완료했다" 요청

Server
→ authenticated user identity 사용
→ target definition 조회
→ reward / uniqueness / transaction 처리
```

현재 GitneaPig는 competitive game이 아니므로
클라이언트 Simulator state 자체를 보안 증명으로 취급하지 않는다.

다만 Frontend의 성공 UX는 반드시 shared `SimulatorCondition` evaluator를 통과한 뒤
completion request를 보내야 한다.

---

# 19. Achievement Contracts

## 19.1 Achievement

```ts
export type AchievementCategory =
  | "BASICS"
  | "COLLABORATION"
  | "PRACTICE"
  | "CONSISTENCY";

export type AchievementRule =
  | {
      type: "LESSON_COMPLETION_COUNT";
      count: number;
    }
  | {
      type: "QUEST_COMPLETION_COUNT";
      count: number;
    }
  | {
      type: "DAILY_COMPLETION_COUNT";
      count: number;
    }
  | {
      type: "STREAK_AT_LEAST";
      days: number;
    };

export type AchievementDefinition = {
  id: AchievementId;
  key: string;
  category: AchievementCategory;

  title: LocalizedText;
  description: LocalizedText;

  rule: AchievementRule;
  xpReward: number;
  iconKey: string;
};
```

---

## 19.2 User Achievement

```ts
export type AchievementSummary = {
  achievementId: AchievementId;
  key: string;
  title: LocalizedText;
  description: LocalizedText;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: IsoDateTime | null;
};
```

---


## 19.3 Fixed Achievement Seed Set

최종 seed는 아래 10개로 고정한다.

| key | category | rule | XP | iconKey | ko title | en title | ja title |
|---|---|---|---:|---|---|---|---|
| `first_lesson` | `BASICS` | `LESSON_COMPLETION_COUNT 1` | 40 | `book-open-check` | 첫 수업 완료 | First Lesson | 最初のレッスン |
| `lesson_trio` | `BASICS` | `LESSON_COMPLETION_COUNT 3` | 80 | `library` | 학습 탄력 | Learning Momentum | 学習の勢い |
| `git_foundations_complete` | `BASICS` | `LESSON_COMPLETION_COUNT 5` | 140 | `graduation-cap` | Git 기초 완주 | Git Foundations | Git基礎修了 |
| `quest_starter` | `COLLABORATION` | `QUEST_COMPLETION_COUNT 1` | 60 | `flag` | 첫 퀘스트 | Quest Starter | クエスト開始 |
| `quest_trio` | `COLLABORATION` | `QUEST_COMPLETION_COUNT 3` | 100 | `users` | 협업 적응 | Collaboration in Motion | コラボレーション実践 |
| `quest_master` | `COLLABORATION` | `QUEST_COMPLETION_COUNT 5` | 160 | `trophy` | 퀘스트 마스터 | Quest Master | クエストマスター |
| `daily_regular` | `PRACTICE` | `DAILY_COMPLETION_COUNT 3` | 80 | `calendar-check` | 데일리 루틴 | Daily Regular | デイリールーティン |
| `daily_week` | `PRACTICE` | `DAILY_COMPLETION_COUNT 7` | 140 | `calendar-days` | 일주일 연습 | One Week of Practice | 1週間の練習 |
| `three_day_streak` | `CONSISTENCY` | `STREAK_AT_LEAST 3` | 80 | `flame` | 3일 연속 | Three-Day Streak | 3日連続 |
| `seven_day_streak` | `CONSISTENCY` | `STREAK_AT_LEAST 7` | 160 | `award` | 7일 연속 | Seven-Day Streak | 7日連続 |

Description seed:

| key | ko | en | ja |
|---|---|---|---|
| `first_lesson` | 첫 번째 Lesson을 완료하세요. | Complete your first lesson. | 最初のレッスンを完了する。 |
| `lesson_trio` | Lesson 3개를 완료하세요. | Complete three lessons. | 3つのレッスンを完了する。 |
| `git_foundations_complete` | 5개의 Lesson을 모두 완료하세요. | Complete all five lessons. | 5つのレッスンをすべて完了する。 |
| `quest_starter` | 첫 번째 Quest를 완료하세요. | Complete your first quest. | 最初のクエストを完了する。 |
| `quest_trio` | Quest 3개를 완료하세요. | Complete three quests. | 3つのクエストを完了する。 |
| `quest_master` | 5개의 Quest를 모두 완료하세요. | Complete all five quests. | 5つのクエストをすべて完了する。 |
| `daily_regular` | Daily Challenge를 3회 완료하세요. | Complete three Daily Challenges. | デイリーチャレンジを3回完了する。 |
| `daily_week` | Daily Challenge를 7회 완료하세요. | Complete seven Daily Challenges. | デイリーチャレンジを7回完了する。 |
| `three_day_streak` | 3일 연속 qualifying activity를 달성하세요. | Reach a three-day activity streak. | 3日連続のアクティビティを達成する。 |
| `seven_day_streak` | 7일 연속 qualifying activity를 달성하세요. | Reach a seven-day activity streak. | 7日連続のアクティビティを達成する。 |

`iconKey`는 Design System의 icon mapping에서 `lucide-react` icon으로 연결한다.

---

## 19.4 Achievement Evaluation Rule

Persistent Achievement는 **Backend가 현재 persistent data만으로 검증 가능한 조건**으로 제한한다.

예:

```text
First Lesson
→ LESSON_COMPLETION_COUNT 1

Quest Starter
→ QUEST_COMPLETION_COUNT 1

Daily Regular
→ DAILY_COMPLETION_COUNT 3

Three Day Streak
→ STREAK_AT_LEAST 3
```

Practice의 임의 Simulator command만으로 서버 Achievement를 unlock하지 않는다.

Achievement unlock transaction:

```text
1. rule 평가
2. UserAchievement unique insert
3. first insert인 경우 Achievement.xpReward atomic increment
4. 이미 unlock된 경우 XP 추가 지급 없음
```

Achievement XP로 인해 Level은 자동으로 derived 계산된다.

---

# 20. Bookmark Contracts

## 20.1 Target Type

```ts
export type BookmarkTargetType =
  | "LESSON"
  | "QUEST"
  | "COMMAND";
```

---

## 20.2 Bookmark

```ts
export type Bookmark = {
  id: BookmarkId;
  targetType: BookmarkTargetType;
  targetId: string;
  createdAt: IsoDateTime;
};
```

---

## 20.3 Public API Bookmark Representation

```ts
export type PublicBookmarkResponse = {
  id: BookmarkId;
  targetType: BookmarkTargetType;
  targetId: string;
  createdAt: IsoDateTime;
};
```

Public API는 API key에 연결된 user scope의 Bookmark만 다룬다.

---


## 20.4 Bookmark Target Integrity

`Bookmark.targetId`는 `LESSON | QUEST | COMMAND`을 가리키는 polymorphic target이므로
하나의 일반 SQL foreign key로 세 종류를 동시에 표현하지 않는다.

Backend는 Bookmark 생성/수정 transaction 전에:

```text
targetType 확인
→ 해당 target table/catalog에서 target 존재 확인
→ user ownership/visibility policy 확인
→ Bookmark 저장
```

존재하지 않는 target은 저장하지 않는다.

```text
404 BOOKMARK_TARGET_NOT_FOUND
```

---

# 21. Friendship Contracts

## 21.1 Friendship Status

```ts
export type FriendshipStatus =
  | "PENDING"
  | "ACCEPTED";
```

`DECLINED` 상태는 저장하지 않는다.

`PENDING` request의 decline/cancel은 해당 Friendship row를 삭제한다.

```text
receiver가 DELETE /api/v1/friends/requests/:id
→ decline
→ PENDING row delete

sender가 DELETE /api/v1/friends/requests/:id
→ cancel
→ PENDING row delete
```

삭제 후 같은 canonical pair는 이후 새로운 Friend Request를 만들 수 있다.

`ACCEPTED` relationship 삭제는 `/api/v1/friends/:userId`를 사용한다.

---

## 21.2 Friend Request

```ts
export type FriendRequest = {
  id: FriendshipId;
  sender: PublicUserSummary;
  receiver: PublicUserSummary;
  status: FriendshipStatus;
  createdAt: IsoDateTime;
};
```

---

## 21.3 Online Status

```ts
export type OnlineStatus =
  | "ONLINE"
  | "OFFLINE";
```

고정 계산:

```text
ONLINE_STATUS_THRESHOLD_SECONDS = 120

now - lastActiveAt <= 120 seconds
→ ONLINE

otherwise
→ OFFLINE
```

Frontend Friends polling:

```text
FRIENDS_POLL_INTERVAL_SECONDS = 30
```

즉 Friends page가 열려 있는 동안 30초마다 최신 상태를 조회한다.

---


## 21.4 Friendship Pair Invariants

다음 관계는 허용하지 않는다.

```text
requesterId === addresseeId
```

실패:

```text
400 CANNOT_FRIEND_SELF
```

또한 동일 두 사용자 사이에는 방향과 무관하게 relationship row가 최대 하나만 존재해야 한다.

```text
A → B
B → A
```

를 서로 다른 pair로 취급하지 않는다.

DB 저장은 canonical pair를 사용한다.

```text
userLowId  = min(userAId, userBId)
userHighId = max(userAId, userBId)
```

그리고:

```text
UNIQUE(userLowId, userHighId)
```

를 적용한다.

누가 최초 요청자인지는 별도 `requesterId`로 저장한다.

추가 invariant:

```text
이미 PENDING
→ 중복 request 불가

이미 ACCEPTED
→ 재-request 불가
```

---


## 21.5 Online Presence Update

`lastActiveAt`은 Client가 timestamp를 body로 보내서 수정하지 않는다.

Authenticated request가 성공적으로 인증되면 Backend middleware/interceptor가
서버 시간을 기준으로 갱신한다.

DB write 과다를 피하기 위해 일정 시간 이내의 반복 request는 update를 throttle할 수 있다.

```text
authenticated request
→ server now
→ lastActiveAt update when threshold elapsed
```

Friends API는 이 값을 기준으로 `ONLINE` / `OFFLINE`을 계산한다.

---

# 22. Reference / Advanced Search Contracts

## 22.1 Search Query

```ts
export type CommandSearchQuery = {
  q?: string; // trimmed, max 100 characters
  category?: CommandCategory;
  difficulty?: Difficulty;
  sort?: "NAME_ASC" | "NAME_DESC" | "DIFFICULTY_ASC" | "DIFFICULTY_DESC";
  page?: number;
  pageSize?: number;
};
```

---

## 22.2 Search Response

```ts
export type CommandSearchResponse =
  PaginatedResponse<CommandReferenceListItem>;
```

Advanced Search Module 요구를 충족하기 위해
Search + Filter + Sort + Pagination을 모두 실제로 구현한다.

---

# 23. Localization Contracts

## 23.1 UI Translation

UI label:

```text
i18next resource files
```

예:

```text
apps/frontend/src/locales/ko/*.json
apps/frontend/src/locales/en/*.json
apps/frontend/src/locales/ja/*.json
```

---

## 23.2 Domain Content Translation

Lesson / Quest / Reference / Daily Challenge의 다국어 domain content는
**PostgreSQL JSONB (`Prisma.Json`)의 `LocalizedText` 구조로 저장하는 것으로 고정한다.**

```ts
type LocalizedText = {
  ko: string;
  en: string;
  ja: string;
};
```

---

## 23.3 Git Syntax

다음은 번역하지 않는다.

```text
git command
branch name
commit hash
file path
remote name
```

---

# 24. PWA Data / Cache Contracts

## 24.1 Persistently Cacheable

Persistent Service Worker cache에는 Guest에게 안전한 데이터만 저장한다.

```text
Application shell
Static assets
Frontend bundles
i18n resource files
Guest-safe Lesson 1–3 content or explicit public projection
Practice Playground definitions
Simulator package/resources
CommandGuideItem guest-safe projection
```

---

## 24.2 Never Persistently Cache as Shared Content

다음 authenticated/private response는 Service Worker persistent cache 대상에서 제외한다.

```text
Profile
Email / account data
Friends
Friend requests
Bookmarks
User Achievements / user-specific progress
XP / streak
API key data
Authenticated Reference detail
Lesson 4–5 protected content
42 OAuth responses
Auth/session endpoints
Avatar mutation responses
Any response containing Set-Cookie
```

Reference 전체 상세 콘텐츠는 회원 전용이므로
offline persistent Reference cache를 제공하지 않는다.

---

## 24.3 Network-only Mutations

```text
Authentication
42 OAuth
Profile mutation
Avatar upload
Friends mutation/status freshness
XP persistence
Lesson completion persistence
Quest completion persistence
Daily Challenge completion persistence
Bookmarks mutation
API key management
Public API mutations
```

Offline 상태에서 해당 action을 local optimistic success로 속이지 않는다.

---

## 24.4 Logout Cache Purge

Logout 성공 시:

```text
1. auth cookie 제거
2. in-memory current-user state 초기화
3. user-specific runtime cache 제거
4. authenticated query cache 제거
5. private browser storage가 있다면 제거
```

Persistent cache에 원래 private data를 넣지 않는 것이 1차 방어이고,
logout purge는 2차 방어다.

공용 PC에서 이전 사용자의 authenticated data가 Guest 또는 다음 사용자에게
노출되어서는 안 된다.

---

## 24.5 Cache-Control Contract

Backend의 private/authenticated response는 적절한 cache header를 사용한다.

권장:

```text
Cache-Control: no-store
```

Service Worker는 `/api/v1/auth/**`, `/api/v1/profile/**` 등
명시된 private route를 cache interception 대상에서 제외한다.

---

## 24.6 Offline State

```ts
export type ConnectivityState =
  | "ONLINE"
  | "OFFLINE";
```

Offline 상태에서 network-only mutation을 실행하면
명확한 offline error/notice를 반환한다.

---


## 24.7 Cache Strategy

`vite-plugin-pwa` / Workbox 기준 초기 정책을 고정한다.

```text
App shell / hashed static assets
→ CacheFirst / precache

Guest-safe Lesson GET responses
→ NetworkFirst
→ offline fallback to cached response

CommandGuideItem / bundled Simulator metadata
→ precache with frontend bundle

Authenticated/private API
→ NetworkOnly + no-store
```

Service Worker update:

```text
registerType = prompt
```

새 version이 준비되면 사용자에게 reload/update action을 보여주고,
사용자 확인 후 새 worker를 활성화한다.

---

# 25. Internal REST API Contracts

Base:

```text
/api/v1
```

## 25.1 Auth

```text
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
GET    /api/v1/auth/42
GET    /api/v1/auth/42/callback
POST   /api/v1/auth/42/onboarding
```

---

## 25.2 Profile

```text
GET    /api/v1/profile
PATCH  /api/v1/profile
POST   /api/v1/profile/avatar

GET    /api/v1/profile/api-keys
POST   /api/v1/profile/api-keys
DELETE /api/v1/profile/api-keys/:id
```

API key management endpoint는 Cookie-authenticated User 전용이다.

Frontend의 `/profile/api-keys` 화면에서 생성/목록/폐기와
`/api/docs` 링크를 제공한다.

---

## 25.3 Lessons

```text
GET    /api/v1/lessons
GET    /api/v1/lessons/:slug
PATCH  /api/v1/lessons/:id/progress
POST   /api/v1/lessons/:id/complete
```

Guest GET은 가능하되 locked lesson content 정책을 Backend에서도 enforce한다.

`PATCH /api/v1/lessons/:id/progress`와
`POST /api/v1/lessons/:id/complete`는 Authenticated User 전용이다.

Guest Frontend는 이 endpoint를 호출하지 않으며,
직접 호출하면 Backend는:

```text
401 Unauthorized
```

를 반환한다.

---

## 25.4 Quests

```text
GET    /api/v1/quests
GET    /api/v1/quests/:slug
POST   /api/v1/quests/:id/complete
```

Guest는 Quest experience가 가능하지만
completion persistence / reward는 authenticated user만 수행한다.

`POST /api/v1/quests/:id/complete`는 Authenticated User 전용이다.
Guest가 직접 호출하면 `401 Unauthorized`를 반환한다.

---

## 25.5 Daily Challenge

```text
GET    /api/v1/daily-challenge/today
POST   /api/v1/daily-challenge/:id/complete
```

GET은 Guest도 사용할 수 있다.

`POST /api/v1/daily-challenge/:id/complete`는 Authenticated User 전용이며,
Guest가 직접 호출하면 `401 Unauthorized`를 반환한다.

---

## 25.6 Achievements

```text
GET    /api/v1/achievements
GET    /api/v1/profile/achievements
```

---

## 25.7 Bookmarks

```text
GET    /api/v1/bookmarks
POST   /api/v1/bookmarks
DELETE /api/v1/bookmarks/:id
```

---

## 25.8 Friends

```text
GET    /api/v1/friends
GET    /api/v1/friends/requests
GET    /api/v1/users/search
POST   /api/v1/friends/requests
POST   /api/v1/friends/requests/:id/accept
DELETE /api/v1/friends/requests/:id
DELETE /api/v1/friends/:userId
```

---

## 25.9 Reference

```text
GET    /api/v1/reference/commands
GET    /api/v1/reference/commands/:key
```

Reference API는 Authenticated-only member area다.

Response:

```text
GET /reference/commands
→ CommandSearchResponse
→ PaginatedResponse<CommandReferenceListItem>

GET /reference/commands/:key
→ CommandReferenceDetail
```

Practice Command Guide는 이 endpoint를 사용하지 않는다.
Practice는 guest-safe `CommandGuideItem` projection을 사용한다.

---

# 26. Public API Module Contracts

Base:

```text
/api/v1/public
```

Public API는 Frontend 내부 API와 분리한다.

Authentication:

```text
X-API-Key: <key>
```

Rate limiting:

```text
60 requests / 60 seconds / valid API key
PUBLIC_API_RATE_LIMIT_MAX=60
PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS=60
```

Rate limit counter key는 인증된 API key record ID를 기준으로 한다.

Limit 초과:

```text
429 RATE_LIMIT_EXCEEDED
Retry-After header 제공
```

OpenAPI/Swagger 기반 Documentation을 제공한다.

권장 docs route:

```text
GET /api/docs
```

또는 동등한 명확한 문서 route를 사용한다.

---

## 26.1 Required Bookmark Endpoints

```text
GET    /api/v1/public/bookmarks
GET    /api/v1/public/bookmarks/:id
POST   /api/v1/public/bookmarks
PUT    /api/v1/public/bookmarks/:id
DELETE /api/v1/public/bookmarks/:id
```

최소 5 endpoint 조건을 충족한다.

---

## 26.2 Create Bookmark

Request:

```ts
export type CreateBookmarkRequest = {
  targetType: BookmarkTargetType;
  targetId: string;
};
```

---

## 26.3 Update Bookmark

Bookmark의 target 변경만 허용하는 경우:

```ts
export type UpdateBookmarkRequest = {
  targetType: BookmarkTargetType;
  targetId: string;
};
```

---

## 26.4 Public API Restrictions

Public API는 다음을 변경할 수 없다.

```text
XP
Level
Lesson Progress
Quest Progress
Daily Challenge Completion
Achievement unlock
Friendship
Authentication state
```

Public API는 user-owned Bookmark scope로 제한한다.

---

# 27. API Key Contract

## 27.1 Stored Record

```ts
export type ApiKeyRecord = {
  id: string;
  userId: UserId;
  keyHash: string;
  label: string;
  createdAt: IsoDateTime;
  revokedAt: IsoDateTime | null;
};
```

Plain API key는 DB에 저장하지 않는다.

---

## 27.2 API Key Summary

기존 key 조회 시 raw secret을 반환하지 않는다.

```ts
export type ApiKeySummary = {
  id: string;
  label: string;
  createdAt: IsoDateTime;
  revokedAt: IsoDateTime | null;
};
```

---

## 27.3 Create API Key

Request:

```ts
export type CreateApiKeyRequest = {
  label: string;
};
```

Response:

```ts
export type CreateApiKeyResponse = {
  apiKey: string;
  record: ApiKeySummary;
};
```

`apiKey` raw value는 **생성 응답에서 딱 한 번만** 노출한다.

이후 GET으로 원문을 다시 복구할 수 없다.

---

## 27.4 Management Endpoints

```text
GET    /api/v1/profile/api-keys
POST   /api/v1/profile/api-keys
DELETE /api/v1/profile/api-keys/:id
```

Cookie-authenticated User만 자신의 key를 관리할 수 있다.

`DELETE /api/v1/profile/api-keys/:id`는 row를 삭제하지 않고 soft revoke한다.

```text
owned active key
→ revokedAt = server now
→ 204 No Content

owned already-revoked key
→ state unchanged
→ 204 No Content
```

따라서 revoke endpoint는 idempotent하다.

`revokedAt != null`인 key는 즉시 Public API authentication에서 거부한다.
GET key list에는 revoked record가 남으며 UI는 `Active` / `Revoked` 상태를 표시한다.

존재하지 않거나 현재 User 소유가 아닌 key id는:

```text
404 API_KEY_NOT_FOUND
```

으로 처리한다.

---

## 27.5 Public API Authentication

Section 3.11의 API key 전용 경계를 따른다. Session cookie를 인증 fallback으로
사용하지 않으며, Origin이 없다는 이유로 유효한 API key 요청을 거부하지 않는다.

Public API request:

```text
X-API-Key: <raw-api-key>
```

Backend:

```text
raw key
→ HMAC-SHA-256(API_KEY_HMAC_SECRET, raw key)
→ ApiKey.keyHash lookup
→ revoked check
→ owning user resolve
```

API key는 최소 32 random bytes의 entropy를 사용한다.

표시 format:

```text
gnp_<base64url-random-secret>
```

DB에는 HMAC 결과만 저장한다.

Password는 Argon2를 사용하고,
API key lookup에는 위 HMAC-SHA-256 규칙을 사용한다.

---

## 27.6 API Key Security Invariants

```text
raw API key는 log 금지
raw API key는 DB 저장 금지
GET endpoint에서 raw API key 재노출 금지
다른 사용자의 API key 목록 조회 금지
revoked key 사용 금지
rate limit 적용
```

---


## 27.7 API Key Errors

예:

```text
401 INVALID_API_KEY
401 REVOKED_API_KEY
403 API_KEY_FORBIDDEN
429 RATE_LIMIT_EXCEEDED
404 API_KEY_NOT_FOUND
```

---

# 28. Prisma Model Responsibilities

정확한 Prisma schema syntax는 구현 파일에서 작성하지만
Model 책임은 아래와 같이 고정한다.

---

## 28.1 User

책임:

```text
authentication identity
profile
language
XP
streak
streakLastActivityDateKey
lastActiveAt
avatar metadata
```

주요 필드:

```text
id
email?
normalizedEmail?
passwordHash?
oauth42Subject?
nickname
normalizedNickname
avatarSource
avatarPresetKey?
avatarPath?
language
xp
streak
streakLastActivityDateKey?
lastActiveAt
createdAt
updatedAt
```

Unique:

```text
normalizedEmail
normalizedNickname
oauth42Subject
```

`email`/`nickname` display field가 아니라 normalized field가 uniqueness source다.

OAuth-only account는 `email` / `normalizedEmail`이 null일 수 있다.

---

## 28.2 Lesson

```text
id
slug
order
content/metadata
guestAccessible
xpReward
```

---

## 28.3 LessonProgress

```text
userId
lessonId
highestReachedStageIndex
completedAt?
xpAwarded
```

Unique:

```text
(userId, lessonId)
```

---

## 28.4 Quest

```text
id
slug
order
definition content
xpReward
```

---

## 28.5 QuestProgress

```text
userId
questId
completedAt?
xpAwarded
```

Unique:

```text
(userId, questId)
```

---

## 28.6 DailyChallenge

```text
id
dateKey
definition content
xpReward
```

Unique:

```text
dateKey
```

현재 Product rule은 하루에 하나의 Daily Challenge이므로
동일 `dateKey`에 둘 이상의 challenge row가 존재하면 안 된다.

---


## 28.7A DailyChallengeTemplate

Template pool은 code seed 또는 DB seed로 관리할 수 있으나,
Backend가 항상 동일한 template set을 사용할 수 있어야 한다.

권장 DB model:

```text
id
templateKey
definition content
xpReward
active
```

Unique:

```text
templateKey
```

`DailyChallenge`는 특정 `dateKey`에 선택된 template snapshot/assignment를 나타낸다.

---

## 28.7 DailyChallengeProgress

```text
userId
challengeId
dateKey
completedAt
xpAwarded
```

Unique:

```text
(userId, challengeId, dateKey)
```

---

## 28.8 Achievement

```text
id
key
category
title/content
rule
xpReward
iconKey
```

---

## 28.9 UserAchievement

```text
userId
achievementId
unlockedAt
xpAwarded
```

Unique:

```text
(userId, achievementId)
```

---

## 28.10 Bookmark

```text
id
userId
targetType
targetId
createdAt
```

Unique:

```text
(userId, targetType, targetId)
```

---

## 28.11 Friendship

권장 필드:

```text
id
userLowId
userHighId
requesterId
status
createdAt
updatedAt
```

Invariant:

```text
userLowId != userHighId
userLowId = min(two user IDs)
userHighId = max(two user IDs)
```

Unique:

```text
(userLowId, userHighId)
```

이 구조로 A→B와 B→A 동시 요청이 서로 다른 relationship row를 만들지 못하게 한다.

`requesterId`는 최초 요청자를 보존한다.

---

## 28.12 ApiKey

```text
id
userId
keyHash
label
createdAt
revokedAt?
```

---


## 28.13 CommandReference

Reference 상세 데이터 전용 model.

```text
id
key
difficulty
whenToUse
examples
commonMistakes
relatedCommandKeys
relatedLessonIds
relatedQuestIds
```

Unique:

```text
key
```

`key`는 shared Command Registry의 `CommandKey`와 일치해야 한다.

Localized/array content는 PostgreSQL JSONB (`Prisma.Json`)로 저장한다.

---

# 29. Concurrency / Transaction Contracts

## 29.1 General Rule

다음과 같은 보상/상태 변경은 Frontend에서 신뢰하지 않는다.

```text
completion
XP
achievement
friendship
bookmark uniqueness
```

Backend가 transaction과 constraint로 보장한다.

---

## 29.2 Lesson Completion

Transaction:

```text
1. LessonProgress 조회
2. 이미 완료 + reward 지급됨인지 확인
3. completion update/create
4. XP atomic increment
5. qualifying activity 기준 streak update
6. achievement rule evaluation
7. 새 Achievement unlock이 있으면 해당 achievement XP atomic increment
8. commit

Level은 DB에 저장하지 않으므로 transaction에서 별도 level update를 하지 않는다.
응답 시 최종 XP에서 `calculateLevel()`을 계산한다.
```

동시에 두 completion request가 들어와도 XP는 한 번만 지급한다.

---

## 29.3 Quest Completion

동일하게:

```text
QuestProgress
+ XP atomic increment
+ qualifying activity streak update
+ Achievement
```

를 transaction으로 처리한다.

Level은 최종 XP에서 derived value로 계산한다.

---

## 29.4 Daily Challenge

Definition:

```text
DailyChallenge.dateKey UNIQUE
```

Progress:

```text
UNIQUE(userId, challengeId, dateKey)
```

동일 날짜의 challenge definition은 하나이며,
동일 사용자의 해당 challenge reward도 한 번만 지급한다.

첫 completion인 경우 동일 transaction에서 qualifying activity streak도 갱신한다.

---

## 29.5 Achievement Unlock

Unique:

```text
(userId, achievementId)
```

동시 unlock 요청이 여러 번 발생해도 row와 XP는 한 번만 생성한다.

---

## 29.6 Bookmark

Unique constraint로 동일 Bookmark 중복 생성 방지.

중복 POST는:

```text
409 Conflict
```

또는 idempotent success 정책 중 하나로 통일한다.

권장:

```text
409 BOOKMARK_ALREADY_EXISTS
```

---

## 29.7 Friendship

다음 race를 막는다.

```text
A → B request
B → A request
동시 생성
```

Server는 request 전에 self-request를 검사한다.

```text
requesterId === addresseeId
→ 400 CANNOT_FRIEND_SELF
```

이후 canonical pair:

```text
userLowId
userHighId
```

를 계산하고 DB의:

```text
UNIQUE(userLowId, userHighId)
```

로 최종 중복을 차단한다.

이미 `PENDING` 또는 `ACCEPTED` relationship이 존재하면 새 request를 만들지 않는다.

---


## 29.8 Transaction Isolation / Retry

Reward와 concurrency-sensitive mutation은 PostgreSQL transaction에서 처리한다.

권장 Prisma policy:

```text
IsolationLevel.Serializable
```

적용 대상:

```text
Lesson first completion + XP + streak + achievements
Quest first completion + XP + streak + achievements
Daily first completion + XP + streak + achievements
Friendship pair creation
DailyChallenge(dateKey) lazy creation
```

Serialization conflict / write conflict가 발생하면 Backend는
bounded retry를 수행한다.

```text
MAX_TRANSACTION_RETRIES = 3
```

3회 이후에도 실패하면 `409` 또는 `503`의 일관된 domain error를 반환하고,
부분 상태를 commit하지 않는다.

---

# 30. Authorization Contracts

모든 user-owned resource는 Backend에서 현재 인증 user와 ownership을 확인한다.

예:

```text
Bookmark
Profile
Friendship
ApiKey
Progress
Achievement state
Avatar
```

Frontend가 userId를 보내더라도
Backend는 request userId를 신뢰하지 않는다.

원칙:

```text
authenticated user
→ cookie/JWT identity
→ server-side ownership resolution
```

---

# 31. Seed Data Contracts

초기 seed에 최소 다음이 포함되어야 한다.

```text
5 Lessons
5 Quests
Command Catalog
Achievements
Daily Challenge template pool
Preset guinea pig avatars metadata
Practice Playground definitions
```

---

## 31.1 Lesson Seed

최소:

```text
1. Git & Repository
2. Working Directory · Staging · Commit
3. Branch
4. Merge
5. Remote · Fetch · Pull · Push
```

Guest:

```text
Lesson 1–3
```

Locked:

```text
Lesson 4–5
```

---

## 31.2 Practice Seed

```text
FREE
BASIC
BRANCH
MERGE
REMOTE
```

각 category Playground seed는 최소 다음을 가진다.

```text
localized title/description
topic-specific initialState
optional practiceSuggestions
contextual recommendedCommandKeys
```

`FREE`는 전체 supported command guide를 사용하며 mandatory objective를 가지지 않는다.
Category Playground도 mandatory objective/success condition을 가지지 않는다.

---

# 32. Validation Contracts

Frontend와 Backend 모두 validation한다.

Backend validation이 최종 authoritative하다.

---

## 32.1 Auth

```text
email: trim + lowercase, max 254
password: 8–128 characters
nickname: trim, 3–20 characters
normalizedNickname: lowercase unique
```

Invalid login은 email 존재 여부를 구분하지 않고 동일한 credential error를 사용한다.

---

## 32.2 Avatar

```text
MIME
file size
allowed extension/format
authorization
```

---

## 32.3 Search

```text
q: trim, maximum 100 characters
page >= 1
1 <= pageSize <= 50
enum filter validation
sort validation
```

---

## 32.4 Public API

```text
API key valid
rate limit
target type valid
target exists
ownership valid
```

Internal Bookmark API에도 동일한 target existence validation을 적용한다.

---


## 32.5 Friendship

```text
target user exists
requester != target
canonical pair duplicate check
PENDING duplicate forbidden
ACCEPTED re-request forbidden
authorization for accept/decline/remove
```

---

## 32.6 API Key Management

```text
label required, trimmed, 1–50 characters
ownership check
revoked key rejected
raw key never logged
```

---

# 33. PWA / Server Data Boundaries

Offline Simulator state는 client-only temporary state로 취급한다.

Authenticated/private API response는 persistent Service Worker cache에 저장하지 않는다.

Offline에서 사용자가 Practice를 실행한 결과를
서버 Progress로 자동 간주하지 않는다.

Network 복귀 시:

```text
Practice temporary state
→ local only

Authenticated completion
→ explicit server request required
```

Lesson/Quest/Daily completion은 Backend validation 후에만 XP를 지급한다.

---

# 34. Security-sensitive Fields

다음 필드는 Frontend response로 절대 보내지 않는다.

```text
passwordHash
42 access token
42 refresh token if stored
OAuth state cookie value
OAuth onboarding cookie value
JWT secret
API key hash
API key raw value (생성 응답 외)
internal storage absolute path
database credentials
```

Avatar response에는 public URL만 제공한다.

---

# 35. Logging Contracts

로그에 남기면 안 되는 값:

```text
plain password
JWT
HttpOnly cookie value
OAuth access token
API key raw value
```

허용되는 예:

```text
request id
route
status code
user id where appropriate
error code
duration
```

---

# 36. HTTP Status Guidelines

```text
200
→ successful GET/PATCH

201
→ successful creation

204
→ delete/logout success with no body

400
→ invalid request

401
→ authentication required / invalid

403
→ authenticated but forbidden

404
→ target not found

409
→ unique/conflict state

413
→ uploaded file too large

429
→ rate limit exceeded

500
→ unexpected server failure
```

---


# 37. Environment Variables

`.env`는 Git에 commit하지 않는다.

`.env.example`에는 **이름과 안전한 예시/placeholder만** commit한다.

## 37.1 Required Variables

| Variable | Example / Default | Purpose |
|---|---|---|
| `NODE_ENV` | `development` | Runtime environment |
| `APP_ORIGIN` | `https://localhost` | Browser-visible application origin / Origin validation |
| `APP_TIME_ZONE` | `Asia/Seoul` | Daily Challenge / Streak date boundary |
| `BACKEND_PORT` | `3000` | NestJS internal port |
| `DATABASE_URL` | `postgresql://...` | Prisma connection URL |
| `POSTGRES_DB` | `gitneapig` | PostgreSQL container database |
| `POSTGRES_USER` | `gitneapig` | PostgreSQL container user |
| `POSTGRES_PASSWORD` | `<secret>` | PostgreSQL container password |
| `JWT_SECRET` | `<32+ byte random secret>` | Session JWT signing |
| `JWT_EXPIRES_IN` | `8h` | Normal session lifetime |
| `OAUTH_42_CLIENT_ID` | `<42 client id>` | 42 OAuth |
| `OAUTH_42_CLIENT_SECRET` | `<secret>` | 42 OAuth |
| `OAUTH_42_REDIRECT_URI` | `https://localhost/api/v1/auth/42/callback` | 42 OAuth callback |
| `AVATAR_UPLOAD_DIR` | `/app/uploads/avatars` | Custom avatar volume path |
| `AVATAR_MAX_SIZE_MB` | `2` | Avatar upload limit |
| `PUBLIC_API_RATE_LIMIT_MAX` | `60` | Public API requests per window |
| `PUBLIC_API_RATE_LIMIT_WINDOW_SECONDS` | `60` | Public API rate-limit window |
| `API_KEY_HMAC_SECRET` | `<32+ byte random secret>` | API key HMAC-SHA-256 |
| `ONLINE_STATUS_THRESHOLD_SECONDS` | `120` | Friends online threshold |

Frontend build-time configuration은 최소화한다.
Production Browser API는 Nginx의 same-origin `/api/v1`을 사용하므로
별도의 production backend absolute URL을 hardcode하지 않는다.

## 37.2 Non-secret Constants

다음은 환경마다 바꿀 이유가 거의 없으므로 shared/application config constant로 둔다.

```text
FRIENDS_POLL_INTERVAL_SECONDS = 30
MAX_PAGE_SIZE = 50
MAX_TRANSACTION_RETRIES = 3
RECENT_ACTIVITY_LIMIT = 10
RECENT_ACHIEVEMENT_LIMIT = 3
OAUTH_STATE_TTL_MINUTES = 10
OAUTH_ONBOARDING_TTL_MINUTES = 15
```

## 37.3 Secret Rule

다음 값은 실제 값을 repository에 commit하지 않는다.

```text
POSTGRES_PASSWORD
JWT_SECRET
OAUTH_42_CLIENT_SECRET
API_KEY_HMAC_SECRET
```

---

# 38. Monorepo Dependency Rules

권장:

```text
apps/frontend
→ packages/shared
→ packages/simulator

apps/backend
→ packages/shared

packages/simulator
→ packages/shared

packages/shared
→ no app dependency
```

금지:

```text
packages/simulator
→ React import

packages/shared
→ NestJS import

frontend
→ Prisma import
```

---

# 39. Shared Package Scope

`packages/shared`에는 framework-independent data contract를 둔다.

예:

```text
Language
Difficulty
CommandKey
Simulator types
API DTO response shapes where safe
Domain enums
```

Nest-specific decorator DTO는 Backend 내부에 둔다.

---

# 40. Simulator Package Scope

`packages/simulator`:

```text
parser
command registry
repository state helpers
diff engine
branch operations
commit operations
merge
conflict
remote operations
conditions
events
tests
```

---

# 41. Data Invariants

다음 invariant를 유지한다.

- [ ] 다른 사용자 데이터가 서로 섞이지 않는다.
- [ ] Guest에게 authenticated-only data가 노출되지 않는다.
- [ ] Password hash가 API response에 포함되지 않는다.
- [ ] 42 token이 Frontend에 노출되지 않는다.
- [ ] JWT는 HttpOnly Cookie를 사용한다.
- [ ] Avatar binary를 DB에 직접 저장하지 않는다.
- [ ] Avatar upload는 Docker named volume에 영속화된다.
- [ ] Avatar upload type/size validation이 Frontend와 Backend에 존재한다.
- [ ] 동일 Lesson completion으로 XP가 두 번 지급되지 않는다.
- [ ] 동일 Quest completion으로 XP가 두 번 지급되지 않는다.
- [ ] 동일 Daily Challenge reward가 같은 날 중복 지급되지 않는다.
- [ ] 동일 Achievement가 중복 unlock되지 않는다.
- [ ] 동일 Bookmark가 중복 생성되지 않는다.
- [ ] 동일 friendship pair가 중복 생성되지 않는다.
- [ ] 사용자는 자기 자신에게 Friend Request를 보낼 수 없다.
- [ ] A→B / B→A 동시 요청이 두 개의 Friendship row를 만들지 않는다.
- [ ] DailyChallenge의 `dateKey`는 unique다.
- [ ] Level은 DB source field가 아니라 XP에서 계산된다.
- [ ] API Key를 생성/조회/폐기할 수 있다.
- [ ] API Key raw value는 생성 시 한 번만 노출된다.
- [ ] Guest는 Lesson/Quest/Daily completion endpoint를 호출할 수 없으며 직접 호출 시 401이다.
- [ ] Practice Command Guide는 Guest-safe projection만 노출한다.
- [ ] Authenticated Reference detail은 Guest에게 노출되지 않는다.
- [ ] Authenticated/private API response는 PWA persistent cache에 저장되지 않는다.
- [ ] Logout 시 user-specific runtime/query cache가 제거된다.
- [ ] Simulator invalid command가 RepositoryState를 손상시키지 않는다.
- [ ] 동일 RepositoryState + command는 commit ID까지 deterministic한 결과를 만든다.
- [ ] `lastActiveAt`은 server-side activity 기준으로 갱신된다.
- [ ] 동일 날짜의 여러 qualifying completion이 streak를 중복 증가시키지 않는다.
- [ ] Quest 성공 판정이 raw command string에 종속되지 않는다.
- [ ] `git diff`와 `git diff --staged`가 다른 비교 대상을 사용한다.
- [ ] Reference Search가 `CommandReferenceListItem`을 반환한다.
- [ ] Reference Detail만 `CommandReferenceDetail` 전체를 반환한다.
- [ ] `CommandDefinition`처럼 제거된 legacy type 참조가 남아 있지 않는다.
- [ ] QuestTeammate 타입이 명시되어 있다.
- [ ] Quest의 PR/Review/Issue 조건은 `QuestRuntimeState` / `QuestCondition`으로 판정된다.
- [ ] Reference Search가 filter/sort/pagination contract를 만족한다.
- [ ] Public API는 내부 Frontend API와 분리된다.
- [ ] Public API는 API key와 rate limiting을 사용한다.
- [ ] Offline Practice는 server persistence로 오인되지 않는다.
- [ ] 모든 user-facing domain content는 ko/en/ja translation을 제공할 수 있다.
- [ ] Session JWT 수명은 8시간이며 refresh token을 사용하지 않는다.
- [ ] 만료 session은 `401 SESSION_EXPIRED`로 처리된다.
- [ ] OAuth 실패는 `/login?oauthError=42`로 redirect된다.
- [ ] `returnTo`는 internal relative path만 허용한다.
- [ ] `.env.example`의 변수 이름이 본 문서와 일치한다.
- [ ] Public API rate limit은 valid API key당 60 requests / 60 seconds다.
- [ ] Email/Nickname uniqueness는 normalized field를 기준으로 한다.
- [ ] Lesson partial progress는 XP 없이 monotonic하게 저장된다.
- [ ] 오늘 Daily Challenge row가 없어도 Backend가 deterministic하게 생성한다.
- [ ] Achievement rule은 server-persistent data로 검증 가능하다.
- [ ] Achievement XP도 unique unlock에서 한 번만 지급된다.
- [ ] Recent Activity는 별도 임의 table이 아니라 persistent completion data에서 생성된다.
- [ ] Public API key는 HMAC-SHA-256으로 lookup용 hash를 만든다.

---

# 42. Implementation Priority

Codex 또는 개발자가 데이터 구조를 구현할 때 다음 순서를 권장한다.

```text
1. packages/shared 기본 타입
2. packages/simulator 상태 모델
3. Simulator parser / command engine / tests
4. Prisma schema + normalized identity fields
5. Auth / 8h session / 42 OAuth onboarding
6. Lesson partial progress / Quest unlock / Daily template selection
7. Completion / XP / streak / achievement transaction
8. Bookmark / Friendship / Achievement
9. Avatar upload + volume cleanup
10. API key lifecycle / HMAC auth
11. Reference Registry + CommandReference Search
12. Public API + OpenAPI docs + 60/min rate limit
13. PWA cache strategy / private-cache exclusion / logout purge
```

이 순서는 UI 완성 순서와 동일할 필요는 없지만,
데이터 계약이 뒤에서 반복 변경되는 것을 줄이기 위한 권장 dependency order다.

---

# 43. Final Contract Rule

구현 중 데이터 구조를 변경해야 할 경우:

```text
1. DATA_CONTRACTS.md 수정
2. shared type 수정
3. Backend contract 수정
4. Frontend consumer 수정
5. Tests 수정
```

순서로 변경한다.

Frontend 또는 Backend 한쪽에서만 임의로 타입을 바꾸지 않는다.

특히 다음 변경은 DATA_CONTRACTS 수정 없이 구현하지 않는다.

```text
Guest/Auth access boundary
XP/Level source-of-truth
API key lifecycle
PWA private cache policy
Friendship uniqueness rule
Simulator deterministic ID rule
Reference vs Practice data projection
JWT/session lifetime
Environment variable names
Public API rate limit
Daily Challenge date selection
Achievement rule model
```
