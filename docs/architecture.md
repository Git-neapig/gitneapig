# gitneapig 프로젝트 설계 확정안 v3

> 목적: gitneapig를 **ft_transcendence 과제 제출 완성본**으로 구현하기 위해 기능 범위, 기술 스택, API 규칙, DB 구조, Simulator Interface, Lesson/Quest 데이터 구조, Git 협업 규칙을 하나의 기준으로 확정한다.
>
> 이 문서는 개발 기준안이다. 구현 중 과제 요구사항과의 충돌, 기술적 제약, 명확한 설계 결함이 발견되지 않는 한 이 기준을 따른다.

---

# 0. 프로젝트 이름

```text
서비스명
gitneapig

Repository
gitneapig
```

기니피그(Guinea Pig)와 Git을 결합한 이름으로, 서비스 전반의 기니피그 마스코트/캐릭터 시스템과 연결한다.

---

# 1. 프로젝트 개요

## 1.1 서비스 목표

gitneapig는 Git/GitHub 협업을 학습하는 인터랙티브 웹 서비스다.

단순히 Git 명령어를 암기시키는 것이 아니라 다음 흐름을 제공한다.

```text
실제 협업 상황
    ↓
왜 해당 Git 기능이 필요한지 이해
    ↓
관련 Git 개념 학습
    ↓
명령어 학습
    ↓
Simulator에서 직접 실행
    ↓
Quest에서 스스로 판단하여 사용
```

## 1.2 핵심 사용자 모드

사용자는 반드시 정해진 순서로 학습할 필요가 없다.

```text
gitneapig
│
├─ Learn
│  └─ 상황 → 개념 → 명령어 → 짧은 실습
│
├─ Practice
│  └─ Git Simulator 자유 실습
│
├─ Quest
│  └─ 가상 팀원과 Git/GitHub 협업 상황 해결
│
├─ Reference
│  └─ Git 개념 / 명령어 검색
│
└─ My Page
   └─ 학습 진행도 / XP / Achievement / Profile
```

---

# 2. 과제 제출 기능 범위

## 2.1 Authentication

구현 기능:

```text
회원가입
로그인
로그아웃
GitHub OAuth 로그인
```

기본 사용자 정보:

```text
email
password
nickname
avatar
```

원칙:

```text
비밀번호 평문 저장 금지
Frontend validation
Backend validation
JWT + HttpOnly Cookie 기반 인증
```

---

# 3. Learn

## 3.1 기본 Lesson

과제 제출본에서 최소 다음 5개의 핵심 Lesson을 구현한다.

```text
Lesson 1 — Git과 Repository

Lesson 2 — Working Directory / Staging Area / Commit

Lesson 3 — Branch

Lesson 4 — Merge

Lesson 5 — Remote / Fetch / Pull / Push
```

Lesson은 데이터 기반으로 구현한다.

따라서 프로젝트 진행 중 Lesson 제작 시간이 예상보다 적게 든다면 동일한 Renderer와 데이터 구조를 사용해 Lesson을 추가할 수 있다. Lesson 추가가 기존 페이지 로직을 새로 작성하는 작업이 되지 않도록 설계한다.

## 3.2 Lesson 기본 구조

모든 Lesson은 가능한 한 다음 구조를 따른다.

```text
① Situation
실제 협업 상황 제시

        ↓

② Why?
왜 문제가 발생하는지 설명

        ↓

③ Concept
Git 개념 설명

        ↓

④ Command
관련 Git 명령어 설명

        ↓

⑤ Mini Practice
Simulator에서 직접 명령 실행

        ↓

⑥ Result
Repository 상태 변화 확인
```

---

# 4. Practice — Git Simulator

## 4.1 핵심 원칙

gitneapig는 실제 OS Shell이나 실제 Git Repository를 사용자에게 제공하는 방식이 아니라, 교육용 **가상 Git Repository State Engine**을 구현한다.

```text
사용자 명령 입력
      ↓
Command Parser
      ↓
Git Simulator Engine
      ↓
Repository State 변경
      ↓
Terminal / Graph / Character Reaction 갱신
```

## 4.2 제출본 지원 명령어

```text
git status
git add
git commit
git log
git branch
git switch
git merge
git fetch
git pull
git push
```

세부 옵션은 Lesson과 Quest에서 실제 사용하는 범위부터 구현한다.

## 4.3 Simulator가 표현해야 하는 상태

```text
Working Directory
Staging Area
Commit
Branch
HEAD
Local Repository
Remote Repository
Remote-tracking Branch
Merge Conflict
```

최소한 화면에서 다음을 확인할 수 있어야 한다.

```text
현재 Branch
HEAD 위치
Commit Graph
Branch 위치
Remote 상태
Conflict 상태
```

---

# 5. Quest — Collaboration Simulation

## 5.1 핵심 원칙

Learn에서는 필요한 Git 개념과 명령어를 설명하지만, Quest에서는 사용자가 상황을 보고 스스로 어떤 Git 기능이 필요한지 판단하게 한다.

## 5.2 기본 Quest

과제 제출본에서 최소 다음 5개를 구현한다.

```text
Quest 1 — Feature Branch 만들기

Quest 2 — 변경사항 Staging / Commit

Quest 3 — Push + Pull Request

Quest 4 — 동료가 Remote를 먼저 변경한 상황 해결

Quest 5 — Merge Conflict 해결
```

