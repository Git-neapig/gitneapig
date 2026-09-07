# GitneaPig Architecture

> 목적: 팀원이 GitneaPig의 전체 구조와 각 영역의 역할을 빠르게 이해하기 위한 요약 문서다.
>
> 이 문서는 구현 세부사항의 Source of Truth가 아니다. 세부 구현 기준은 아래 문서를 따른다.
>
> - `docs/spec/MASTER_SPEC.md` — 기능/사용자 흐름
> - `docs/spec/DATA_CONTRACTS.md` — API/DB/Simulator/보안/동시성
> - `docs/spec/DESIGN_SYSTEM.md` — UI/Responsive/공통 Component
> - `docs/spec/ACCEPTANCE_CHECKLIST.md` — 완료/검증 기준

---

# 1. Product

GitneaPig는 Git/GitHub 협업을 학습하는 인터랙티브 웹 서비스다.

핵심 학습 흐름:

```text
실제 협업 상황
    ↓
왜 문제가 생기는지 이해
    ↓
Git 개념 학습
    ↓
명령어 학습
    ↓
가상 Repository에서 직접 실행
    ↓
협업 시나리오에서 스스로 판단
```

메인 마스코트는 Guinea Pig이며,
학습 상황 설명, Quest teammate, 피드백, Profile/Achievement visual에 사용한다.

---

# 2. Main Product Areas

```text
GitneaPig
│
├─ Home
│  └─ 서비스 소개 / 다음 학습 경로
│
├─ Learn
│  └─ Situation → Why? → Concept → Command → Practice → Result
│
├─ Practice
│  └─ 자유 Git Simulator sandbox
│
├─ Quest
│  └─ 실제 협업에 가까운 Git/GitHub 시나리오
│
├─ Daily Challenge
│  └─ 매일 짧은 Git 문제
│
├─ Reference
│  └─ Git command 검색 / filter / sort / pagination
│
├─ Profile
│  └─ XP / Level / Streak / Achievement / Lesson Progress
│
├─ Friends
│  └─ Friend Request / Friend List / Online Status
│
├─ Achievements
│  └─ persistent achievement progression
│
├─ Bookmarks
│  └─ Lesson / Quest / Command 저장
│
└─ API Keys
   └─ Public API access key 관리
```

---

# 3. Technology Stack

## Language

```text
TypeScript
```

Frontend / Backend / Simulator / Shared contract 전반에서 사용한다.

## Frontend

```text
React
Vite
TypeScript
Tailwind CSS
React Router
i18next / react-i18next
vite-plugin-pwa
```

## Backend

```text
NestJS 11
Express Adapter
TypeScript
```

## Database / ORM

```text
PostgreSQL
Prisma
```

## Authentication

```text
Email + Password
42 OAuth 2.0
JWT
HttpOnly Cookie
Argon2
```

## Test

```text
Vitest      → Frontend / Simulator
Jest        → Backend
Playwright  → E2E
```

## Infrastructure

```text
Docker Compose
Nginx
HTTPS
Docker named volume for avatar uploads
```

Runtime / package manager:

```text
Node.js 22
pnpm
```

---

# 4. Repository Structure

최종 프로젝트는 pnpm monorepo로 구성한다.

```text
gitneapig/
│
├─ apps/
│  ├─ frontend/
│  └─ backend/
│
├─ packages/
│  ├─ simulator/
│  └─ shared/
│
├─ docs/
│  ├─ architecture.md
│  ├─ workflow.md
│  ├─ CODEX_IMPLEMENTATION_START_PROMPT.md
│  │
│  ├─ spec/
│  │  ├─ MASTER_SPEC.md
│  │  ├─ DATA_CONTRACTS.md
│  │  ├─ DESIGN_SYSTEM.md
│  │  └─ ACCEPTANCE_CHECKLIST.md
│  │
│  └─ implementation/
│     └─ IMPLEMENTATION_PLAN.md
│
├─ pnpm-workspace.yaml
├─ package.json
├─ docker-compose.yml
├─ .env.example
├─ .gitignore
└─ README.md
```

`apps/`, `packages/`는 구현하면서 생성된다.
비어 있는 directory를 미리 만들기 위해 placeholder file을 둘 필요는 없다.

---

# 5. System Architecture

