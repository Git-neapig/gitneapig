# GitneaPig — ACCEPTANCE_CHECKLIST.md

> 이 문서는 GitneaPig 구현 완료 여부를 검증하기 위한 최종 Acceptance Checklist다.
>
> 기준 문서:
>
> - `MASTER_SPEC.md`
> - `DATA_CONTRACTS.md`
> - `DESIGN_SYSTEM.md`
> - ft_transcendence Subject v21.1의 Mandatory / 선택 Module 요구사항
>
> 해석 우선순위:
>
> ```text
> Product behavior
> → MASTER_SPEC
>
> Data / API / persistence / simulator behavior
> → DATA_CONTRACTS
>
> Visual / responsive / component behavior
> → DESIGN_SYSTEM
>
> Subject evaluation requirements
> → Subject v21.1
>
> Completion verification
> → this checklist
> ```
>
> Section 0의 제품 상수와 persistence 선택은 이미 확정되어 있다.
> 나머지 항목은 구현 후 검증한다.

---

# 0. Pre-Codex Specification Lock

Codex 구현 전에 필요한 제품 상수와 persistence 선택은 아래 값으로 확정되어 있다.

## 0.1 Level Formula

- [x] Level은 1부터 시작한다.
- [x] `XP_REQUIRED_WITHIN_LEVEL(L) = 60 × L`
- [x] `XP_TO_REACH_LEVEL(L) = 30 × L × (L - 1)`
- [x] `currentLevelXp = totalXp - XP_TO_REACH_LEVEL(level)`
- [x] `nextLevelXp = 60 × level`
- [x] `progressPercent = floor(currentLevelXp / nextLevelXp × 100)`
- [x] Frontend/Backend는 shared `calculateLevel()`을 사용한다.
- [x] DB에는 독립 `level` source field를 저장하지 않는다.

## 0.2 XP Rewards

- [x] Lesson XP = `100 / 140 / 180 / 220 / 260`
- [x] Quest XP = `140 / 180 / 220 / 260 / 300`
- [x] Daily Challenge XP = `80`
- [x] Achievement XP는 fixed 10-seed table을 따른다.

## 0.3 Achievement Seeds

- [x] Achievement는 10개 fixed seed를 사용한다.
- [x] `first_lesson`
- [x] `lesson_trio`
- [x] `git_foundations_complete`
- [x] `quest_starter`
- [x] `quest_trio`
- [x] `quest_master`
- [x] `daily_regular`
- [x] `daily_week`
- [x] `three_day_streak`
- [x] `seven_day_streak`
- [x] 각 seed의 localized title/description, category, rule, XP, iconKey는 DATA_CONTRACTS에 고정되어 있다.

## 0.4 Localized Domain Storage

- [x] UI label은 i18next resource를 사용한다.
- [x] Lesson / Quest / Reference / Daily Challenge domain content는 PostgreSQL JSONB (`Prisma.Json`)를 사용한다.
- [x] domain multilingual value shape는 `LocalizedText { ko, en, ja }`다.

## 0.5 API Key Revoke

- [x] DELETE는 hard delete 대신 `revokedAt` soft revoke를 사용한다.
- [x] revoke는 idempotent하다.
- [x] revoked key는 즉시 인증 실패한다.
- [x] revoked record는 key list에 `Revoked` 상태로 남는다.

## 0.6 Friend Request Decline

- [x] Friendship status는 `PENDING | ACCEPTED`다.
- [x] decline은 PENDING row 삭제다.
- [x] sender cancel도 PENDING row 삭제다.
- [x] 삭제된 pair는 이후 다시 request할 수 있다.
- [x] accepted friendship 제거는 별도 friend remove endpoint를 사용한다.

---
# 1. Repository / Project Foundation

## 1.1 Monorepo

- [ ] pnpm workspace를 사용한다.
- [ ] `apps/frontend`가 존재한다.
- [ ] `apps/backend`가 존재한다.
- [ ] `packages/simulator`가 존재한다.
- [ ] `packages/shared`가 존재한다.
- [ ] simulator package가 React/NestJS/Prisma에 의존하지 않는다.
- [ ] shared package에 Frontend/Backend 공통 contract가 존재한다.
- [ ] Frontend와 Backend가 동일 contract를 별도로 복사해 정의하지 않는다.

## 1.2 Technology Stack

- [ ] 전체 주요 application code는 TypeScript다.
- [ ] Frontend는 React + Vite를 사용한다.
- [ ] Styling은 Tailwind CSS 기반이다.
- [ ] Routing은 React Router 기반이다.
- [ ] Backend는 NestJS 11 + Express Adapter다.
- [ ] Database는 PostgreSQL이다.
- [ ] ORM은 Prisma다.
- [ ] Runtime은 Node.js 22다.
- [ ] Package manager는 pnpm이다.
- [ ] Frontend/Simulator test에 Vitest를 사용한다.
- [ ] Backend test에 Jest를 사용한다.
- [ ] E2E test에 Playwright를 사용한다.

## 1.3 Git / Team Evaluation

- [ ] 모든 팀원이 실제 commit을 가지고 있다.
- [ ] commit message가 변경 내용을 설명한다.
- [ ] 기능 ownership이 특정 한 사람에게만 과도하게 몰리지 않는다.
- [ ] 중요한 shared code는 팀원이 설명할 수 있다.
- [ ] AI-generated code를 팀원이 설명하고 수정할 수 있다.
- [ ] evaluation 중 작은 behavior/code 변경 요청에 대응 가능하다.

---

# 2. Build / Deployment / Mandatory Runtime

## 2.1 One-command Startup

- [ ] clean clone에서 `.env.example`을 기준으로 환경 설정이 가능하다.
- [ ] `docker compose up --build` 한 명령으로 전체 서비스가 실행된다.
- [ ] 별도 수동 DB 생성 과정이 필요하지 않다.
- [ ] 필요한 migration/seed 과정이 문서화되거나 startup flow에 포함된다.
- [ ] Frontend가 정상 실행된다.
- [ ] Backend가 정상 실행된다.
- [ ] PostgreSQL이 정상 실행된다.
- [ ] Nginx가 정상 실행된다.
- [ ] avatar named volume이 정상 mount된다.

## 2.2 HTTPS

- [ ] Browser → Nginx/Application 연결은 HTTPS다.
- [ ] Browser에서 API request도 HTTPS를 사용한다.
- [ ] OAuth redirect URI가 HTTPS origin을 사용한다.
- [ ] mixed-content error가 발생하지 않는다.
- [ ] HTTP resource 때문에 browser warning/error가 발생하지 않는다.

## 2.3 Environment

- [ ] `.env`가 `.gitignore`에 포함되어 있다.
- [ ] `.env.example`이 repository에 존재한다.
- [ ] `.env.example`에 실제 secret이 없다.
- [ ] `POSTGRES_PASSWORD` 실제 값이 commit되지 않는다.
- [ ] `JWT_SECRET` 실제 값이 commit되지 않는다.
- [ ] `OAUTH_42_CLIENT_SECRET` 실제 값이 commit되지 않는다.
- [ ] `API_KEY_HMAC_SECRET` 실제 값이 commit되지 않는다.
- [ ] 문서의 environment variable 이름과 실제 code가 일치한다.

---

# 3. Global Browser / Console / Responsive Gate

- [ ] 최신 stable Chrome에서 정상 동작한다.
- [ ] Firefox에서 핵심 기능 전체가 정상 동작한다.
- [ ] Microsoft Edge에서 핵심 기능 전체가 정상 동작한다.
- [ ] Chrome browser console에 warning/error가 없다.
- [ ] Firefox에서 치명적인 console error가 없다.
- [ ] Edge에서 치명적인 console error가 없다.
- [ ] desktop layout이 480px 수준의 좁은 centered mobile column처럼 보이지 않는다.
- [ ] tablet에서 기능이 잘리지 않는다.
- [ ] mobile에서 page-level horizontal overflow가 없다.
- [ ] Terminal/Graph가 mobile에서 사용할 수 있는 tab/stack 구조로 전환된다.
- [ ] browser-specific limitation은 README에 기록한다.

---

# 4. Global Navigation

## 4.1 Desktop Header

- [ ] GitneaPig logo가 표시된다.
- [ ] Learn navigation이 존재한다.
- [ ] Practice navigation이 존재한다.
- [ ] Quest navigation이 존재한다.
- [ ] Daily Challenge navigation이 존재한다.
- [ ] Reference navigation이 존재한다.
- [ ] primary navigation 중 현재 route 하나만 active다.
- [ ] `/practice`에서 Daily Challenge가 동시에 active가 되지 않는다.

## 4.2 Guest Header

- [ ] language selector가 표시된다.
- [ ] Login이 표시된다.
- [ ] Sign Up이 표시된다.
- [ ] authenticated-only user menu를 보여주지 않는다.

## 4.3 Authenticated Header