Quest 완성도가 확보되면 동일한 Quest 구조를 이용해 Code Review 반영, 잘못된 Commit 수정 등의 시나리오를 추가할 수 있다.

## 5.3 GitHub 협업 Simulation 범위

Quest에 필요한 다음 기능을 구현한다.

```text
Issue
Pull Request
Code Review
Merge
Virtual Teammate Message
Mission
```

기본 학습 Flow:

```text
Issue
  ↓
Branch
  ↓
Commit
  ↓
Push
  ↓
Pull Request
  ↓
Code Review
  ↓
Merge
```

---

# 6. Guinea Pig Character System

gitneapig의 메인 마스코트는 **기니피그(Guinea Pig)** 로 통일한다.

## 6.1 사용 위치

```text
프로필 아바타
Quest 가상 팀원
Learn / Practice 피드백
Quest 성공 / 실패 / 경고 반응
Achievement 디자인
```

## 6.2 기본 캐릭터 상태

정적 이미지 기반으로 다음 상태를 표현한다.

```text
default
happy
confused
angry
celebrate
```

예:

```text
정상 명령
→ happy

지원하지 않는 명령
→ confused

협업 규칙상 잘못된 행동
→ angry

Quest 완료
→ celebrate
```

---

# 7. Progress / Gamification

## 7.1 Progress

DB에 저장:

```text
완료한 Lesson
완료한 Quest
Lesson 완료 시각
Quest 성공 여부
시도 횟수
Score
XP 변화
```

My Page에서 최소 다음을 표시한다.

```text
Lessons 진행도
Quests 진행도
Level
XP
Achievements
```

## 7.2 Gamification

과제의 Gamification Module 요구사항을 충족하도록 다음 3개를 구현한다.

```text
XP / Level
Achievements
Daily Challenge
```

예:

```text
First Commit
Branch Explorer
First Pull Request
Conflict Resolver
```

Gamification 정보는 DB에 영구 저장한다.

---

# 8. User Management

Standard User Management Module을 제출 범위에 포함한다.

구현 기능:

```text
Profile Page
Profile 정보 수정
Avatar 선택 또는 업로드
Friends 추가 / 삭제
Friends List
Online Status
GitHub OAuth
```

My Page에는 다음을 함께 표시한다.

```text
nickname
avatar
level
XP
completed lessons
completed quests
achievements
```

---

# 9. Reference / Advanced Search

## 9.1 검색 대상

```text
Git Concept
Git Command
Lesson
```

## 9.2 검색 기능

Advanced Search Module 요구사항을 충족하도록 다음을 구현한다.

```text
키워드 검색
Category Filter
Difficulty Filter
Sorting
Pagination
```

---

# 10. Public API

Frontend에서 사용하는 내부 API와 별도로 외부 클라이언트가 사용할 수 있는 Public API를 제공한다.

과제 요구사항을 안전하게 충족하기 위해 다음을 모두 구현한다.

```text
API Key 인증
Rate Limiting
API Documentation
최소 5 Endpoint
GET / POST / PUT / DELETE 포함
```

## 10.1 Public API Resource

쓰기 가능한 리소스로 **Bookmark**를 사용한다.

Bookmark는 사용자가 Lesson / Quest / Command 중 나중에 다시 보고 싶은 항목을 저장하는 기능이다.

```text
Bookmark

id
userId
targetType
targetId
note
createdAt
updatedAt
```

`targetType`:

```text
lesson
quest
command
```

## 10.2 Public API Endpoint

다음 5개를 기본 Public API로 제공한다.

```http
GET    /api/v1/public/bookmarks
GET    /api/v1/public/bookmarks/:id
POST   /api/v1/public/bookmarks
PUT    /api/v1/public/bookmarks/:id
DELETE /api/v1/public/bookmarks/:id
```

예:

```json
{
  "targetType": "lesson",
  "targetId": 4,
  "note": "merge conflict 공부할 때 다시 보기"
}
```

원칙:

```text
Public API는 API Key로 사용자 범위를 식별한다.
자신의 Bookmark만 조회/생성/수정/삭제할 수 있다.
Rate Limit을 적용한다.
Endpoint 사용법과 요청/응답 예제를 문서화한다.
```

Progress / XP / Achievement 같은 학습 결과 데이터는 Public API를 통해 임의 수정하지 않는다.

---

# 11. 기술 스택

## 11.1 Language

```text
TypeScript
```

Frontend / Backend / Simulator 전체에서 공통 사용한다.

## 11.2 Frontend

```text
React
Vite
TypeScript
Tailwind CSS
```

## 11.3 Backend

```text
NestJS
TypeScript
Express Adapter
```

Backend 구조는 기본적으로 다음 패턴을 따른다.

```text
Controller
    ↓
Service
    ↓
Prisma
    ↓
PostgreSQL
```

## 11.4 Database / ORM

```text
PostgreSQL
Prisma
```

## 11.5 Authentication

```text
JWT
HttpOnly Cookie
Argon2
GitHub OAuth 2.0
```

## 11.6 Infrastructure

```text
Docker Compose
Nginx
HTTPS
```

최종 실행 목표:

```bash
docker compose up --build
```

한 명령으로 전체 서비스가 실행되어야 한다.

---

# 12. Frontend 기본 설계 원칙