```text
                           Browser
                              │
                            HTTPS
                              │
                              ▼
                         ┌─────────┐
                         │  Nginx  │
                         └────┬────┘
                              │
                 ┌────────────┴────────────┐
                 │                         │
                 ▼                         ▼
         React Frontend              NestJS Backend
         TypeScript                  TypeScript
                 │                         │
                 │                         ▼
                 │                      Prisma
                 │                         │
                 │                         ▼
                 │                    PostgreSQL
                 │
                 ▼
        Pure TypeScript Simulator
        (`packages/simulator`)
```

Browser에서 backend로 가는 연결은 HTTPS를 사용한다.

Backend 내부의 DB 연결은 Docker internal network를 사용한다.

---

# 6. Shared Packages

## 6.1 `packages/simulator`

GitneaPig의 핵심 Custom Module이다.

실제 shell 또는 Git binary를 실행하지 않고,
가상의 Git RepositoryState를 TypeScript로 변경한다.

핵심 형태:

```ts
executeCommand(
  state: RepositoryState,
  command: string
): SimulatorResult
```

주요 책임:

```text
Command parsing
Repository state transition
Working Tree / Staging Area
Commit graph
Branch / HEAD
Merge
Conflict
Remote / Remote-tracking
Fetch / Pull / Push
Condition evaluation
Simulator events
```

같은 Engine을 다음 기능에서 재사용한다.

```text
Learn Practice
Practice
Quest
Daily Challenge
```

페이지마다 Git 동작을 따로 구현하지 않는다.

---

## 6.2 `packages/shared`

Frontend / Backend / Simulator에서 공통으로 사용하는 contract를 관리한다.

예:

```text
CommandKey
API DTO-compatible shared types
LocalizedText
Pagination types
Level calculation
Simulator-related shared definitions
```

공통 Command Registry도 이 영역에서 관리한다.

```text
Command Registry
    ├─ Simulator parser / handler metadata
    ├─ Practice Command Guide
    └─ Backend CommandReference seed 연결
```

---

# 7. Simulator State Model

Simulator는 최소 다음 상태를 표현한다.

```text
Current Branch
HEAD
Commit Graph
Working Tree
Staging Area
Remote Repository
Remote-tracking Branch
Merge State
Conflict State
```

대표 지원 command:

```text
git status
git add
git commit
git log
git diff
git diff --staged
git branch
git switch
git checkout
git merge
git fetch
git pull
git push
```

결과는 deterministic해야 한다.

```text
같은 RepositoryState
+
같은 Command
=
같은 nextState / output / event / commit ID
```

---

# 8. Frontend Architecture

Frontend의 주요 책임:

```text
Routing
UI rendering
Simulator interaction
Auth state
i18n
PWA
API integration
Responsive layout
```

Design System은 다음 순서로 구현한다.

```text
Design Token
    ↓
Generic Reusable Components
    ↓
Product Components
    ↓
Page Composition
```

대표 Product Component:

```text
TerminalPanel
GitGraphPanel
RepoStatePanel
CommandGuidePanel
HintPanel
ObjectiveList
MascotMessage
```

Terminal history가 길어져도 page 전체가 무한히 길어지지 않고
Terminal 내부에 scroll이 생겨야 한다.

---

# 9. Backend Architecture

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

주요 domain:

```text
Auth
Profile
Avatar
Lessons
Quests
Daily Challenge
Achievements
Bookmarks
Friends
Reference
API Keys
Public API
```

Backend가 authoritative하게 처리하는 항목:

```text
Validation
Authorization
Ownership
Reward amount
XP / Streak
Achievement unlock
Concurrency
API key authentication
Rate limiting
```

Client가 보상 값이나 소유권을 결정하지 않는다.

---

# 10. Authentication

지원 방식:

```text
Email + Password
42 OAuth
```

Session:

```text
JWT
HttpOnly Cookie
Fixed 8-hour lifetime
```

42 OAuth 신규 사용자는 onboarding에서 nickname/avatar를 설정한 뒤
정상 User account를 생성한다.

OAuth provider email만으로 기존 email account에 자동 연결하지 않는다.

---

# 11. Database Overview

핵심 Prisma model:

```text
User
Lesson
LessonProgress
Quest
QuestProgress
DailyChallenge
DailyChallengeTemplate
DailyChallengeProgress
Achievement
UserAchievement
Bookmark
Friendship
ApiKey
CommandReference
```

관계 개요:

```text
User
 │
 ├── LessonProgress ───────── Lesson
 ├── QuestProgress ────────── Quest
 ├── DailyChallengeProgress ─ DailyChallenge
 ├── UserAchievement ──────── Achievement
 ├── Bookmark
 ├── Friendship ───────────── User
 └── ApiKey

CommandReference
→ authenticated Reference content
```

중복 reward가 발생할 수 있는 동작은 transaction과 unique constraint를 사용한다.

---

# 12. Localization

지원 언어:

```text
Korean
English
Japanese
```

UI label:

```text
i18next resources
```

Lesson / Quest / Daily Challenge / Reference domain content:

```text
PostgreSQL JSONB
Prisma.Json
LocalizedText { ko, en, ja }
```

Git syntax, file path, branch name, commit hash 등은 번역하지 않는다.

---

# 13. Gamification

고정 시스템:

```text
XP
Level
Achievements
Daily Challenge
Streak
```

Level은 DB에 독립적으로 저장하지 않고 XP에서 계산한다.

```text
XP_REQUIRED_WITHIN_LEVEL(L) = 60 × L
XP_TO_REACH_LEVEL(L) = 30 × L × (L - 1)
```

Achievement는 server-side persistent data로 검증 가능한 rule만 사용한다.

---

# 14. Friends / Online Status

Friendship은 canonical pair를 사용한다.

```text
userLowId
userHighId
requesterId
status: PENDING | ACCEPTED
```

Decline / sent-request cancel:

```text
PENDING row delete
```

Online Status:

```text
lastActiveAt
+
30-second polling
+
120-second online threshold
```

---

# 15. Public API

Internal API와 별도의 Public API를 제공한다.

```text
/api/v1/public
```

Authentication:

```text
X-API-Key
```

Bookmark resource에 대해 최소 다음 endpoint를 제공한다.

```http
GET    /api/v1/public/bookmarks
GET    /api/v1/public/bookmarks/:id
POST   /api/v1/public/bookmarks
PUT    /api/v1/public/bookmarks/:id
DELETE /api/v1/public/bookmarks/:id
```

추가 요구:

```text
API Key
Rate Limiting
OpenAPI / Swagger Documentation
```

API Key revoke는 `revokedAt`을 사용하는 soft revoke다.

---

# 16. PWA

PWA는 installable해야 하며 일부 Guest-safe 기능을 offline에서 사용할 수 있다.

Offline 가능 범위:

```text
App shell
Static assets
Guest-safe Lesson 1–3
Practice shell
Free Sandbox
Guest-safe Command Guide
Pure TS Simulator
```

Authenticated/private API response는 persistent Service Worker cache에 저장하지 않는다.

---

# 17. Deployment

최종 목표:

```bash
docker compose up --build
```

한 명령으로:

```text
Frontend
Backend
PostgreSQL
Nginx
HTTPS
Avatar volume
```

이 실행되어야 한다.

---

# 18. Selected Modules

GitneaPig는 총 16점을 목표로 한다.

| Category | Module | Point |
|---|---|---:|
| Web | Frontend + Backend Framework | 2 |
| Web | ORM | 1 |
| Web | Public API | 2 |
| Web | Advanced Search | 1 |
| Web | Custom Design System | 1 |
| Web | PWA | 1 |
| Accessibility / I18n | Multiple Languages | 1 |
| Accessibility / I18n | Additional Browsers | 1 |
| User Management | Standard User Management | 2 |
| User Management | 42 OAuth | 1 |
| Gaming / UX | Gamification | 1 |
| Modules of Choice | Custom Git Simulator | 2 |
|  | **Total** | **16** |

Incomplete module은 점수에 포함하지 않는다.

---

# 19. Documentation Hierarchy

팀원이 문서를 볼 때 다음 순서를 사용한다.

```text
architecture.md
→ 전체 구조 빠르게 이해

workflow.md
→ Git/GitHub 협업 규칙

MASTER_SPEC.md
→ 실제 기능 규칙

DATA_CONTRACTS.md
→ 실제 데이터/API/Simulator 규칙

DESIGN_SYSTEM.md
→ 실제 UI 규칙

ACCEPTANCE_CHECKLIST.md
→ 완료 여부 검증
```

architecture.md와 workflow.md가 상세 명세와 충돌하면
`docs/spec/`의 Source of Truth 문서를 따른다.