- [ ] language selector가 표시된다.
- [ ] XP/Level summary가 표시된다.
- [ ] Avatar가 표시된다.
- [ ] User menu를 열 수 있다.
- [ ] Profile로 이동할 수 있다.
- [ ] Friends로 이동할 수 있다.
- [ ] Achievements로 이동할 수 있다.
- [ ] Bookmarks로 이동할 수 있다.
- [ ] API Keys로 이동할 수 있다.
- [ ] Logout이 동작한다.

## 4.4 Footer

- [ ] Privacy Policy link가 있다.
- [ ] Terms of Service link가 있다.
- [ ] 두 페이지 모두 Guest도 접근 가능하다.

---

# 5. Home

## 5.1 Two-viewport Layout

- [ ] Home은 Hero와 Next Step의 두 주요 full-height section으로 구성된다.
- [ ] Hero section이 최소 viewport 높이를 차지한다.
- [ ] Next Step section도 최소 viewport 높이를 차지한다.
- [ ] 최하단까지 scroll했을 때 Hero 일부가 위에 남아 보이지 않는다.
- [ ] 불필요한 filler content로 높이를 채우지 않는다.

## 5.2 Scroll Snap

- [ ] desktop Home에서 vertical scroll snap이 동작한다.
- [ ] 사용자가 일정 수준 scroll하면 다음 full-height section으로 자연스럽게 snap된다.
- [ ] 위로 scroll하면 이전 section으로 자연스럽게 snap된다.
- [ ] motion이 지나치게 느리거나 사용자를 가두지 않는다.
- [ ] `prefers-reduced-motion` 사용자의 motion을 줄인다.
- [ ] keyboard/touch/trackpad scroll을 방해하지 않는다.

## 5.3 Hero

- [ ] 왼쪽에 headline/description/CTA가 있다.
- [ ] 오른쪽에 Git/Terminal visual이 있다.
- [ ] mascot이 supporting visual로 사용된다.
- [ ] primary CTA로 Learn에 진입할 수 있다.
- [ ] secondary CTA로 Practice에 진입할 수 있다.
- [ ] first viewport에서 다음 section이 과도하게 노출되지 않는다.

## 5.4 Next Step

- [ ] Learn card가 있다.
- [ ] Practice card가 있다.
- [ ] Quest card가 있다.
- [ ] Daily Challenge card가 있다.
- [ ] 각 card의 route가 정확하다.
- [ ] Guest에게 fake persistent progress를 보여주지 않는다.

---

# 6. Learn

## 6.1 Learn List

- [ ] 총 5개의 Lesson이 seed되어 있다.
- [ ] Lesson 1: Git & Repository
- [ ] Lesson 2: Working Directory · Staging · Commit
- [ ] Lesson 3: Branch
- [ ] Lesson 4: Merge
- [ ] Lesson 5: Remote · Fetch · Pull · Push
- [ ] Completed state가 구분된다.
- [ ] Current state가 구분된다.
- [ ] Available state가 구분된다.
- [ ] Locked state가 구분된다.
- [ ] Guest는 Lesson 1–3에 접근할 수 있다.
- [ ] Guest에게 Lesson 4–5 card는 보이지만 content는 locked다.
- [ ] Authenticated User는 unlock policy에 따라 content를 볼 수 있다.

## 6.2 Lesson Stage Structure

각 lesson:

- [ ] Situation
- [ ] Why?
- [ ] Concept
- [ ] Command
- [ ] Practice
- [ ] Result

총 6 stage를 가진다.

## 6.3 Learn Teaching Experience

- [ ] Situation은 단순 장문 text dump가 아니다.
- [ ] Situation에 실제 협업 맥락/teammate conversation 또는 시각적 상황 설명이 있다.
- [ ] Why?는 해당 개념이 필요한 이유를 비교/시각 자료로 설명한다.
- [ ] Concept는 Git Graph 등 시각적 representation을 활용한다.
- [ ] Command 단계는 실제 command syntax를 명확하게 가르친다.
- [ ] Command 단계는 사용 예시를 제공한다.
- [ ] Learn에서는 정답 command를 숨기지 않는다.
- [ ] Practice stage에서는 command input이 비어 있다.
- [ ] Practice stage에서 앞 단계의 내용을 기억해 직접 입력할 수 있다.
- [ ] mascot/contextual feedback이 학습 경험을 보조한다.

## 6.4 Stage Navigation

- [ ] 사용자가 이미 도달한 이전 stage로 돌아갈 수 있다.
- [ ] Situation → Why? → Concept → Command → Practice progression이 동작한다.
- [ ] 이전 stage를 다시 봐도 partial progress가 감소하지 않는다.
- [ ] `highestReachedStageIndex`는 monotonic하다.
- [ ] partial stage 이동만으로 XP를 지급하지 않는다.

## 6.5 Lesson Practice

- [ ] shared simulator engine을 사용한다.
- [ ] natural-language goal이 표시된다.
- [ ] answer command를 input placeholder로 노출하지 않는다.
- [ ] Terminal이 동작한다.
- [ ] Git Graph가 동작한다.
- [ ] Repo State가 동작한다.
- [ ] Reset이 상단에서 쉽게 발견된다.
- [ ] Lesson Practice Reset은 confirmation 없이 즉시 수행된다.
- [ ] Reset 시 current attempt RepositoryState가 초기화된다.
- [ ] Reset 시 Terminal history가 초기화된다.
- [ ] Reset 시 Graph/Repo State가 초기 상태로 돌아간다.

## 6.6 Lesson Completion

- [ ] state-based goal을 충족하면 Result로 진행할 수 있다.
- [ ] 처음 완료한 Authenticated User에게 XP가 한 번만 지급된다.
- [ ] duplicate completion request로 XP가 중복 지급되지 않는다.
- [ ] Achievement 조건이 평가된다.
- [ ] Guest도 accessible lesson을 완료할 수 있다.
- [ ] Guest completion은 server progress/XP로 저장되지 않는다.
- [ ] Result에 Practice More action이 있다.
- [ ] Result에 Next Lesson action이 있다.

---

# 7. Practice

## 7.1 Playground Selection

다음 5개가 존재한다.

- [ ] Free Sandbox
- [ ] Basic Repo
- [ ] Branch Playground
- [ ] Merge Playground
- [ ] Remote Playground

각 card:

- [ ] title
- [ ] short purpose
- [ ] topic/context

를 제공한다.

## 7.2 Practice Identity

- [ ] Practice에는 mandatory success goal이 없다.
- [ ] objective completion percentage를 표시하지 않는다.
- [ ] 사용자가 자유롭게 simulator command를 실행할 수 있다.
- [ ] Category Playground의 suggestion은 optional guidance다.

## 7.3 Free Sandbox

- [ ] broad initial RepositoryState가 제공된다.
- [ ] 모든 supported simulator command guide를 볼 수 있다.
- [ ] 특정 lesson/quest objective가 없다.

## 7.4 Category Playgrounds

- [ ] Basic Repo에 topic-specific initial state가 있다.
- [ ] Branch Playground에 branch-specific initial state가 있다.
- [ ] Merge Playground에 merge-specific initial state가 있다.
- [ ] Remote Playground에 remote-specific initial state가 있다.
- [ ] 각 category에 optional practiceSuggestions가 있다.
- [ ] suggestion은 completion condition으로 처리되지 않는다.

## 7.5 Contextual Command Guide

- [ ] Free Sandbox는 모든 supported command를 보여준다.
- [ ] Basic Repo는 status/add/commit/log/diff 중심이다.
- [ ] Branch는 branch/switch/checkout/status/log 중심이다.
- [ ] Merge는 merge/branch/switch/status/log 중심이다.
- [ ] Remote는 fetch/pull/push/status/log 중심이다.
- [ ] guide item은 Command/Syntax/Short Purpose/Short Example 수준이다.
- [ ] authenticated Reference Detail 전체를 Practice에 노출하지 않는다.

## 7.6 Workspace

- [ ] desktop에서 Terminal 약 60–65% 영역을 사용한다.
- [ ] right panel 약 35–40%를 사용한다.
- [ ] Git Graph tab이 있다.
- [ ] Repo State tab이 있다.
- [ ] Command Guide tab이 있다.
- [ ] default right tab은 Git Graph다.
- [ ] toolbar에 Playground가 표시된다.
- [ ] toolbar에 current branch가 표시된다.
- [ ] toolbar에 HEAD가 표시된다.
- [ ] Reset이 있다.
- [ ] Change Playground가 있다.
- [ ] Practice Reset은 confirmation을 요구한다.

---

# 8. Shared Terminal Behavior

Learn Practice / Practice / Quest / Daily Challenge에 공통 적용:

- [ ] Terminal output area가 독립 scroll container다.
- [ ] command가 많아져도 page 전체 높이가 무한히 늘어나지 않는다.
- [ ] output이 overflow하면 vertical scrollbar가 생긴다.
- [ ] user가 bottom 근처에 있을 때 new output으로 auto-scroll한다.
- [ ] user가 과거 output을 보기 위해 위로 scroll하면 위치를 강제로 bottom으로 되돌리지 않는다.
- [ ] 필요하면 new-output indicator를 제공한다.
- [ ] Terminal text를 selection/copy할 수 있다.
- [ ] Up/Down history navigation이 동작한다.
- [ ] prompt 자체는 input value에 포함되지 않는다.
- [ ] invalid command는 inline terminal error로 표시된다.
- [ ] invalid command 때문에 RepositoryState가 손상되지 않는다.