Frontend는 과제의 기본 요구사항을 충족하도록 처음부터 반응형과 기본 접근성을 고려한다.

## 12.1 Responsive

Mobile-first를 기본으로 하고 Tailwind의 기본 breakpoint 체계를 사용한다.

```text
base
sm
md
lg
xl
```

주요 화면은 최소 다음 환경에서 레이아웃이 깨지지 않아야 한다.

```text
모바일
태블릿
데스크톱
```

Simulator처럼 정보량이 많은 화면은 좁은 화면에서 Panel을 세로로 배치하거나 접을 수 있게 설계한다.

## 12.2 기본 Accessibility

Accessibility Major Module 수준의 WCAG 2.1 AA 전체 인증을 목표로 하는 것은 아니지만, 기본 UI에서는 다음을 지킨다.

```text
Semantic HTML 사용
Button / Input에 명확한 Label
키보드로 주요 조작 가능
이미지에 필요한 alt 제공
텍스트와 배경의 가독성 확보
Focus 상태 제거 금지
```

---

# 13. 전체 Architecture

```text
                        Browser
                           │
                         HTTPS
                           │
                           ▼
                     ┌──────────┐
                     │  Nginx   │
                     └────┬─────┘
                          │
             ┌────────────┴─────────────┐
             │                          │
             ▼                          ▼
       React Frontend              NestJS Backend
       TypeScript                  TypeScript
             │                          │
             │                          ▼
             │                       Prisma
             │                          │
             │                          ▼
             │                     PostgreSQL
             │
             ▼
     Git Simulator Engine
          TypeScript
```

---

# 14. API 기본 규칙

## 14.1 통신 방식

```text
REST API
JSON
HTTPS
```

## 14.2 Base Path

```text
/api/v1
```

## 14.3 Resource Naming

Resource는 복수형 명사를 사용한다.

```text
/users
/lessons
/quests
/commands
/achievements
/progress
```

## 14.4 HTTP Method

```text
GET
→ 조회

POST
→ 생성 또는 Domain Action

PATCH
→ 일부 수정

DELETE
→ 삭제
```

## 14.5 Authentication

```text
POST /api/v1/auth/signup
POST /api/v1/auth/login
POST /api/v1/auth/logout

GET  /api/v1/auth/github
GET  /api/v1/auth/github/callback
```

현재 로그인한 사용자는 `/users/me`를 우선 사용한다.

```text
GET   /api/v1/users/me
PATCH /api/v1/users/me
```

## 14.6 Error 형식

```json
{
  "statusCode": 404,
  "code": "LESSON_NOT_FOUND",
  "message": "Lesson not found"
}
```

Frontend는 사용자 표시 문자열인 `message`가 아니라 안정적인 `code`를 기준으로 로직을 분기한다.

## 14.7 Pagination

```text
?page=1&limit=20
```

기본 응답:

```json
{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## 14.8 Search Query

```text
search
category
difficulty
sort
order
page
limit
```

---

# 15. Simulator Interface

Simulator는 UI와 독립적인 Pure TypeScript Engine으로 구현한다.

## 15.1 핵심 호출 형태

```ts
executeCommand(
  state: RepositoryState,
  command: string
): SimulatorResult
```

## 15.2 SimulatorResult

```ts
type SimulatorResult = {
  success: boolean;
  nextState: RepositoryState;
  output: string;
  errorCode?: SimulatorErrorCode;
  events: SimulatorEvent[];
};
```

대표 Event:

```text
BRANCH_CREATED
COMMIT_CREATED
MERGE_COMPLETED
MERGE_CONFLICT
CONFLICT_RESOLVED
FETCH_COMPLETED
PUSH_COMPLETED
PUSH_REJECTED
```

UI와 Quest는 Event를 이용해 캐릭터 반응과 Mission 상태를 갱신한다.

---

# 16. Repository State Model

## 16.1 RepositoryState

```ts
type RepositoryState = {
  currentBranch: string;
  headCommitId: string | null;

  branches: Branch[];
  commits: Commit[];

  workingTree: WorkingFileState[];
  stagingArea: StagedFileState[];

  remotes: RemoteRepository[];
  remoteTrackingBranches: RemoteTrackingBranch[];
};
```

## 16.2 Commit

```ts
type Commit = {
  id: string;
  message: string;
  parentIds: string[];
  snapshot: Record<string, string>;
};
```

`parentIds`를 배열로 두어 일반 Commit과 Merge Commit을 모두 표현한다.

```text
일반 Commit
→ parent 0~1개

Merge Commit
→ parent 2개
```

`snapshot`은 교육용 Simulator에서 Commit 시점의 파일 상태를 비교하고 Merge / Conflict를 계산하기 위한 단순화된 파일 스냅샷이다.

## 16.3 Branch

```ts
type Branch = {
  name: string;
  commitId: string | null;
};
```

Branch는 Commit Graph 전체를 복사하지 않고 특정 Commit을 가리킨다.

## 16.4 WorkingFileState

```ts
type WorkingFileState = {
  path: string;
  content: string;
  status: "untracked" | "modified" | "deleted" | "conflicted";
};
```

`conflicted`를 통해 Merge Conflict 상태를 명시적으로 표현한다.

## 16.5 StagedFileState

```ts
type StagedFileState = {
  path: string;
  content: string;
  status: "added" | "modified" | "deleted" | "resolved";
};
```

Working Tree 상태와 Staging Area 상태를 별도 Type으로 관리해 한 파일의 작업 상태와 Stage 상태를 혼동하지 않도록 한다.

## 16.6 RemoteRepository

```ts
type RemoteRepository = {
  name: string;
  branches: Branch[];
};
```

예:

```text
origin
 ├─ main
 └─ feature/login
```

Quest에서 가상 팀원이 Push하면 이 Remote Repository의 Branch tip이 변경될 수 있다.

## 16.7 RemoteTrackingBranch

```ts
type RemoteTrackingBranch = {
  remote: string;
  branch: string;
  commitId: string | null;
};
```

예:

```text
origin/main
origin/feature/login
```

역할:

```text
RemoteRepository
→ 실제 가상 Remote의 현재 상태

RemoteTrackingBranch
→ 마지막 fetch 시 Local이 알고 있는 Remote 상태
```

따라서 `git fetch`의 의미를 시뮬레이션에서 구분할 수 있다.

---

# 17. Simulator Command Catalog

Reference에 표시되는 Command 데이터와 Simulator가 지원하는 명령어 목록은 별도로 관리하지 않는다.

공통 **Command Catalog**를 단일 기준(Source of Truth)으로 사용한다.

Command Parser가 반환하는 `ParsedCommand.key`와 Quest Event의 `commandKey`도 이 Catalog의 `key`를 사용한다.

권장 위치:

```text
shared/commands/catalog.ts
```

기본 형태:

```ts
type CommandDefinition = {
  key: string;
  name: string;
  syntax: string;
  summary: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  simulatorSupported: boolean;
  handlerKey?: string;
};
```

예:

```text
Command Catalog
       │
       ├── Simulator Parser / Handler Registry
       │
       └── Prisma Seed
              ↓
          Command Table
              ↓
          Reference / Public API
```

원칙:

```text
Reference에 노출할 Command의 기본 정의
Simulator 지원 여부
Parser Handler 연결 정보
```

를 Command Catalog에서 관리한다.

DB의 Command Table은 검색/정렬/페이지네이션/Public API 제공을 위해 Catalog에서 Seed한다.

---

# 18. Quest Event System

Quest는 사용자의 Git 명령만으로 진행되지 않는다.

가상의 팀원이 Push하거나 Review Message를 남기는 것처럼 **외부 협업 상황을 발생시키는 Event**가 필요하다.

## 18.1 QuestEvent

```ts
type QuestEvent = {
  id: string;
  trigger: QuestEventTrigger;
  actions: QuestEventAction[];
  once: boolean;
};
```

## 18.2 QuestEventTrigger

```ts
type QuestEventTrigger =
  | {
      type: "QUEST_START";
    }
  | {
      type: "AFTER_COMMAND";
      commandKey: string;
      args?: string[];
    }
  | {
      type: "AFTER_SIMULATOR_EVENT";
      event: SimulatorEventType;
    }
  | {
      type: "CONDITION_MET";
      condition: SimulatorCondition;
    };
```

## 18.3 ParsedCommand 기준

`AFTER_COMMAND`는 사용자가 입력한 원본 문자열을 직접 비교하지 않는다.

Command Parser는 먼저 사용자 입력을 정규화된 형태로 변환한다.

```ts
type ParsedCommand = {
  key: string;
  args: string[];
  options: Record<string, string | boolean>;
};
```

예:

```bash
git switch -c feature/login
```

내부 표현:

```ts
{
  key: "switch",
  args: ["feature/login"],
  options: {
    create: true
  }
}
```

Quest Event의 `commandKey`는 Command Catalog의 `key`와 동일한 값을 사용한다.

원칙:

```text
원본 문자열
→ Parser
→ ParsedCommand
→ Simulator / QuestEvent에서 공통 사용
```

따라서 공백, 옵션 표기 방식 등 사용자 입력 문자열의 사소한 차이 때문에 Event가 깨지지 않도록 한다.

Mission 성공 여부는 가능한 한 특정 명령어 문자열이 아니라 `SimulatorCondition`을 이용해 결과 Repository State를 기준으로 판단한다.

---

## 18.4 QuestEventAction

```ts
type QuestEventAction =
  | {
      type: "REMOTE_COMMIT";
      remote: string;
      branch: string;
      commit: RemoteCommitSpec;
    }
  | {
      type: "TEAMMATE_MESSAGE";
      teammateId: string;
      text: string;
      mood?: GuineaPigMood;
    }
  | {
      type: "REVIEW_CREATED";
      text: string;
    }
  | {
      type: "OBJECTIVE_REVEALED";
      objectiveId: string;
    };
```

`REMOTE_COMMIT`에서 Quest 콘텐츠 작성자는 완전한 `Commit` 객체를 직접 만들지 않는다.

```ts
type RemoteCommitSpec = {
  message: string;
  changes: FileChange[];
};

type FileChange = {
  path: string;
  content: string | null;
};
```

Simulator는 다음 Helper를 제공한다.

```ts
applyRemoteCommit(
  state: RepositoryState,
  remote: string,
  branch: string,
  spec: RemoteCommitSpec
): RepositoryState
```

Helper가 자동으로 처리:

```text
현재 Remote Branch의 tip 확인
        ↓
parentIds 자동 결정
        ↓