---

# 9. Quest

## 9.1 Quest List / Unlock

Seed quest:

- [ ] Feature Branch
- [ ] Staging & Commit
- [ ] Push & Pull Request
- [ ] Remote Ahead
- [ ] Merge Conflict

Unlock:

- [ ] Quest 1은 처음 available이다.
- [ ] Quest 1 완료 후 Quest 2가 unlock된다.
- [ ] Quest 2 완료 후 Quest 3가 unlock된다.
- [ ] Quest 3 완료 후 Quest 4가 unlock된다.
- [ ] Quest 4 완료 후 Quest 5가 unlock된다.
- [ ] Authenticated unlock은 persistence된다.
- [ ] Guest unlock은 current browser session에만 유지된다.

## 9.2 Workspace

- [ ] desktop에서 left 약 24%다.
- [ ] Terminal 약 52%다.
- [ ] right 약 24%다.
- [ ] left에 story가 있다.
- [ ] left에 teammate conversation이 있다.
- [ ] left에 objectives가 있다.
- [ ] center Terminal이 실제 simulator와 연결된다.
- [ ] right에 Graph/Repo/Hints가 있다.
- [ ] Quest에는 Command Guide가 없다.

## 9.3 Terminal Freedom

- [ ] objective와 무관한 valid command도 실행된다.
- [ ] valid command를 "wrong command"라는 이유만으로 차단하지 않는다.
- [ ] 실수한 command가 실제 simulator state를 바꿀 수 있다.
- [ ] 사용자가 후속 Git command로 복구할 수 있다.
- [ ] Reset으로 attempt 초기화가 가능하다.

## 9.4 Hint

- [ ] Hint 1은 situation 수준이다.
- [ ] Hint 2는 concept 수준이다.
- [ ] Hint 3은 command category 수준이다.
- [ ] Hint 4는 concrete example 수준이다.
- [ ] 첫 hint부터 exact answer command 전체를 공개하지 않는다.

## 9.5 Quest Events / Collaboration

- [ ] AFTER_COMMAND는 normalized commandKey를 사용한다.
- [ ] raw command string exact match만으로 trigger하지 않는다.
- [ ] remote commit event가 실제 virtual remote state를 바꾼다.
- [ ] PR enable/update state가 동작한다.
- [ ] Review state가 동작한다.
- [ ] Issue state가 동작한다.
- [ ] QuestRuntimeState와 RepositoryState를 구분한다.

## 9.6 Quest Completion

- [ ] objective condition이 RepositoryState/Event/UI state로 판정된다.
- [ ] exact raw command sequence에 종속되지 않는다.
- [ ] 동일한 유효 최종 상태를 만드는 alternative workflow를 허용할 수 있다.
- [ ] Reset이 상단에서 쉽게 발견된다.
- [ ] Quest Reset은 confirmation 없이 즉시 수행된다.
- [ ] Reset은 이미 지급된 persistent XP/completion을 삭제하지 않는다.
- [ ] Authenticated first completion에 XP가 한 번 지급된다.
- [ ] Guest completion은 persistent XP를 만들지 않는다.

---

# 10. Daily Challenge

## 10.1 Full Flow

- [ ] Intro / Problem state가 있다.
- [ ] Workspace state가 있다.
- [ ] Completed state가 있다.

## 10.2 Intro

- [ ] Today's Challenge title이 있다.
- [ ] backend dateKey 기준 date가 표시된다.
- [ ] realistic Git problem/scenario가 있다.
- [ ] Goal이 있다.
- [ ] Difficulty가 있다.
- [ ] Topic이 있다.
- [ ] XP reward가 있다.
- [ ] Start Challenge action이 있다.
- [ ] 기본 problem text가 exact solution command를 공개하지 않는다.

## 10.3 Workspace

- [ ] Terminal이 있다.
- [ ] Git Graph가 있다.
- [ ] Repo State가 있다.
- [ ] Hint가 있다.
- [ ] Reset이 있다.
- [ ] Practice Command Guide가 없다.
- [ ] desktop에서 Terminal 약 55–60%다.
- [ ] Graph/Repo State 약 40–45%다.

## 10.4 Hint / Reset

- [ ] 4단계 progressive hint가 동작한다.
- [ ] Reset은 confirmation 없이 즉시 수행된다.
- [ ] Reset 시 RepositoryState가 challenge initialState로 돌아간다.
- [ ] Reset 시 terminal history가 초기화된다.
- [ ] Reset 시 hint progress가 초기화된다.

## 10.5 Success

- [ ] raw command string이 아니라 state/event로 success를 판정한다.
- [ ] 1–3개의 의미 있는 action으로 풀 수 있는 challenge가 존재한다.
- [ ] Authenticated User는 reward를 날짜/challenge당 한 번만 받는다.
- [ ] Guest는 challenge를 끝까지 수행할 수 있다.
- [ ] Guest는 completion endpoint를 호출하지 않는다.
- [ ] Guest가 completion endpoint를 직접 호출하면 401이다.

## 10.6 Date / Template Generation

- [ ] timezone source는 `Asia/Seoul`이다.
- [ ] client clock을 authoritative하게 사용하지 않는다.
- [ ] `DailyChallenge.dateKey`는 unique다.
- [ ] 오늘 row가 없어도 backend가 deterministic하게 template을 선택한다.
- [ ] concurrent first request가 중복 row를 만들지 않는다.
- [ ] unique race가 발생하면 winner row를 re-read한다.
- [ ] 평가 날짜가 seed 날짜와 달라도 `/today`가 실패하지 않는다.

---

# 11. Reference / Advanced Search

## 11.1 Access

- [ ] `/reference`는 authenticated-only다.
- [ ] Guest는 member lock UI를 본다.
- [ ] Guest에게 full CommandReferenceDetail data를 API에서 반환하지 않는다.

## 11.2 List

- [ ] Search input이 있다.
- [ ] Category filter가 있다.
- [ ] Difficulty filter가 있다.
- [ ] Sort가 있다.
- [ ] Pagination이 있다.
- [ ] default page=1이다.
- [ ] default pageSize=20이다.
- [ ] max pageSize=50이다.
- [ ] q는 trim되고 max 100 chars다.

## 11.3 Detail

- [ ] Syntax를 보여준다.
- [ ] When to use를 보여준다.
- [ ] Examples를 보여준다.
- [ ] Common mistakes를 보여준다.
- [ ] Category를 보여준다.
- [ ] Difficulty를 보여준다.
- [ ] Simulator support를 보여준다.
- [ ] Related Commands가 있다.
- [ ] Related Lessons가 있다.
- [ ] Related Quests가 있다.
- [ ] Bookmark action이 있다.
- [ ] Practice in Terminal action이 있다.

## 11.4 Practice Link

- [ ] `Practice in Terminal`은 Free Sandbox로 이동한다.
- [ ] command query/context를 전달한다.
- [ ] 해당 command guide item을 highlight한다.
- [ ] simulator state 자체를 command에 맞춰 임의 변경하지 않는다.

---

# 12. Authentication

## 12.1 Email / Password

- [ ] signup이 동작한다.
- [ ] login이 동작한다.
- [ ] email을 trim/lowercase normalize한다.
- [ ] normalized email uniqueness가 적용된다.
- [ ] nickname을 trim한다.
- [ ] nickname length 3–20을 검증한다.
- [ ] normalizedNickname lowercase unique가 적용된다.
- [ ] password 8–128 chars를 검증한다.
- [ ] password를 Argon2 hash로 저장한다.
- [ ] plain password가 DB/log/API에 남지 않는다.
- [ ] invalid login은 account existence를 과도하게 노출하지 않는다.

## 12.2 Session

- [ ] cookie name은 `gitneapig_session`이다.
- [ ] JWT는 HttpOnly cookie에 저장된다.
- [ ] production cookie는 Secure다.
- [ ] SameSite policy가 최종 spec과 일치한다.
- [ ] cookie Path는 `/`다.
- [ ] session lifetime은 발급 기준 8시간이다.
- [ ] session expiry가 자동 sliding 되지 않는다.
- [ ] expiry 후 `401 SESSION_EXPIRED`를 처리한다.
- [ ] frontend는 expired auth state를 정리한다.
- [ ] safe `returnTo`와 함께 login으로 이동한다.
- [ ] logout 시 cookie가 제거된다.

## 12.3 Unsafe Request Origin Validation

- [ ] 내부 API의 POST에서 Origin을 검증한다.
- [ ] 내부 API의 PUT에서 Origin을 검증한다.
- [ ] 내부 API의 PATCH에서 Origin을 검증한다.
- [ ] 내부 API의 DELETE에서 Origin을 검증한다.
- [ ] allowed origin은 `APP_ORIGIN` 기준이다.
- [ ] 내부 API의 missing/null/malformed/foreign Origin unsafe request를 `403 FORBIDDEN`으로 거부한다.
- [ ] login/signup, onboarding, API key 관리에도 내부 API Origin 정책을 적용한다.
- [ ] Public API는 Origin 없는 유효한 API key의 GET/POST/PUT/DELETE 요청을 처리한다.
- [ ] Public API는 session cookie만으로 접근하면 `401`을 반환한다.
- [ ] Public API에 cookie와 API key가 함께 오면 API key 소유자로만 인증한다.
- [ ] Public API의 Origin 검증 예외를 모든 origin에 대한 CORS 허용으로 구현하지 않는다.