부모 Commit snapshot 복사
        ↓
FileChange 적용
        ↓
새 Commit ID 생성
        ↓
Remote Branch 이동
```

따라서 Quest JSON 작성자는 `message`와 실제 파일 변경사항만 기술하면 된다.

예:

```text
Quest 시작
    ↓
사용자가 feature branch에서 commit
    ↓
QuestEvent Trigger 충족
    ↓
가상 팀원이 origin/main에 commit을 Push
    ↓
사용자가 push 시도
    ↓
PUSH_REJECTED
    ↓
pull/fetch가 필요한 상황 학습
```

Quest 4의 Remote 변화는 이 Event System으로 구현한다.

---

# 19. SimulatorCondition

Lesson과 Quest는 동일한 성공 조건 판정 시스템을 공유한다.

```ts
type SimulatorCondition =
  | {
      type: "CURRENT_BRANCH";
      branch: string;
    }
  | {
      type: "COMMIT_EXISTS";
      messageIncludes?: string;
    }
  | {
      type: "BRANCH_EXISTS";
      branch: string;
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
      remote: string;
      branch: string;
    };
```

필요한 Condition은 동일한 체계 안에서 추가한다.

---

# 20. Simulator 상태 저장 정책

Practice에서 실행 중인 Repository State는 기본적으로 Frontend 상태로 관리한다.

```text
Practice Command 실행
→ Frontend Simulator State
```

과제 제출본에서 영구 저장하는 데이터는 다음과 같다.

```text
Lesson 완료
Quest 완료
Score
Attempt
XP
Achievement
Daily Challenge
User/Profile
```

Quest 진행 중 상태 저장이 실제 기능 요구에 필요하다고 판단되면 `RepositoryState`를 JSON으로 저장하는 방식으로 추가할 수 있지만, 현재 제출 필수 범위에는 포함하지 않는다.

---

# 21. DB 기본 Schema

핵심 Entity:

```text
User
Lesson
Quest
Command
LessonProgress
QuestProgress
Achievement
UserAchievement
DailyChallenge
DailyChallengeProgress
Friendship
Bookmark
```

---

# 22. User

```text
User

id
email
passwordHash
nickname
avatarKey
xp
level
lastActiveAt
createdAt
updatedAt
```

`lastActiveAt`은 Friends Online Status를 판단하는 기준으로 사용한다.

## 22.1 Online Status

WebSocket 없이 다음 방식으로 구현한다.

```text
로그인된 사용자의 요청 처리
또는 가벼운 heartbeat 요청
        ↓
User.lastActiveAt 갱신
        ↓
Friends 목록 조회 시
현재 시각과 lastActiveAt 차이를 계산
        ↓
Online / Offline 표시
```

Frontend는 Friends 목록을 주기적으로 Polling하여 상태를 갱신한다.

Online 상태는 예를 들어 최근 2분 이내 활동 여부처럼 하나의 기준을 팀 전체에서 통일한다.

---

# 23. Lesson

```text
Lesson

id
slug
title
description
category
difficulty
order
published
content
createdAt
updatedAt
```

`content`는 PostgreSQL JSON/JSONB 계열 필드로 관리하고 `LessonContent` 구조를 따른다.

---

# 24. Command

```text
Command

id
key
name
syntax
summary
description
category
difficulty
simulatorSupported
```

Command 데이터는 직접 중복 작성하지 않고 `Command Catalog`를 기준으로 Prisma Seed를 통해 생성한다.

---

# 25. Quest

```text
Quest

id
slug
title
description
difficulty
order
published
scenarioData
createdAt
updatedAt
```

`scenarioData`는 JSON/JSONB로 관리하며 `QuestData` 구조를 따른다.

---

# 26. LessonProgress

```text
LessonProgress

id
userId
lessonId
completed
score
completedAt
updatedAt
```

Unique:

```text
userId + lessonId
```

---

# 27. QuestProgress

```text
QuestProgress

id
userId
questId
completed
score
attemptCount
completedAt
updatedAt
```

Unique:

```text
userId + questId
```

---

# 28. Achievement

```text
Achievement

id
key
name
description
iconKey
xpReward
```

예:

```text
FIRST_COMMIT
BRANCH_EXPLORER
FIRST_PR
CONFLICT_RESOLVER
```

---

# 29. UserAchievement

```text
UserAchievement

id
userId
achievementId
unlockedAt
```

Unique:

```text
userId + achievementId
```

---

# 30. DailyChallenge

```text
DailyChallenge

id
title
description
challengeDate
xpReward
challengeData
```

---

# 31. DailyChallengeProgress

```text
DailyChallengeProgress

id
userId
dailyChallengeId
completed
completedAt
```

Unique:

```text
userId + dailyChallengeId
```

---

# 32. Friendship

```text
Friendship

id
requesterId
addresseeId
status
createdAt
updatedAt
```

status:

```text
pending
accepted
blocked
```

DB 제약 또는 Service validation으로 자기 자신에게 Friend Request를 보내거나 동일 관계가 중복 생성되지 않도록 한다.

---

# 33. Bookmark

Public API의 쓰기 가능한 리소스로 사용한다.

```text
Bookmark

id
userId
targetType
targetId
note
createdAt
updatedAt
```

`targetType`:

```text
lesson
quest
command
```

원칙:

```text
Bookmark는 반드시 소유 User와 연결한다.
API Key로 인증된 User는 자신의 Bookmark만 조작할 수 있다.
같은 target을 여러 번 저장하는 것을 허용할지 여부는 Service 정책으로 통일한다.
```

---

# 35. DB 관계 개요

```text
User
 │
 ├──── LessonProgress ───────── Lesson
 │
 ├──── QuestProgress ────────── Quest
 │
 ├──── UserAchievement ──────── Achievement
 │
 ├──── DailyChallengeProgress ─ DailyChallenge
 │
 ├──── Bookmark
 │
 └──── Friendship ───────────── User
```

---

# 35. 동시성 / 데이터 정합성 원칙

과제의 Multi-user 요구사항을 고려하여 Progress, XP, Achievement 갱신은 단순한 `조회 → 계산 → 저장` 방식으로 구현하지 않는다.

특히 다음 동작은 하나의 논리적 작업으로 처리한다.

```text
Lesson / Quest 완료 확인
Progress 완료 처리
XP 지급
Level 계산
Achievement 조건 확인
Achievement 지급
```

## 35.1 완료 처리 원칙

같은 완료 요청이 동시에 두 번 들어와도 XP가 중복 지급되지 않아야 한다.

구현 원칙:

```text
Prisma Transaction 사용

PostgreSQL Transaction 사용

필요한 Unique Constraint 유지

XP 변경은 atomic increment 사용

완료 처리는 idempotent하게 설계
```

완료 보상 로직은 Prisma `$transaction` 내부에서 처리한다.

동일 사용자의 동일 Lesson/Quest 완료 경쟁 상황에서는 트랜잭션 격리 또는 조건부 Update를 사용해 **실제로 처음 완료한 요청만 보상을 지급**하도록 구현한다.

예:

```text
동시에 Quest 완료 요청 2개 발생

Request A ─┐
           ├─ Transaction / 조건부 완료 처리
Request B ─┘

결과

QuestProgress completed = true
XP 보상 = 1회
Achievement = 최대 1회
```

`UserAchievement`, `LessonProgress`, `QuestProgress`, `DailyChallengeProgress`의 복합 Unique Constraint는 중복 Row 생성을 막는 용도로 사용한다.

---

# 36. Lesson Data Structure

Frontend가 사용하는 Lesson Content 기본 형태:

```ts
type LessonContent = {
  situation: ContentBlock[];
  why: ContentBlock[];
  concept: ContentBlock[];
  commands: string[];
  practice?: LessonPractice;
};
```

## 36.1 ContentBlock

```ts
type ContentBlock =
  | {
      type: "text";
      text: string;
    }
  | {
      type: "code";
      code: string;
    }
  | {
      type: "diagram";
      diagramKey: string;
    }
  | {
      type: "guinea-pig-message";
      character: string;
      mood: GuineaPigMood;
      text: string;
    };
```

Lesson마다 React Page를 새로 작성하지 않고 하나의 Renderer로 표시한다.

## 36.2 LessonPractice

```ts
type LessonPractice = {
  initialState: RepositoryState;
  instruction: string;
  successConditions: SimulatorCondition[];
  hint?: string;
};
```

---

# 37. Quest Data Structure

```ts
type QuestData = {
  story: string;
  teammates: QuestTeammate[];
  messages: QuestMessage[];
  initialState: RepositoryState;
  objectives: QuestObjective[];
  events: QuestEvent[];
  successConditions: SimulatorCondition[];
};
```

## 37.1 QuestTeammate

```ts
type QuestTeammate = {
  id: string;
  name: string;
  role: string;
  avatarKey: string;
};
```

## 37.2 QuestMessage

```ts
type QuestMessage = {
  teammateId: string;
  text: string;
  mood?: GuineaPigMood;
};
```

## 37.3 QuestObjective

```ts
type QuestObjective = {
  id: string;
  text: string;
  hidden?: boolean;
};
```

일부 Objective는 사용자에게 직접 보여주지 않는다.

예:

```text
보이는 목표
"Profile 기능을 완료하세요."

숨겨진 조건
"main에서 직접 commit하지 않을 것"
```

---

# 38. 공통 Shared Type

Frontend, Simulator, Lesson, Quest 사이에서 공유하는 Type은 한 곳에서 관리한다.

권장:

```text
shared/
├─ simulator/
│  ├─ types.ts
│  ├─ engine.ts
│  ├─ commands/
│  └─ conditions/
│
├─ commands/
│  └─ catalog.ts
│
└─ contracts/
   ├─ lesson.ts
   └─ quest.ts
```

목표:

```text
Simulator Type 변경
        ↓
TypeScript Compile Error
        ↓
영향받는 Learn / Quest 코드 즉시 발견
```

---

# 39. Repository 구조

```text
gitquest/
│
├─ frontend/
│
├─ backend/
│
├─ shared/
│   ├─ simulator/
│   ├─ commands/
│   └─ contracts/
│
├─ nginx/
│
├─ docs/
│
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

---

# 40. Git Branch 전략

단순한 GitHub Flow 기반으로 운영한다.

## 40.1 main

```text
직접 Push 금지
항상 Build 가능한 상태 유지
PR을 통해서만 Merge
```

## 40.2 Branch 이름

```text
feat/<기능>
fix/<버그>
refactor/<대상>
test/<대상>
docs/<대상>
chore/<작업>
```