---

# 13. 42 OAuth

## 13.1 Start / Callback

- [ ] `GET /api/v1/auth/42`가 동작한다.
- [ ] `returnTo`를 safe internal relative path로 정규화한다.
- [ ] OAuth state를 생성한다.
- [ ] state cookie lifetime은 10분이다.
- [ ] callback에서 state를 검증한다.
- [ ] provider token 교환 오류를 처리한다.
- [ ] provider user fetch 오류를 처리한다.
- [ ] failure 시 `/login?oauthError=42`로 이동한다.

## 13.2 Existing OAuth User

- [ ] 기존 `oauth42Subject` user는 정상 login한다.
- [ ] 정상 session cookie가 발급된다.
- [ ] safe `returnTo`로 돌아간다.

## 13.3 New OAuth User

- [ ] callback 시 incomplete User row를 먼저 만들지 않는다.
- [ ] signed onboarding cookie를 발급한다.
- [ ] onboarding cookie TTL은 15분이다.
- [ ] `/onboarding/profile`로 이동한다.
- [ ] nickname 입력을 받는다.
- [ ] default avatar 선택이 가능하다.
- [ ] preset avatar 선택이 가능하다.
- [ ] custom avatar upload가 가능하다.
- [ ] onboarding 완료 시 User를 생성한다.
- [ ] `oauth42Subject`를 연결한다.
- [ ] onboarding cookie를 제거한다.
- [ ] normal session cookie를 발급한다.

## 13.4 Account Linking Safety

- [ ] 42 provider email과 기존 email account가 같아도 email만으로 자동 link하지 않는다.
- [ ] OAuth subject uniqueness가 DB에서 보장된다.

---

# 14. Profile / Standard User Management

## 14.1 Profile Dashboard

- [ ] avatar가 표시된다.
- [ ] nickname이 표시된다.
- [ ] level이 표시된다.
- [ ] XP가 표시된다.
- [ ] join date가 표시된다.
- [ ] Edit Profile이 동작한다.

## 14.2 Statistics

- [ ] Lessons Done
- [ ] Quests Done
- [ ] Total XP
- [ ] Streak

## 14.3 Progress / Activity

- [ ] Lesson progress가 표시된다.
- [ ] recent achievements 최대 3개가 표시된다.
- [ ] recent activity 최대 10개가 표시된다.
- [ ] Recent Activity를 별도 임의 Activity table에 중복 저장하지 않는다.
- [ ] Lesson/Quest/Daily/UserAchievement timestamps에서 recent activity를 구성한다.

---

# 15. Avatar

## 15.1 Sources

- [ ] default guinea pig avatar가 있다.
- [ ] preset guinea pig avatar가 있다.
- [ ] custom avatar가 있다.
- [ ] custom image load 실패 시 default fallback이 있다.

## 15.2 Upload Validation

- [ ] JPEG를 허용한다.
- [ ] PNG를 허용한다.
- [ ] WebP를 허용한다.
- [ ] max size 2 MB를 Frontend에서 검증한다.
- [ ] max size 2 MB를 Backend에서 다시 검증한다.
- [ ] MIME/actual format을 Backend에서 검증한다.
- [ ] original filename을 storage filename으로 사용하지 않는다.
- [ ] generated safe filename을 사용한다.
- [ ] DB에는 binary를 저장하지 않는다.
- [ ] DB에는 relative path/metadata를 저장한다.

## 15.3 Persistence / Replacement

- [ ] `/app/uploads/avatars`가 Docker named volume으로 persistence된다.
- [ ] container rebuild 후 custom avatar가 유지된다.
- [ ] replacement DB update 실패 시 새 orphan file을 정리한다.
- [ ] replacement DB update 실패 시 기존 avatar를 유지한다.
- [ ] preset/default로 전환 시 DB update 성공 뒤 old custom file을 삭제한다.

---

# 16. Friends

## 16.1 Search / Request

- [ ] nickname search가 동작한다.
- [ ] 자기 자신에게 friend request를 보낼 수 없다.
- [ ] self request는 `400 CANNOT_FRIEND_SELF`다.
- [ ] Pending request를 보낼 수 있다.
- [ ] accept가 동작한다.
- [ ] receiver decline 시 PENDING row가 삭제된다.
- [ ] sender cancel 시 PENDING row가 삭제된다.
- [ ] decline/cancel 후 동일 pair가 이후 새 request를 만들 수 있다.
- [ ] friend remove가 동작한다.

## 16.2 Canonical Pair

- [ ] friendship에 `userLowId/userHighId` canonical pair를 사용한다.
- [ ] pair에 unique constraint가 있다.
- [ ] requesterId가 별도로 존재한다.
- [ ] A→B와 B→A 동시 요청이 두 row를 만들지 않는다.
- [ ] 이미 PENDING relationship이면 duplicate request를 만들지 않는다.
- [ ] 이미 ACCEPTED relationship이면 duplicate request를 만들지 않는다.

## 16.3 Online Status

- [ ] `lastActiveAt`은 server-side authenticated activity로 갱신된다.
- [ ] client가 arbitrary lastActiveAt을 제출하지 않는다.
- [ ] 120초 이내 activity면 Online이다.
- [ ] Friends UI polling interval은 30초다.
- [ ] Online/Offline은 색만으로 표현하지 않는다.
- [ ] status text 또는 accessible label이 존재한다.

---

# 17. Gamification

## 17.1 XP

- [ ] Lesson 1–5 reward가 각각 `100 / 140 / 180 / 220 / 260 XP`다.
- [ ] Quest 1–5 reward가 각각 `140 / 180 / 220 / 260 / 300 XP`다.
- [ ] 모든 Daily Challenge template reward가 `80 XP`다.
- [ ] Achievement reward가 fixed seed table과 일치한다.
- [ ] XP는 server-side completion definition에서 결정된다.
- [ ] client request가 xp/xpReward를 제출해 지급량을 결정하지 않는다.
- [ ] Lesson first completion만 reward한다.
- [ ] Quest first completion만 reward한다.
- [ ] Daily same date/challenge reward는 한 번만 지급한다.
- [ ] Achievement unlock reward는 unique unlock당 한 번만 지급한다.
- [ ] XP update는 atomic하다.

## 17.2 Level

- [ ] `XP_TO_REACH_LEVEL(L) = 30 × L × (L - 1)`가 구현되어 있다.
- [ ] `nextLevelXp = 60 × currentLevel`이다.
- [ ] Level은 XP에서 derived된다.
- [ ] DB User row에 independent level source field가 없다.
- [ ] Frontend/Backend가 같은 formula를 사용한다.
- [ ] 같은 XP면 항상 같은 level이다.
- [ ] progressPercent가 0–100 범위다.

## 17.3 Streak

- [ ] qualifying activity는 Lesson first completion이다.
- [ ] qualifying activity는 Quest first completion이다.
- [ ] qualifying activity는 Daily first completion이다.
- [ ] `Asia/Seoul` dateKey를 사용한다.
- [ ] 같은 날짜 여러 completion이 streak를 여러 번 증가시키지 않는다.
- [ ] 전날 activity면 streak +1이다.
- [ ] gap이 있으면 streak를 1로 시작한다.

## 17.4 Achievements

- [ ] fixed Achievement seed가 정확히 10개다.
- [ ] 각 key/category/rule/xp/iconKey가 DATA_CONTRACTS table과 일치한다.
- [ ] 각 Achievement에 ko/en/ja title과 description이 있다.
- [ ] Achievement list page가 있다.
- [ ] unlocked/locked 상태가 보인다.
- [ ] progress/condition이 표시된다.
- [ ] unlockedAt을 표시할 수 있다.
- [ ] unique unlock constraint가 있다.
- [ ] duplicate unlock으로 XP가 중복 지급되지 않는다.

## 17.5 Module Evidence

Gamification module 증거로 최소 3개 이상이 실제 동작해야 한다.

- [ ] XP / Level
- [ ] Achievements
- [ ] Daily Challenge
- [ ] Streak

---

# 18. Bookmarks

## 18.1 Internal UI

- [ ] Lessons tab이 있다.
- [ ] Quests tab이 있다.
- [ ] Commands tab이 있다.
- [ ] 각 tab count가 표시된다.
- [ ] bookmark target으로 이동할 수 있다.
- [ ] bookmark remove가 동작한다.

## 18.2 Integrity

- [ ] `(userId, targetType, targetId)`가 unique다.
- [ ] 존재하지 않는 target을 bookmark하지 않는다.
- [ ] 다른 user의 bookmark를 읽거나 삭제할 수 없다.

---

# 19. API Keys

## 19.1 Management