예:

```text
feat/simulator-branch
feat/quest-pr
feat/lesson-search
fix/login-validation
docs/api-rules
```

한 사람당 하나의 장기 Branch를 두지 않고 기능 단위 Branch를 사용한다.

---

# 41. Pull Request 규칙

```text
main 직접 Merge 금지
PR 사용
중요 PR은 최소 1명 Review
```

PR에는 최소 다음을 작성한다.

```text
무엇을 구현했는지
어떻게 테스트했는지
관련 Issue
```

---

# 42. Commit Message 규칙

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

예:

```text
feat: add git switch simulation
fix: validate duplicate user email
test: add commit command tests
docs: document quest data format
```

---

# 43. Issue 운영

기능을 가능한 한 작은 Issue로 분리한다.

예:

```text
Simulator RepositoryState 정의
git status 구현
git add 구현
git commit 구현
git switch 구현
Commit Graph UI 구현
```

---

# 44. AI 사용 개발 규칙

```text
1. 기능 전체를 한 번에 생성하지 않는다.

2. 구현 전 데이터 흐름과 구조를 먼저 확인한다.

3. 작은 기능 단위로 코드를 생성한다.

4. 담당자는 생성된 코드를 설명할 수 있어야 한다.

5. 이해하지 못한 핵심 코드는 Merge하지 않는다.

6. 정상 Case와 Error Case를 직접 테스트한다.

7. 중요한 PR은 다른 팀원이 Review한다.

8. Simulator 핵심 로직은 단계별로 구현한다.
```

---

# 45. 테스트 전략

우선순위:

```text
1. Simulator Engine Unit Test

2. Auth Backend Test

3. Progress / XP / Achievement 동시성 및 중복 보상 Test

4. 핵심 API Test

5. Frontend 주요 Flow Test

6. Multi-user 동시 요청 Test

7. Chrome / Firefox / Edge 수동 호환성 Test
```

Simulator Test 예:

```text
given
main branch의 Commit A

when
git switch -c feature/login

then
feature/login branch 생성
currentBranch 변경
HEAD 유지
```

동시성 Test 예:

```text
같은 User가 동일 Quest 완료 요청을 동시에 2회 전송

expected
Quest는 한 번만 완료
XP는 한 번만 지급
Achievement 중복 생성 없음
```

---

# 46. Custom Design System

Tailwind를 사용하되 공통 React Component를 직접 만든다.

최소 10개 이상의 재사용 Component를 구현하고 공통 색상, Typography, Icon 규칙을 사용한다.

후보:

```text
Button
Input
Modal
Terminal
CommandCard
LessonCard
QuestCard
ProgressBar
Badge
Alert
GuineaPigAvatar
SpeechBubble
Tabs
```

Responsive / Accessibility 원칙은 이 Design System에도 동일하게 적용한다.

---

# 47. Module 목표

| Module | 점수 | gitneapig 구현 |
|---|---:|---|
| Frontend + Backend Framework | 2 | React + NestJS |
| ORM | 1 | Prisma |
| Standard User Management | 2 | Profile / Avatar / Friends / Online Status |
| GitHub OAuth | 1 | GitHub Login |
| Public API | 2 | Bookmark CRUD Public API |
| Advanced Search | 1 | Reference |
| Gamification | 1 | XP / Achievement / Daily Challenge |
| Custom Design System | 1 | 공통 UI Components |
| Additional Browsers | 1 | Firefox + Edge |
| Custom Git Simulator | 2 | Simulator Engine |
| **Total** | **14** | |

Custom Git Simulator는 단순 Command 정답 판정이 아니라 다음 기술 요소를 포함하도록 구현한다.

```text
Repository State Model
Command Parsing
State Transition
Commit Graph
Branch / HEAD
Remote / Remote-tracking State
Merge
Conflict
Quest Event 연동
Condition 기반 Mission 판정
```

이를 통해 Custom Major로 주장할 기술적 깊이를 확보한다.

---

# 48. 과제 제출을 위한 Mandatory 확인 항목

```text
[ ] Web Application

[ ] Frontend / Backend / Database

[ ] 모든 팀원의 명확한 Git Commit

[ ] Docker Compose 한 명령 실행

[ ] Latest Stable Chrome 지원

[ ] Browser Console Warning / Error 정리

[ ] Privacy Policy

[ ] Terms of Service

[ ] Multi-user 동시 사용

[ ] 동시 요청 시 데이터 정합성 유지

[ ] Responsive Frontend

[ ] 기본 Accessibility

[ ] CSS Styling Solution 사용

[ ] .env는 Git에서 제외

[ ] .env.example 제공

[ ] 명확한 DB Schema / Relation

[ ] Email / Password 회원가입 및 로그인

[ ] Password Hash

[ ] Frontend Input Validation

[ ] Backend Input Validation

[ ] Browser ↔ Backend HTTPS
```

---

# 49. 구현 순서

## Phase 0 — 공통 기반

다른 기능이 의존하므로 가장 먼저 만든다.

```text
Repository 생성
Frontend React/Vite 생성
Backend NestJS 생성
PostgreSQL + Prisma 연결
Docker Compose 기본 구성
Nginx 기본 구성
Shared Type 구조 생성
Command Catalog 생성
ParsedCommand 규칙 정의
RepositoryState 정의
Simulator Interface 정의
QuestEvent / SimulatorCondition 정의
RemoteCommitSpec / applyRemoteCommit Helper 정의
DB Schema 1차 Migration
```

## Phase 1 — 병렬 핵심 개발

### Simulator 담당

```text
RepositoryState Engine
status
add
commit
branch
switch
Commit Graph 기본
```

### Learning 담당

```text
Lesson Renderer
Lesson 목록 / 상세
초기 Lesson 데이터
Reference UI
```

### Quest 담당

```text
Quest Renderer
Virtual Team
Issue / PR UI
QuestEvent 처리
첫 Quest
```

### User / Progress 담당

```text
Auth
User / Profile
Friends
Online Status
LessonProgress / QuestProgress
```

## Phase 2 — 기능 연결

```text
Learn Mini Practice
        ↓
Simulator 연결

Quest
        ↓
Simulator + QuestEvent 연결

Lesson / Quest 완료
        ↓
Progress / XP / Achievement Transaction 연결
```

## Phase 3 — Simulator / 콘텐츠 완성

```text
merge
fetch
pull
push
Remote / Remote-tracking Branch
Merge Conflict
Conflict Resolution

5개 Lesson 완성
5개 Quest 완성
Guinea Pig Reaction
```

## Phase 4 — Module 완성

```text
Gamification
Advanced Search
GitHub OAuth
Public API
Custom Design System
Firefox + Edge 호환성
```

## Phase 5 — 제출 안정화

```text
HTTPS 전체 확인
Docker 한 명령 실행
Validation 확인
동시성 Test
Multi-user Test
Privacy Policy
Terms of Service
Chrome Console Error 제거
Module Demo 준비
README
개인 기여 정리
```

---

# 50. 구현 우선순위

일정 문제가 생기면 다음 우선순위로 처리한다.

```text
1. 과제 Mandatory 요구사항

2. 총 14점 Module 충족

3. Git Simulator 핵심 기능

4. Learn 최소 Lesson

5. Quest 최소 Scenario

6. Progress / Gamification 완성도

7. 추가 Lesson / Quest
```

과제 제출에 필요한 Mandatory와 Module 충족을 최우선으로 한다.

---

# 51. 과제 제출 완료 조건

```text
[ ] 회원가입 / 로그인 / 로그아웃

[ ] GitHub OAuth

[ ] Profile / Avatar / Friends / Online Status

[ ] Lesson 최소 5개

[ ] Situation → Why → Concept → Command → Practice 구조

[ ] 자유 Practice Mode

[ ] status / add / commit / log / branch / switch / merge / fetch / pull / push

[ ] Commit Graph / Branch / HEAD 시각화

[ ] Remote / Remote-tracking Branch 표현

[ ] Merge Conflict / Conflict Resolution

[ ] Quest 최소 5개

[ ] Virtual Teammate / Issue / PR / Review / Merge

[ ] QuestEvent 기반 Remote 변화 Scenario

[ ] Guinea Pig Avatar / Reaction

[ ] Lesson / Quest Progress 저장

[ ] 동시 완료 요청에서 XP 중복 지급 방지

[ ] XP / Level / Achievement / Daily Challenge

[ ] Reference Advanced Search

[ ] Public API Bookmark CRUD (GET / POST / PUT / DELETE)

[ ] Custom Design System

[ ] Firefox + Edge 지원

[ ] Docker Compose 한 명령 실행

[ ] HTTPS

[ ] Frontend + Backend Validation

[ ] Multi-user 동시 사용

[ ] Privacy Policy

[ ] Terms of Service

[ ] Chrome Console Error 없음

[ ] README에 Team / Feature / Module / 개인 기여 정리
```

---

# 52. 최종 결정 요약

```text
Product
Git/GitHub 협업 상황 기반 학습 플랫폼

Core
Learn + Practice + Quest + Reference + Progress

Mascot
Guinea Pig

Language
TypeScript

Frontend
React + Vite + Tailwind CSS

Backend
NestJS

Database
PostgreSQL

ORM
Prisma

Auth
JWT + HttpOnly Cookie + Argon2 + GitHub OAuth

API
REST / JSON / /api/v1

Simulator
Pure TypeScript State Engine

Simulator State
Working Tree / Staging / Commit / Branch / HEAD /
Remote / Remote-tracking / Conflict

Quest
Event-driven Collaboration Scenario

Deployment
Docker Compose + Nginx + HTTPS

Git Strategy
GitHub Flow 기반 Feature Branch + PR

Data Integrity
Prisma Transaction + Unique Constraint + Atomic Update

Online Status
lastActiveAt + Heartbeat/Polling

Command Source
Shared Command Catalog + ParsedCommand.key

Content Principle
Lesson / Quest는 데이터 기반 Renderer 사용

Development Principle
작은 기능 단위 개발 + AI 코드 이해/테스트 후 Merge
```

---

# 53. 변경 기준

다음 상황에서는 이 설계를 수정할 수 있다.

```text
과제 요구사항과의 충돌 발견
실제 구현에서 기술적 결함 확인
현재 구조로 요구 기능을 올바르게 구현하기 어려움
팀 전체가 변경 필요성에 합의
```

기술이나 구조를 변경할 때는 기존 코드에 미치는 영향과 변경 이유를 기록한다.