- [ ] `/profile/api-keys`가 authenticated-only다.
- [ ] label을 입력해 key를 생성할 수 있다.
- [ ] key list를 볼 수 있다.
- [ ] key를 revoke할 수 있다.
- [ ] revoke 시 row를 삭제하지 않고 `revokedAt`을 기록한다.
- [ ] 동일 key를 다시 revoke해도 204로 idempotent하게 처리한다.
- [ ] revoked key가 목록에 `Revoked` 상태로 남는다.
- [ ] revoked key로 Public API 인증이 불가능하다.
- [ ] `/api/docs` link가 있다.

## 19.2 Secret Handling

- [ ] raw key는 생성 response에서 한 번만 표시된다.
- [ ] 이후 GET에서 raw key를 반환하지 않는다.
- [ ] raw key entropy는 최소 32 random bytes다.
- [ ] display prefix는 `gnp_`다.
- [ ] DB에는 raw key를 저장하지 않는다.
- [ ] `HMAC-SHA-256(API_KEY_HMAC_SECRET, rawKey)`를 저장한다.
- [ ] application log에 raw key를 기록하지 않는다.

---

# 20. Public API Major Module

## 20.1 Separation

- [ ] base path는 `/api/v1/public`이다.
- [ ] internal Frontend API와 분리된다.
- [ ] `X-API-Key` 인증을 요구한다.

## 20.2 Required Endpoints

- [ ] `GET /api/v1/public/bookmarks`
- [ ] `GET /api/v1/public/bookmarks/:id`
- [ ] `POST /api/v1/public/bookmarks`
- [ ] `PUT /api/v1/public/bookmarks/:id`
- [ ] `DELETE /api/v1/public/bookmarks/:id`

- [ ] GET method가 실제 동작한다.
- [ ] POST method가 실제 동작한다.
- [ ] PUT method가 실제 동작한다.
- [ ] DELETE method가 실제 동작한다.
- [ ] 실제 PostgreSQL data와 상호작용한다.

## 20.3 Authorization

- [ ] API key owner의 bookmark scope로 제한된다.
- [ ] XP를 public API로 변경할 수 없다.
- [ ] Level을 public API로 변경할 수 없다.
- [ ] Lesson Progress를 public API로 변경할 수 없다.
- [ ] Quest Progress를 public API로 변경할 수 없다.
- [ ] Daily completion을 public API로 변경할 수 없다.
- [ ] Achievement unlock을 public API로 변경할 수 없다.
- [ ] Friendship을 public API로 변경할 수 없다.

## 20.4 Rate Limiting

- [ ] valid API key record ID를 counter key로 사용한다.
- [ ] 60 requests / 60 seconds limit이 동작한다.
- [ ] 초과 시 429를 반환한다.
- [ ] error code가 `RATE_LIMIT_EXCEEDED`다.
- [ ] `Retry-After` header를 제공한다.

## 20.5 Documentation

- [ ] OpenAPI/Swagger documentation이 존재한다.
- [ ] Public API authentication 방법이 문서화되어 있다.
- [ ] 5개 endpoint의 request/response가 문서화되어 있다.
- [ ] error response가 문서화되어 있다.
- [ ] rate-limit behavior가 문서화되어 있다.

---

# 21. Command Catalog / Reference Data Boundary

- [ ] guest-safe command registry가 `packages/shared`에 있다.
- [ ] registry에 key/name/syntax/category/simulatorSupported/shortDescription/shortExample가 있다.
- [ ] authenticated detailed Reference content는 DB `CommandReference`에서 관리된다.
- [ ] seed가 `CommandKey`로 registry/reference를 연결한다.
- [ ] Practice는 `CommandGuideItem` projection만 사용한다.
- [ ] Reference list는 `CommandReferenceListItem`을 사용한다.
- [ ] Reference detail은 `CommandReferenceDetail`을 사용한다.
- [ ] removed legacy `CommandDefinition` type이 실제 code에 남지 않는다.

---

# 22. Custom Git Simulator Major Module

## 22.1 Architecture

- [ ] `executeCommand(state, command)`가 pure function 구조다.
- [ ] 실제 shell command를 실행하지 않는다.
- [ ] 실제 Git binary에 의존하지 않는다.
- [ ] Simulator state가 serializable하다.
- [ ] same state + same command가 deterministic result를 만든다.
- [ ] commit ID 생성이 deterministic하다.
- [ ] random/timestamp commit ID를 사용하지 않는다.

## 22.2 RepositoryState

- [ ] currentBranch
- [ ] headCommitId
- [ ] branches
- [ ] commits
- [ ] workingTree
- [ ] stagingArea
- [ ] remotes
- [ ] remoteTrackingBranches
- [ ] mergeState
- [ ] nextCommitSequence

가 상태 모델에 존재한다.

## 22.3 Commit Model

- [ ] commit id가 있다.
- [ ] message가 있다.
- [ ] parentIds가 있다.
- [ ] file snapshot이 있다.
- [ ] merge commit은 multiple parent를 표현할 수 있다.

## 22.4 Supported Commands

최소 다음 command가 실제 state를 기반으로 동작한다.

- [ ] `git status`
- [ ] `git add`
- [ ] `git commit`
- [ ] `git log`
- [ ] `git diff`
- [ ] `git diff --staged`
- [ ] `git branch`
- [ ] `git switch`
- [ ] `git checkout`
- [ ] `git merge`
- [ ] `git fetch`
- [ ] `git pull`
- [ ] `git push`

Help:

- [ ] `help`
- [ ] `git --help`
- [ ] `git help`
- [ ] `git help <command>`

## 22.5 Working Tree / Staging / Diff

- [ ] Working Tree와 Staging Area를 별도 상태로 관리한다.
- [ ] `git add`가 staged snapshot을 변경한다.
- [ ] commit이 staging snapshot 기준으로 생성된다.
- [ ] `git diff`는 Working Tree vs Staging Area다.
- [ ] `git diff --staged`는 Staging Area vs HEAD snapshot이다.
- [ ] added/modified/deleted diff를 표현한다.
- [ ] HEAD → stagingArea 적용 → workingTree 적용 순서로 전체 snapshot을 복원한다.
- [ ] 각 변경분 배열의 path는 유일하며, 누락된 path는 기준 snapshot에서 상속한다.
- [ ] 일부 파일만 stage/commit해도 기존의 다른 파일이 새 commit에 보존된다.
- [ ] add 후 재편집한 파일을 commit하면 staged 내용이 저장되고 나머지 수정은 workingTree에 남는다.
- [ ] 삭제를 stage하면 staged diff에 삭제가 나타나고 commit에서 해당 path만 제거된다.
- [ ] untracked 파일은 add 전 일반 diff에서 제외되고 add 후 staged diff에 나타난다.

## 22.6 Branch / HEAD

- [ ] branch create가 동작한다.
- [ ] branch switch가 동작한다.
- [ ] checkout supported behavior가 동작한다.
- [ ] HEAD/currentBranch 관계가 일관된다.
- [ ] branch pointer가 commit graph와 동기화된다.

## 22.7 Merge

- [ ] fast-forward 가능 상황을 처리한다.
- [ ] merge commit이 필요한 상황을 처리한다.
- [ ] parent relationship이 올바르다.
- [ ] conflict 가능 상황을 표현한다.
- [ ] conflicted WorkingFileState가 생성된다.
- [ ] conflict resolution 후 resolved staged state를 만들 수 있다.
- [ ] merge completion 후 mergeState가 종료된다.
- [ ] `CONFLICT_RESOLVED` event를 발생시킬 수 있다.

## 22.8 Remote

- [ ] virtual remote repository state가 local state와 분리된다.
- [ ] remote-tracking branch가 virtual remote와 분리된다.
- [ ] `fetch`가 remote-tracking branch를 갱신한다.
- [ ] `pull`이 fetch + integration semantics를 구현한다.
- [ ] `push`가 virtual remote branch를 갱신한다.
- [ ] remote-ahead / local-ahead 상태를 표현할 수 있다.
- [ ] Branch seed와 새 branch에 upstream을 명시하며 기본값은 null이다.
- [ ] `git push -u origin feature/login` 성공 후 해당 branch의 upstream이 저장된다.
- [ ] 이후 인자 없는 push/pull은 저장된 upstream을 사용하고 branch 전환 후에도 설정이 유지된다.
- [ ] 명시적 remote/branch push/pull은 `-u` 없는 경우 upstream을 변경하지 않는다.
- [ ] upstream 없는 인자 없는 push/pull은 `NO_UPSTREAM`으로 실패한다.
- [ ] remote/branch 누락과 non-fast-forward push 오류가 계약된 errorCode를 반환한다.
- [ ] 실패한 push는 remote state와 upstream을 변경하지 않는다.
- [ ] 인자 없는 fetch는 upstream remote 또는 origin을 사용한다.

## 22.9 Result / Error

- [ ] result에 `success`가 있다.
- [ ] result에 `nextState`가 있다.
- [ ] result에 human-readable output이 있다.
- [ ] errorCode를 표현할 수 있다.
- [ ] simulator events를 반환한다.
- [ ] invalid command 결과가 previous state를 변경하지 않는다.

## 22.10 Reuse

- [ ] Learn Practice가 같은 engine을 사용한다.
- [ ] Practice가 같은 engine을 사용한다.
- [ ] Quest가 같은 engine을 사용한다.
- [ ] Daily Challenge가 같은 engine을 사용한다.
- [ ] page별로 Git semantics를 별도 구현하지 않는다.

---

# 23. Git Graph / Repo State UI

## 23.1 Git Graph

- [ ] commit node가 보인다.
- [ ] parent edge가 보인다.
- [ ] branch lane이 보인다.
- [ ] branch label이 보인다.
- [ ] HEAD가 즉시 식별된다.
- [ ] local branch와 remote-tracking label이 구분된다.
- [ ] commit message를 볼 수 있다.
- [ ] short commit ID를 볼 수 있다.
- [ ] branch identity가 색만으로 결정되지 않는다.
- [ ] simulator command 후 즉시 상태가 갱신된다.

## 23.2 Repo State

- [ ] Current Branch
- [ ] HEAD
- [ ] Working Tree
- [ ] Staging Area
- [ ] Conflicts
- [ ] Remote Tracking
- [ ] Merge State

를 관련 상황에서 볼 수 있다.

- [ ] file path는 monospace다.
- [ ] Untracked/Modified/Deleted/Staged/Conflicted/Resolved를 text/badge로 구분한다.

---

# 24. Localization

## 24.1 Languages

- [ ] Korean 전체 번역이 있다.
- [ ] English 전체 번역이 있다.
- [ ] Japanese 전체 번역이 있다.
- [ ] language selector에서 3개 언어를 전환할 수 있다.
- [ ] all user-facing UI labels가 translatable하다.
- [ ] Lesson content가 3개 언어를 지원한다.
- [ ] Quest content가 3개 언어를 지원한다.
- [ ] Daily Challenge content가 3개 언어를 지원한다.
- [ ] Reference content가 3개 언어를 지원한다.

## 24.2 Domain Translation Storage

- [ ] UI labels는 i18next resource에서 관리된다.
- [ ] Lesson localized content는 JSONB `LocalizedText`로 저장된다.
- [ ] Quest localized content는 JSONB `LocalizedText`로 저장된다.
- [ ] Daily Challenge localized content는 JSONB `LocalizedText`로 저장된다.
- [ ] Reference localized content는 JSONB `LocalizedText`로 저장된다.
- [ ] translation table 방식과 JSONB 방식이 혼재하지 않는다.

## 24.3 Syntax Boundary

- [ ] Git command syntax를 번역하지 않는다.
- [ ] branch name을 번역하지 않는다.
- [ ] commit hash를 번역하지 않는다.
- [ ] file path를 번역하지 않는다.
- [ ] remote name을 번역하지 않는다.

## 24.4 Persistence

- [ ] Guest language preference가 browser에 유지된다.
- [ ] Authenticated language preference가 User data에 유지된다.
- [ ] 로그인 후 user preference와 UI state가 일관된다.

## 24.5 Layout

- [ ] Korean text에서 button/card가 깨지지 않는다.
- [ ] English text에서 wrapping이 정상이다.
- [ ] Japanese text에서 layout이 깨지지 않는다.
- [ ] fixed-width text clipping 때문에 핵심 내용이 사라지지 않는다.

---

# 25. PWA

## 25.1 Installability

- [ ] Web App Manifest가 있다.
- [ ] app name이 있다.
- [ ] short name이 있다.
- [ ] app icons가 있다.
- [ ] theme/background metadata가 있다.
- [ ] standalone display mode다.
- [ ] Service Worker가 등록된다.
- [ ] 지원 브라우저에서 installable로 인식된다.

## 25.2 Offline Available Scope

Offline에서:

- [ ] app shell이 열린다.
- [ ] static assets가 열린다.
- [ ] i18n assets가 열린다.
- [ ] Guest-safe Lesson 1–3 content가 열린다.
- [ ] guest-safe Practice Command Guide가 열린다.
- [ ] Practice shell이 열린다.
- [ ] Free Sandbox가 열린다.
- [ ] client-side simulator가 동작한다.

## 25.3 Private Cache Security

Service Worker persistent cache에 다음을 저장하지 않는다.

- [ ] Profile
- [ ] account/email data
- [ ] Friends
- [ ] friend requests
- [ ] Bookmarks
- [ ] user achievements/progress
- [ ] XP/streak
- [ ] API key data
- [ ] authenticated Reference detail
- [ ] protected Lesson 4–5
- [ ] auth/OAuth responses
- [ ] Set-Cookie response

## 25.4 Offline Mutation UX

Offline에서:

- [ ] profile mutation을 fake success 처리하지 않는다.
- [ ] bookmark mutation을 fake success 처리하지 않는다.
- [ ] friend mutation을 fake success 처리하지 않는다.
- [ ] progress/XP persistence를 fake success 처리하지 않는다.
- [ ] avatar upload를 fake success 처리하지 않는다.
- [ ] network-required action에 명확한 offline notice를 표시한다.

## 25.5 Strategy / Update

- [ ] hashed static asset은 precache/CacheFirst 계열이다.
- [ ] guest-safe Lesson GET은 NetworkFirst + cached fallback이다.
- [ ] private API는 NetworkOnly/no-store다.
- [ ] service worker `registerType=prompt` 정책이 동작한다.
- [ ] 새 version이 있으면 update UI를 표시한다.
- [ ] 사용자가 confirm하면 새 worker로 reload한다.
- [ ] logout 시 user-specific runtime/query cache를 purge한다.

---

# 26. Privacy / Terms

## 26.1 Privacy

- [ ] `/privacy`가 존재한다.
- [ ] Guest도 접근 가능하다.
- [ ] footer에서 쉽게 접근 가능하다.
- [ ] placeholder가 아니다.
- [ ] 실제 GitneaPig가 수집하는 data category를 설명한다.
- [ ] email/password auth를 설명한다.
- [ ] 42 OAuth를 설명한다.
- [ ] avatar를 설명한다.
- [ ] progress/XP/achievement를 설명한다.
- [ ] bookmarks/friends를 설명한다.
- [ ] cookies/session을 설명한다.
- [ ] data security/retention 관련 내용을 실제 구현과 모순 없이 설명한다.

## 26.2 Terms

- [ ] `/terms`가 존재한다.
- [ ] Guest도 접근 가능하다.
- [ ] footer에서 쉽게 접근 가능하다.
- [ ] placeholder가 아니다.
- [ ] educational Git simulator의 성격을 설명한다.
- [ ] simulator가 real Git implementation과 완전히 동일하지 않을 수 있음을 설명한다.
- [ ] acceptable use를 설명한다.
- [ ] gamification reward가 monetary value가 없음을 설명한다.
- [ ] GitHub/42 공식 서비스로 오인되지 않게 한다.

---

# 27. Validation / Error Handling

## 27.1 Frontend + Backend Validation

모든 user input은:

- [ ] Frontend에서 검증된다.
- [ ] Backend에서 다시 검증된다.
- [ ] Backend validation이 authoritative하다.

대상:

- [ ] signup
- [ ] login
- [ ] nickname
- [ ] avatar upload
- [ ] Reference search
- [ ] friend search/request
- [ ] bookmark target
- [ ] API key label
- [ ] pagination
- [ ] query/filter/sort enum

## 27.2 Error Contract

- [ ] API error가 일관된 shape를 사용한다.
- [ ] raw stack trace를 client에 반환하지 않는다.
- [ ] backend raw exception message를 UI에 그대로 노출하지 않는다.
- [ ] 400/401/403/404/409/413/429/500을 일관되게 사용한다.
- [ ] recoverable page error에는 Retry가 있다.
- [ ] mutation loading 중 duplicate submit을 막는다.

---

# 28. Database / Prisma

## 28.1 Required Models

- [ ] User
- [ ] Lesson
- [ ] LessonProgress
- [ ] Quest
- [ ] QuestProgress
- [ ] DailyChallenge
- [ ] DailyChallengeTemplate
- [ ] DailyChallengeProgress
- [ ] Achievement
- [ ] UserAchievement
- [ ] Bookmark
- [ ] Friendship
- [ ] ApiKey
- [ ] CommandReference

## 28.2 Identity / Uniqueness

- [ ] normalizedEmail unique
- [ ] normalizedNickname unique
- [ ] oauth42Subject unique
- [ ] LessonProgress user+lesson unique
- [ ] QuestProgress user+quest unique
- [ ] DailyChallenge dateKey unique
- [ ] DailyChallengeProgress user/challenge/date unique
- [ ] UserAchievement user+achievement unique
- [ ] Bookmark user/target unique
- [ ] Friendship canonical pair unique

## 28.3 Security-sensitive Storage

- [ ] passwordHash만 저장한다.
- [ ] 42 access token을 장기 저장하지 않는다.
- [ ] raw API key를 저장하지 않는다.
- [ ] avatar binary를 DB에 저장하지 않는다.
- [ ] level을 source field로 저장하지 않는다.

---

# 29. Concurrency / Multi-user

## 29.1 Multi-user Mandatory

- [ ] 두 사용자가 동시에 로그인할 수 있다.
- [ ] 두 사용자가 동시에 기능을 사용할 수 있다.
- [ ] 서로의 progress가 섞이지 않는다.
- [ ] 서로의 bookmarks가 섞이지 않는다.
- [ ] 서로의 API keys가 섞이지 않는다.
- [ ] 서로의 profile/avatar가 섞이지 않는다.

## 29.2 Completion Races

동일 account로 concurrent duplicate completion을 발생시켜:

- [ ] Lesson XP가 한 번만 지급된다.
- [ ] Quest XP가 한 번만 지급된다.
- [ ] Daily XP가 한 번만 지급된다.
- [ ] Achievement XP가 한 번만 지급된다.
- [ ] streak가 같은 날 중복 증가하지 않는다.

## 29.3 Friendship Race

A와 B가 동시에 request:

- [ ] 하나의 canonical friendship relation만 생긴다.
- [ ] duplicate pending row가 생기지 않는다.
- [ ] 500/unhandled unique error로 끝나지 않는다.

## 29.4 Daily Assignment Race

동일 dateKey 첫 요청을 동시에 보내도:

- [ ] DailyChallenge row가 하나만 생성된다.
- [ ] 모든 caller가 같은 assignment를 받는다.

## 29.5 Transaction Behavior

- [ ] completion-sensitive transaction은 Serializable isolation을 사용한다.
- [ ] serialization conflict retry가 최대 3회다.
- [ ] retry 이후에도 처리되지 않는 경우 일관된 domain error를 반환한다.
- [ ] partially applied XP/completion 상태가 남지 않는다.

---

# 30. Security

- [ ] password/API secret이 log에 노출되지 않는다.
- [ ] OAuth state를 검증한다.
- [ ] safe returnTo만 허용한다.
- [ ] `//evil.com`, external URL returnTo를 거부한다.
- [ ] private API는 authorization을 server-side로 확인한다.
- [ ] 다른 user ID를 바꿔 보내도 타인 resource에 접근할 수 없다.
- [ ] API key auth에서 revoked/invalid key를 거부한다.
- [ ] uploaded filename path traversal이 불가능하다.
- [ ] private response에 `Cache-Control: no-store`를 적용한다.
- [ ] logout 후 previous authenticated data가 공용 PC cache에 남지 않는다.

---

# 31. Design System

## 31.1 Tokens

- [ ] Color palette가 중앙 token으로 관리된다.
- [ ] Typography가 중앙 정의된다.
- [ ] Spacing scale이 정의된다.
- [ ] Radius scale이 정의된다.
- [ ] icon family가 일관된다.
- [ ] page-specific arbitrary hex를 사용하지 않는다.

## 31.2 Reusable Components

최소 10개 이상이 실제 여러 화면에서 재사용된다.

- [ ] Button
- [ ] IconButton
- [ ] TextInput
- [ ] PasswordInput
- [ ] SearchInput
- [ ] Select/Dropdown
- [ ] Card
- [ ] Badge
- [ ] Tabs
- [ ] ProgressBar
- [ ] Dialog
- [ ] Tooltip
- [ ] EmptyState
- [ ] Alert
- [ ] Skeleton
- [ ] Breadcrumb
- [ ] Pagination
- [ ] Avatar
- [ ] StatusDot
- [ ] LanguageSelector

Product components:

- [ ] TerminalPanel
- [ ] GitGraphPanel
- [ ] RepoStatePanel
- [ ] CommandGuidePanel
- [ ] HintPanel
- [ ] ObjectiveList
- [ ] LockedContent
- [ ] MascotMessage

- [ ] component file만 만들고 실제 사용하지 않는 fake evidence가 없다.

---

# 32. Visual / Accessibility Quality

## 32.1 Global Style

- [ ] dark developer-tool visual direction을 유지한다.
- [ ] warm orange를 primary accent로 사용한다.
- [ ] orange를 대형 background 전체에 남용하지 않는다.
- [ ] Terminal/code/file path/hash는 monospace다.
- [ ] mascot은 functional content를 가리지 않는다.
- [ ] mascot이 저품질 placeholder/emoji 수준으로 최종 제출되지 않는다.
- [ ] User default/preset avatar는 Guinea Pig다.
- [ ] Learn의 character identity는 Guinea Pig다.
- [ ] Quest teammate/reviewer/virtual team member는 Guinea Pig다.
- [ ] 최종 character identity에 generic human avatar, human emoji, robot avatar, unrelated animal을 사용하지 않는다.
- [ ] 실제 인물이 아닌 System message만 neutral system icon을 사용할 수 있다.

## 32.2 Keyboard / Focus

- [ ] interactive control에 visible focus ring이 있다.
- [ ] Tab keyboard navigation이 가능하다.
- [ ] Dialog focus trap이 동작한다.
- [ ] Dialog close 후 focus가 원래 trigger로 돌아간다.
- [ ] icon-only button에 aria-label이 있다.

## 32.3 State Communication

- [ ] error를 red color만으로 표현하지 않는다.
- [ ] success를 green color만으로 표현하지 않는다.
- [ ] Online/Offline을 color만으로 표현하지 않는다.
- [ ] Locked/Current/Completed state에 text/icon label이 있다.
- [ ] touch target이 최소 40px 수준이다.

---

# 33. Loading / Empty / Error States

각 주요 page:

- [ ] Home
- [ ] Learn
- [ ] Practice
- [ ] Quest
- [ ] Daily Challenge
- [ ] Reference
- [ ] Profile
- [ ] Friends
- [ ] Achievements
- [ ] Bookmarks
- [ ] API Keys

에서 필요한 loading/error state가 구현되어 있다.

- [ ] auth initialization 중 Guest/Auth header flicker가 없다.
- [ ] layout skeleton이 과도한 shift를 만들지 않는다.
- [ ] No Bookmarks empty state가 있다.
- [ ] No Friends empty state가 있다.
- [ ] No Search Results state가 있다.
- [ ] critical error를 auto-dismiss toast 하나만으로 전달하지 않는다.

---

# 34. Internal REST API

## 34.1 Auth

- [ ] POST `/api/v1/auth/signup`
- [ ] POST `/api/v1/auth/login`
- [ ] POST `/api/v1/auth/logout`
- [ ] GET `/api/v1/auth/me`
- [ ] GET `/api/v1/auth/42`
- [ ] GET `/api/v1/auth/42/callback`
- [ ] POST `/api/v1/auth/42/onboarding`

## 34.2 Profile

- [ ] GET `/api/v1/profile`
- [ ] PATCH `/api/v1/profile`
- [ ] POST `/api/v1/profile/avatar`
- [ ] GET `/api/v1/profile/api-keys`
- [ ] POST `/api/v1/profile/api-keys`
- [ ] DELETE `/api/v1/profile/api-keys/:id`

## 34.3 Lessons

- [ ] GET `/api/v1/lessons`
- [ ] GET `/api/v1/lessons/:slug`
- [ ] PATCH `/api/v1/lessons/:id/progress`
- [ ] POST `/api/v1/lessons/:id/complete`

## 34.4 Quests

- [ ] GET `/api/v1/quests`
- [ ] GET `/api/v1/quests/:slug`
- [ ] POST `/api/v1/quests/:id/complete`

## 34.5 Daily

- [ ] GET `/api/v1/daily-challenge/today`
- [ ] POST `/api/v1/daily-challenge/:id/complete`

## 34.6 Achievements

- [ ] GET `/api/v1/achievements`
- [ ] GET `/api/v1/profile/achievements`

## 34.7 Bookmarks

- [ ] GET `/api/v1/bookmarks`
- [ ] POST `/api/v1/bookmarks`
- [ ] DELETE `/api/v1/bookmarks/:id`

## 34.8 Friends

- [ ] GET `/api/v1/friends`
- [ ] GET `/api/v1/friends/requests`
- [ ] GET `/api/v1/users/search`
- [ ] POST `/api/v1/friends/requests`
- [ ] POST `/api/v1/friends/requests/:id/accept`
- [ ] DELETE `/api/v1/friends/requests/:id`
- [ ] DELETE `/api/v1/friends/:userId`

## 34.9 Reference

- [ ] GET `/api/v1/reference/commands`
- [ ] GET `/api/v1/reference/commands/:key`

---

# 35. Automated Tests

## 35.1 Simulator Unit Tests

최소:

- [ ] parser valid command
- [ ] parser invalid command
- [ ] deterministic command behavior
- [ ] deterministic commit IDs
- [ ] status
- [ ] add
- [ ] commit
- [ ] log
- [ ] diff
- [ ] diff --staged
- [ ] branch
- [ ] switch
- [ ] checkout
- [ ] merge fast-forward
- [ ] merge commit
- [ ] merge conflict
- [ ] conflict resolution
- [ ] fetch
- [ ] pull
- [ ] push
- [ ] remote tracking

## 35.2 Backend Unit/Integration Tests

- [ ] signup normalization/uniqueness
- [ ] login
- [ ] session expiration
- [ ] OAuth state validation
- [ ] OAuth onboarding
- [ ] lesson completion idempotency
- [ ] quest completion idempotency
- [ ] daily completion idempotency
- [ ] streak
- [ ] achievement unlock idempotency
- [ ] bookmark uniqueness
- [ ] friendship canonical pair
- [ ] self friend rejection
- [ ] avatar validation
- [ ] API key create/revoke
- [ ] API key HMAC lookup
- [ ] public API authorization
- [ ] rate limiting
- [ ] Reference filter/sort/pagination
- [ ] Daily deterministic assignment
- [ ] private cache headers

## 35.3 E2E

Playwright로 최소 다음 user flow를 자동화한다.

- [ ] email signup → login → logout
- [ ] protected route redirect + returnTo
- [ ] Learn lesson → practice → completion
- [ ] Practice playground selection → commands → reset
- [ ] Quest run → hint → complete
- [ ] Daily intro → workspace → complete
- [ ] Reference search/filter/sort/pagination
- [ ] bookmark create/remove
- [ ] profile nickname update
- [ ] avatar upload
- [ ] friend request → accept → remove
- [ ] API key create → public API request → revoke
- [ ] language switch
- [ ] Guest protected-content restriction
- [ ] PWA offline Free Sandbox where testable

---

# 36. Content Completeness

Codex가 layout만 만들고 내용이 빈 placeholder인 상태로 끝내지 않는다.

## 36.1 Lessons

- [ ] 5개 Lesson 모두 ko/en/ja content를 가진다.
- [ ] 각 Lesson에 Situation content가 있다.
- [ ] 각 Lesson에 Why content가 있다.
- [ ] 각 Lesson에 Concept content가 있다.
- [ ] 각 Lesson에 Command content가 있다.
- [ ] 각 Lesson에 Practice initialState/goal/successConditions가 있다.
- [ ] 각 Lesson에 Result copy가 있다.

## 36.2 Quests

- [ ] 5개 Quest 모두 story가 있다.
- [ ] 5개 Quest 모두 teammate/team data가 있다.
- [ ] 5개 Quest 모두 initialState가 있다.
- [ ] 5개 Quest 모두 objectives가 있다.
- [ ] 5개 Quest 모두 events가 있다.
- [ ] 5개 Quest 모두 successConditions가 있다.
- [ ] 5개 Quest 모두 4단계 수준의 hints를 가진다.
- [ ] 5개 Quest 모두 ko/en/ja content가 있다.

## 36.3 Daily Challenge

- [ ] evaluation date에 사용할 수 있는 template pool이 존재한다.
- [ ] 각 template에 localized scenario/title/goal이 있다.
- [ ] 각 template에 initialState가 있다.
- [ ] 각 template에 successConditions가 있다.
- [ ] 각 template에 progressive hints가 있다.
- [ ] exact solution이 default problem copy에 노출되지 않는다.

## 36.4 Command Reference

지원 command마다:

- [ ] syntax
- [ ] short description
- [ ] difficulty
- [ ] category
- [ ] when to use
- [ ] examples
- [ ] common mistakes
- [ ] related commands
- [ ] ko/en/ja text

가 충분히 seed되어 있다.

---

# 37. README / Evaluation Documentation

Subject v21.1의 README 요구사항까지 포함해 검증한다.

## 37.1 Language / Intro

- [ ] README는 English로 작성되어 있다.
- [ ] Subject가 요구하는 curriculum attribution first line을 정확히 포함한다.
- [ ] project overview가 있다.
- [ ] setup/run instructions가 있다.

## 37.2 Team Information

각 팀원:

- [ ] name/identifier
- [ ] assigned role(s)
- [ ] responsibilities

를 적는다.

Required role coverage:

- [ ] Product Owner
- [ ] Project Manager / Scrum Master
- [ ] Tech Lead / Architect
- [ ] Developers

## 37.3 Project Management

- [ ] work organization/task distribution을 설명한다.
- [ ] meetings/process를 설명한다.
- [ ] project management tool을 설명한다.
- [ ] communication channel을 설명한다.

## 37.4 Technical Stack

- [ ] Frontend stack
- [ ] Backend stack
- [ ] Database
- [ ] ORM
- [ ] Infrastructure
- [ ] significant libraries
- [ ] major technical choices justification

## 37.5 Database Schema

- [ ] DB schema visual 또는 명확한 description이 있다.
- [ ] table/model list가 있다.
- [ ] relationships가 설명되어 있다.
- [ ] key fields/data types가 설명되어 있다.

## 37.6 Features

- [ ] complete feature list가 있다.
- [ ] 각 feature가 무엇을 하는지 설명한다.
- [ ] 각 feature 담당 team member를 기록한다.

## 37.7 Modules

- [ ] 선택한 13개 module 항목을 나열한다.
- [ ] 각 Major/Minor를 표시한다.
- [ ] 각 point를 표시한다.
- [ ] total 16 points가 계산된다.
- [ ] 각 module 구현 방법을 설명한다.
- [ ] 각 module 담당자를 기록한다.
- [ ] Custom Git Simulator Major justification을 상세히 작성한다.

## 37.8 Individual Contributions

각 팀원:

- [ ] 실제 구현한 feature/module/component
- [ ] contribution breakdown
- [ ] challenge
- [ ] 해결 방법

을 기록한다.

## 37.9 Known Limitations

- [ ] simulator와 real Git 차이를 설명한다.
- [ ] browser-specific limitation을 설명한다.
- [ ] 평가자가 알아야 할 setup limitation을 설명한다.

---

# 38. Selected Module Score Gate

Target:

```text
16 points
```

## Web

- [ ] Frontend + Backend Framework — Major 2
- [ ] ORM — Minor 1
- [ ] Public API — Major 2
- [ ] Advanced Search — Minor 1
- [ ] Custom Design System — Minor 1
- [ ] PWA — Minor 1

## Accessibility / Internationalization

- [ ] Multiple Languages — Minor 1
- [ ] Additional Browsers — Minor 1

## User Management

- [ ] Standard User Management — Major 2
- [ ] 42 OAuth — Minor 1

## Gaming / UX

- [ ] Gamification — Minor 1

## Modules of Choice

- [ ] Custom Git Simulator — Major 2

## Total

- [ ] 완전히 기능하는 module 기준 total이 16점이다.
- [ ] 하나의 incomplete/nonfunctional module을 점수에 포함해 계산하지 않는다.
- [ ] Custom Simulator Major가 evaluator에게 기술적 복잡성을 입증할 수 있다.

---

# 39. Manual Evaluation Demo Script

평가 직전 최소 다음 순서로 한번에 시연한다.

- [ ] fresh `docker compose up --build`
- [ ] Home
- [ ] signup/login
- [ ] Learn lesson
- [ ] Lesson Practice + Graph
- [ ] Practice category playground
- [ ] Quest
- [ ] Daily Challenge
- [ ] Reference advanced search
- [ ] Bookmark
- [ ] Profile/avatar
- [ ] Friend request + online status
- [ ] Achievement/XP/Level/Streak
- [ ] 42 OAuth
- [ ] API key creation
- [ ] Public API + docs
- [ ] PWA install/offline
- [ ] ko/en/ja switch
- [ ] Firefox
- [ ] Edge
- [ ] Privacy
- [ ] Terms
- [ ] browser console clean
- [ ] README module explanation
- [ ] Custom Simulator architecture explanation

---

# 40. Final Release Gate

Codex 또는 팀이 "완료"라고 판단하기 전에:

- [ ] Section 0의 fixed specification values와 실제 구현이 일치한다.
- [ ] 전체 automated test suite가 통과한다.
- [ ] Docker clean build가 통과한다.
- [ ] Prisma migration이 fresh DB에서 성공한다.
- [ ] Seed가 fresh DB에서 성공한다.
- [ ] Chrome console error/warning이 없다.
- [ ] Firefox 핵심 기능이 통과한다.
- [ ] Edge 핵심 기능이 통과한다.
- [ ] HTTPS가 동작한다.
- [ ] Guest/Auth access boundary가 통과한다.
- [ ] concurrent duplicate reward test가 통과한다.
- [ ] API key/raw secret leakage가 없다.
- [ ] PWA private cache leakage가 없다.
- [ ] Privacy/Terms가 실제 content다.
- [ ] README가 Subject 요구를 충족한다.
- [ ] 16점 Module 각각을 실제로 시연할 수 있다.
- [ ] 팀원 전원이 자신의 code와 핵심 architecture를 설명할 수 있다.

---

# 41. Definition of Done

GitneaPig는 다음이 모두 참일 때 완료로 본다.

```text
Functional
+ Secure
+ Responsive
+ Multi-user safe
+ Testable
+ Offline-aware
+ Fully localized
+ Module-evaluable
+ Documented
+ Explainable by the team
```

단순히 화면이 존재하거나 route가 열리는 것만으로 완료로 보지 않는다.

각 기능은:

```text
Visible UI
+
Working interaction
+
Correct persistence/state
+
Error handling
+
Authorization
+
Relevant tests
```

까지 충족해야 한다.
