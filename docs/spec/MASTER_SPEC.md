# GitneaPig — Master Functional Specification

> 이 문서는 Codex가 GitneaPig 전체 웹 애플리케이션을 구현할 때 사용하는 **최상위 기능 명세(Source of Truth)** 이다.
>
> 이 문서의 목적은 단순히 기능 이름을 나열하는 것이 아니라, 사용자가 어떤 화면을 보고 어떤 행동을 하며, 그 행동으로 어떤 상태 변화와 페이지 이동이 발생해야 하는지를 명확하게 정의하는 것이다.
>
> 상세 데이터 구조와 API 계약은 `DATA_CONTRACTS.md`, 시각적 공통 규칙은 `DESIGN_SYSTEM.md`, 최종 구현 검증 기준은 `ACCEPTANCE_CHECKLIST.md`를 따른다.


---

# 1. Project Goal

## 1.1 Product Name

```text
GitneaPig
```

Git와 Guinea Pig를 결합한 이름이며, 기니피그 캐릭터를 메인 마스코트로 사용하는 Git/GitHub 협업 학습 플랫폼이다.

## 1.2 Product Purpose

GitneaPig의 목적은 Git 명령어를 단순 암기시키는 것이 아니라, 실제 협업 상황을 먼저 이해시키고 왜 특정 Git 기능이 필요한지 설명한 뒤 사용자가 직접 명령을 실행해 학습하도록 만드는 것이다.

핵심 학습 흐름:

```text
실제 협업 상황
    ↓
왜 문제가 발생하는지 이해
    ↓
Git 개념 학습
    ↓
관련 명령어 학습
    ↓
직접 실행
    ↓
Repository 상태 변화 확인
    ↓
Quest에서 스스로 판단하여 사용
```

## 1.3 Core Product Areas

GitneaPig는 다음 핵심 영역으로 구성한다.

```text
Home
Learn
Practice
Quest
Daily Challenge
Reference
Profile / Progress
Gamification
Friends
Bookmarks
Authentication
Public API
```

각 영역의 역할:

```text
Learn
→ Git 개념을 상황 중심으로 학습한다.

Practice
→ 학습한 Git 명령어를 자유롭게 실습한다.

Quest
→ 가상 협업 상황에서 사용자가 스스로 적절한 Git 행동을 판단한다.

Daily Challenge
→ 매일 하나의 짧은 Git 문제를 읽고, 스스로 해결 방법을 판단하여 Simulator에서 해결한다.

Reference
→ Git 개념과 명령어를 검색하고 다시 확인한다.

Profile / Progress
→ 사용자의 학습 진행도, XP, Level, Achievement를 확인한다.
```

## 1.4 Learning Experience Principle

세 학습 영역의 역할을 명확히 구분한다.

```text
Learn
"무엇을 왜 사용하는지 알려준다."

Practice
"자유롭게 시험해볼 수 있게 한다."

Quest
"무엇을 사용해야 하는지 직접 판단하게 한다."
```

같은 Simulator Engine을 Learn의 Mini Practice, Practice, Quest, Daily Challenge에서 공통으로 사용한다.

---

# 2. User Types

GitneaPig는 기본적으로 두 종류의 웹 사용자 상태를 가진다.

## 2.1 Guest

로그인하지 않은 사용자.

Guest가 사용할 수 있는 기능:

```text
Home
Learn
Lesson 1~3 열람
Lesson 1~3 Mini Practice
Practice
Quest 체험
Daily Challenge 실행 및 완료
Privacy Policy
Terms of Service
Login
Sign Up
```

Guest에게 제한되는 기능:

```text
Lesson 4~5 전체 콘텐츠
Reference
Command Detail
Progress 영구 저장
XP 획득 및 XP 저장
Level/XP 장기 반영
Achievement 저장
Bookmark
Friends
Profile
Daily Challenge 완료 기록 영구 저장
Daily Challenge XP 보상 저장
```

Guest에게 제한된 기능은 가능한 경우 UI에서 완전히 숨기지 않는다.

대신 사용자가 해당 기능의 존재와 가치를 알 수 있도록 `Locked` 상태로 표시하고, 클릭했을 때 로그인 또는 회원가입 안내 화면이나 Modal을 표시한다.

예:

```text
Lesson 4 또는 Lesson 5 선택
        ↓
Locked 안내
        ↓
"Create an account to continue learning."
        ↓
[ Sign Up ] [ Log In ]
```

Reference 선택:

```text
Reference 선택
        ↓
Locked 안내
        ↓
"Reference is available for members."
        ↓
[ Sign Up ] [ Log In ]
```

Guest가 저장이 필요한 행동을 수행하면 로그인/회원가입을 안내한다.

예:

```text
Guest가 Lesson 1~3 중 하나를 완료
        ↓
Lesson 완료 경험 자체는 가능
        ↓
"로그인하면 진행도와 XP를 저장할 수 있습니다."
```

## 2.2 Authenticated User

로그인한 사용자.

Authenticated User는 모든 일반 웹 기능을 사용할 수 있다.

```text
Learn Progress 저장
Quest Progress 저장
XP / Level
Achievements
Daily Challenge
Bookmarks
Friends
Profile
Avatar
42 OAuth
```

## 2.3 Authentication Return Behavior

로그인이 필요한 기능을 사용하다 Login 페이지로 이동한 경우, 로그인 성공 후 원래 사용하던 페이지로 돌아갈 수 있어야 한다.

예:

```text
/quests/merge-conflict
       ↓
로그인 필요한 저장 기능 실행
       ↓
/login
       ↓
로그인 성공
       ↓
/quests/merge-conflict
```

---

# 3. Global Navigation

모든 주요 페이지는 공통 Header와 Footer를 사용한다.

## 3.1 Desktop Header

왼쪽:

```text
GitneaPig Logo
```

Logo 클릭:

```text
→ /
```

중앙 또는 주요 Navigation:

```text
Learn
Practice
Quest
Daily Challenge
Reference
```

각 항목:

```text
Learn
→ /learn

Practice
→ /practice

Quest
→ /quests

Daily Challenge
→ /daily-challenge

Reference
→ /reference
```

## 3.1A Primary Navigation Active State

Primary Navigation에서는 현재 route에 대응하는 **정확히 하나의 항목만 active**로 표시한다.

```text
/learn*
→ Learn only

/practice*
→ Practice only

/quests*
→ Quest only

/daily-challenge*
→ Daily Challenge only

/reference*
→ Reference only
```

예를 들어 `/practice`에서 `Practice`와 `Daily Challenge`가 동시에 active color를 가지면 안 된다.

---

## 3.2 Guest Header

로그인하지 않은 경우 오른쪽에 표시:

```text
Login
Sign Up
```

동작:

```text
Login
→ /login

Sign Up
→ /signup
```

### Guest Navigation Restriction

Guest에게도 `Reference` Navigation 항목은 표시한다.

단, Guest가 `Reference`를 선택하면 일반 Reference 콘텐츠를 바로 표시하지 않는다. 대신 회원 전용 기능임을 안내하는 `Locked` 상태를 표시한다.

```text
Reference
→ Guest
→ Locked Reference 안내
```

안내에는 최소 다음 내용을 포함한다.

```text
Reference is available for members.

Search Git commands, review concepts,
and save useful references after creating an account.

[ Sign Up ]
[ Log In ]
```

Authenticated User가 `Reference`를 선택하면 정상적으로 `/reference`로 이동한다.

```text
Reference
→ Authenticated User
→ /reference
```

Guest 상태에서 Reference Navigation 자체를 숨기지 않는다.

## 3.3 Authenticated Header

로그인한 경우 오른쪽에 표시:

```text
Current XP / Level summary
Guinea Pig Avatar
```

Avatar 클릭 시 Dropdown:

```text
Profile
Bookmarks
Friends
Achievements
Logout
```

동작:

```text
Profile
→ /profile

Bookmarks
→ /bookmarks

Friends
→ /friends

Achievements
→ /achievements

Logout
→ logout 처리 후 /
```

## 3.4 Mobile Navigation

작은 화면에서는 주요 Navigation을 접을 수 있어야 한다.

Mobile Header:

```text
GitneaPig Logo
Menu Button
```

Menu Button 클릭 시:

```text
Learn
Practice
Quest
Daily Challenge
Reference

Guest:
Login
Sign Up

Authenticated:
Profile
Bookmarks
Friends
Achievements
Logout
```

메뉴가 열린 상태에서 메뉴 외부를 누르거나 Navigation 항목을 선택하면 메뉴를 닫는다.

## 3.5 Footer

Footer는 최소 다음 링크를 제공한다.

```text
Privacy Policy
Terms of Service
```

동작:

```text
Privacy Policy
→ /privacy

Terms of Service
→ /terms
```

---

# 4. Complete Sitemap

```text
/
│
├─ /login
├─ /signup
│
├─ /learn
│  └─ /learn/:lessonSlug
│
├─ /practice
│
├─ /quests
│  └─ /quests/:questSlug
│
├─ /reference
│  └─ /reference/commands/:commandKey
│
├─ /profile
├─ /friends
├─ /achievements
├─ /daily-challenge
├─ /bookmarks
│
├─ /privacy
└─ /terms
```

Public API는 일반 사용자용 Page Route가 아니다.

```text
/api/v1/public/...
```

Backend 내부 API 또한 Sitemap과 별도로 관리한다.

---

# 5. Global User Flows

## 5.1 First Visit Flow

처음 방문한 Guest의 대표 흐름:

```text
Home
 ↓
Learn
 ↓
Lesson 선택
 ↓
Situation / Why / Concept / Command 학습
 ↓
Mini Practice
 ↓
Practice에서 자유 실습
 ↓
Quest 진입
 ↓
협업 상황에서 Git 명령을 스스로 선택
 ↓
Quest 완료
 ↓
로그인 또는 회원가입 제안
```

이 흐름에서 회원가입을 첫 진입 조건으로 강제하지 않는다.

Guest는 이 흐름을 Lesson 1~3까지 로그인 없이 경험할 수 있다.

Lesson 4 이상을 선택하면 회원가입 또는 로그인을 안내하지만, 기존 Lesson 목록과 Locked Lesson Card는 계속 확인할 수 있다.

## 5.2 Learning Flow

```text
/learn
 ↓
Lesson Card 선택
 ↓
/learn/:lessonSlug
 ↓
Situation
 ↓
Why
 ↓
Concept
 ↓
Command
 ↓
Mini Practice
 ↓
Result
 ↓
Lesson Complete
```

완료 후 사용자 선택:

```text
Next Lesson
→ 다음 Lesson Detail로 이동

Back to Lessons
→ /learn으로 이동하여 Lesson 목록 표시

Practice More
→ /practice로 이동
```

Authenticated User의 경우:

```text
Lesson Complete
 ↓
Progress 저장
 ↓
XP 지급
 ↓
Achievement 조건 검사
```

### Guest Lesson Access

Guest는 Lesson 1~3까지 정상적으로 학습할 수 있다.

```text
Lesson 1 — Git & Repository
Lesson 2 — Working Directory / Staging / Commit
Lesson 3 — Branch
```

Lesson 4와 Lesson 5는 Learn 목록에서 숨기지 않고 `Locked` 상태로 표시한다.

```text
Lesson 4 — Merge                         🔒 Locked
Lesson 5 — Remote / Fetch / Pull / Push 🔒 Locked
```

Guest가 Locked Lesson Card를 선택하면 Lesson Detail로 진입하지 않는다. 대신 회원가입 안내를 표시한다.

```text
Locked Lesson 선택
        ↓
Continue Learning 안내
        ↓
"Create an account to unlock the rest of the GitneaPig curriculum."
        ↓
[ Create Account ]
[ Log In ]
```

Authenticated User에게는 모든 Lesson이 정상적으로 표시되고 접근 가능하다.

## 5.3 Practice Flow

```text
/practice
 ↓
기본 Repository State 생성
 ↓
Terminal에 Git Command 입력
 ↓
Simulator Engine 실행
 ↓
Terminal Output 갱신
 ↓
Repository State 갱신
 ↓
Commit Graph 갱신
 ↓
계속 자유 실습
```

Practice에는 필수 성공 목표가 없다.

사용자는 언제든 Repository를 초기 상태로 Reset할 수 있다.

## 5.4 Quest Flow

```text
/quests
 ↓
Quest Card 선택
 ↓
/quests/:questSlug
 ↓
Story 확인
 ↓
Virtual Teammate Message / Issue 확인
 ↓
상황 판단
 ↓
Terminal에서 Command 실행
 ↓
Simulator State 변화
 ↓
QuestEvent 실행
 ↓
Objectives / Success Conditions 검사
 ↓
Quest Complete
 ↓
Result Summary
```

필요한 경우 사용자는 단계별 Hint를 사용할 수 있다.

Quest에서는 가능한 한 정답 Command를 직접 지시하지 않는다.

## 5.5 Reference Flow

```text
/reference
 ↓
Search / Filter / Sort
 ↓
결과 확인
 ↓
Command 선택
 ↓
/reference/commands/:commandKey
 ↓
설명 / Syntax / Example / Related Content 확인
```

Authenticated User는 Command, Lesson, Quest를 Bookmark할 수 있다.

## 5.6 Authentication Flow

### Sign Up

```text
/
 ↓
Sign Up
 ↓
/signup
 ↓
Email / Password / Nickname / Avatar
 ↓
회원가입 성공
 ↓
자동 로그인
 ↓
/
```

### Login

```text
/
 ↓
Login
 ↓
/login
 ↓
Email + Password
또는 42 OAuth
 ↓
로그인 성공
 ↓
원래 페이지 또는 /
```

## 5.7 Profile / Progress Flow

```text
/profile
 ↓
Profile 정보
 ↓
Lesson Progress
Quest Progress
XP
Level
Achievements
 ↓
Profile Edit 가능
```

## 5.8 Daily Challenge Flow

```text
/daily-challenge
 ↓
오늘의 Challenge 확인
 ↓
Simulator 실행
 ↓
Success Condition 만족
 ↓
Challenge Complete
 ↓
XP 지급
```

Guest도 Daily Challenge를 실행하고 완료할 수 있다.

다만 Guest의 완료 기록과 XP 보상은 영구 저장하지 않는다.

Guest가 Challenge를 완료하면 다음과 같은 안내를 제공한다.

```text
Challenge Complete!

You completed today's challenge.

Sign in to save your completion and earn XP.

[ Sign Up ]
[ Log In ]
```

Authenticated User는 Daily Challenge 완료 기록과 XP 보상을 영구 저장한다.

## 5.9 Bookmark Flow

```text
Lesson / Quest / Command
 ↓
Save Bookmark
 ↓
Bookmark 생성
 ↓
/bookmarks
 ↓
저장 항목 조회 / 수정 / 삭제
```

## 5.10 Friends Flow

```text
/friends
 ↓
User Search
 ↓
Friend Request
 ↓
Pending
 ↓
Accepted
 ↓
Friend List
```

Friend List에서:

```text
Avatar
Nickname
Level
Online / Offline
```

을 표시한다.

---

# 6. Home Page

## 6.1 Route

```text
/
```

## 6.2 Access

```text
Guest
→ 접근 가능

Authenticated User
→ 접근 가능
```

## 6.3 Purpose

Home은 GitneaPig에 처음 진입했을 때 사용자가 서비스의 핵심 목적을 즉시 이해하고,
`Learn`, `Practice`, `Quest`, `Daily Challenge` 중 원하는 다음 행동을 선택할 수 있도록 하는 시작 화면이다.

Home은 긴 마케팅 랜딩 페이지처럼 구성하지 않는다.

핵심 원칙:

```text
첫 화면
→ 서비스 정체성 + 주요 CTA에 집중

스크롤 이후
→ 핵심 학습 방식 4개를 간결하게 소개
```

## 6.4 Overall Structure

Home은 다음 순서로 구성한다.

```text
Global Header

Hero Section
→ 첫 viewport를 사실상 단독으로 사용
→ full viewport section

구분선

Choose Your Next Step Section
→ Learn
→ Practice
→ Quest
→ Daily Challenge
→ full viewport section

Global Footer
→ 두 번째 Section 하단에 자연스럽게 포함
```

`Your Progress`와 같은 별도 Progress 블럭은 Home에서 제거한다.

Progress 상세 정보는 Profile 및 관련 Progress UI에서 제공한다.

## 6.5 First Viewport Rule

사용자가 Home에 처음 진입한 뒤 스크롤하지 않은 상태에서는
Hero Section만 핵심 콘텐츠로 보여야 한다.

다음 섹션의 제목이나 카드가 첫 viewport 안으로 올라와 보이지 않도록 한다.

특히 아래 내용은 첫 화면에서 보이지 않아야 한다.

```text
Choose your next step
Learn Card
Practice Card
Quest Card
Daily Challenge Card
```

Hero Section은 Header를 제외한 화면 높이를 충분히 차지하도록 구성한다.

구현 시 목표:

```text
Hero min-height
≈ viewport height - header height
```

정확한 pixel 값은 Responsive 구현에서 조정할 수 있지만,
사용자가 첫 화면을 보았을 때 서로 다른 두 Section이 한 화면 안에 섞여 보이지 않아야 한다.

Hero 하단에는 충분한 여백을 둔다.

구분선은 다음 Section의 시작을 명확하게 느낄 수 있도록 Hero의 시각적 끝에 배치한다.

## 6.5A Second Viewport / Scroll Snap Rule

Home은 단순히 Hero 아래에 작은 Card Section을 붙인 긴 landing page가 아니라,
**두 개의 명확한 full-screen section**으로 느껴져야 한다.

Desktop 기준:

```text
Section 1
→ Hero
→ min-height ≈ viewport height - header height

Section 2
→ Choose Your Next Step + Footer
→ min-height ≈ viewport height - header height
```

사용자가 Home의 가장 아래까지 이동했을 때
Hero의 일부가 위쪽에 남아 보이지 않아야 한다.

두 번째 Section의 콘텐츠가 적더라도 관련 없는 콘텐츠를 추가하지 않는다.
대신 vertical spacing / alignment를 사용해 full viewport composition을 유지한다.

### Scroll Snap

Desktop Home은 두 Section 사이의 이동에 vertical scroll snap을 사용한다.

의도:

```text
사용자가 wheel / trackpad로 다음 Section 방향으로 스크롤
→ Section 경계를 지나 애매한 중간 위치에 멈추지 않음
→ 다음 full-screen Section으로 부드럽게 정렬

반대 방향 스크롤
→ 이전 Section으로 동일하게 정렬
```

구현 기준:

```text
scroll-snap-type: y mandatory
section: scroll-snap-align: start
section: scroll-snap-stop: always
```

부드러운 이동은 CSS 기반으로 구현하며 별도 animation library를 요구하지 않는다.

`prefers-reduced-motion: reduce` 사용자는 과도한 smooth animation을 강제하지 않는다.

Home 이외의 일반 Page에는 이 full-page scroll snap을 전역 적용하지 않는다.

---

## 6.6 Hero Section

### Layout

Desktop에서는 2-column 구조를 사용한다.

```text
Left
→ Product Message
→ CTA

Right
→ Git Visual
→ Guinea Pig Mascot
```

Mobile에서는 1-column으로 재배치한다.

### Left Content

Hero 왼쪽에는 다음 요소를 포함한다.

```text
Small Git-inspired label
Main Headline
Short Product Description
Primary CTA
Secondary CTA
Optional Quest CTA
```

현재 디자인 방향의 Headline은 다음과 같은 의미를 유지한다.

```text
Learn Git through real team scenarios.
```

설명 문구는 다음 핵심을 전달해야 한다.

```text
GitneaPig는 Git 명령어 목록을 외우는 서비스가 아니다.

사용자는 실제 협업 상황을 이해하고,
Git 개념을 배우고,
직접 명령어를 실행하며,
Quest에서 스스로 판단해 문제를 해결한다.
```

### CTA

Primary CTA:

```text
Start Learning
→ /learn
```

Secondary CTA:

```text
Open Terminal
또는
Practice Git

→ /practice
```

Quest CTA가 Hero에 존재하는 경우:

```text
Browse Quests
→ /quests
```

CTA 명칭은 최종 디자인에서 자연스럽게 통일하되,
각 CTA의 목적과 Route는 변경하지 않는다.

## 6.7 Hero Right Visual

Hero 오른쪽에는 다음 두 시각 요소를 사용한다.

```text
Git / Terminal / Commit Graph visual
Guinea Pig mascot visual
```

두 요소는 같은 composition 안에 존재할 수 있지만 서로 겹치거나 가리면 안 된다.

금지:

```text
Guinea Pig image가 Git window를 덮음
Git window가 Guinea Pig의 주요 부분을 가림
두 요소가 겹쳐서 각각의 형태를 알아보기 어려움
```

권장:

```text
Git Visual
   ↓
Guinea Pig Mascot
```

또는 서로 충분한 간격을 둔 좌우 배치.

Mascot은 Git UI를 보고 있거나 함께 작업하는 듯한 관계를 표현할 수 있다.

Git Visual에는 다음 요소를 시각적으로 활용할 수 있다.

```text
terminal command
branch name
commit node
HEAD
simple Git graph
```

이 visual은 실제 기능을 수행하는 Terminal이 아니라 Hero의 시각적 설명 요소다.

## 6.8 Choose Your Next Step Section

Hero 아래 두 번째 Section은 사용자가 GitneaPig의 주요 기능을 선택하도록 한다.

권장 Section Title:

```text
Choose your next step
```

Supporting Text:

```text
Learn the concepts, practice freely, take on team quests,
or sharpen your skills with a daily challenge.
```

이 Section에는 정확히 4개의 주요 Card를 제공한다.

```text
Learn
Practice
Quest
Daily Challenge
```

`Progress` Card는 포함하지 않는다.

### Desktop Layout

4개 Card는 compact layout을 사용한다.

권장:

```text
2 x 2 Grid
```

### Learn Card

핵심 설명:

```text
실제 협업 상황을 통해 Git 개념과 명령어를 단계적으로 학습한다.
```

CTA:

```text
Start Learning
→ /learn
```

### Practice Card

핵심 설명:

```text
가상 Repository에서 Git 명령어를 자유롭게 실행하고
Repository State와 Commit Graph 변화를 확인한다.
```

CTA:

```text
Open Practice
→ /practice
```

### Quest Card

핵심 설명:

```text
가상 Guinea Pig 팀원들과 협업 상황을 해결하며
어떤 Git 행동이 필요한지 스스로 판단한다.
```

CTA:

```text
View Quests
→ /quests
```

### Daily Challenge Card

핵심 설명:

```text
매일 제공되는 짧은 Git Challenge를 수행한다.
```

CTA:

```text
Start Daily Challenge
→ /daily-challenge
```

Guest와 Authenticated User 모두 Daily Challenge에 진입할 수 있다.

## 6.9 Guest / Authenticated Difference on Home

### Guest

Guest에게 다음 기능을 보여준다.

```text
Hero
Learn
Practice
Quest
Daily Challenge
```

### Authenticated User

Authenticated User에게도 기본 Home 구조는 동일하게 유지한다.

상단 Header에는 다음 개인 정보를 간결하게 표시할 수 있다.

```text
Level
XP
Avatar
```

상세 Progress는 `/profile`에서 확인한다.

## 6.10 Daily Challenge Guest Behavior

Guest가 Home의 `Daily Challenge` Card 또는 Global Navigation을 통해
`/daily-challenge`로 이동하는 것을 허용한다.

Guest는 다음을 모두 수행할 수 있다.

```text
Challenge 내용 확인
Simulator 사용
Challenge 조건 달성
Challenge 완료
```

Guest에게 제한되는 것은 영구 저장뿐이다.

```text
완료 기록 저장 X
XP 저장 X
Level 반영 X
Achievement 반영 X
```

Guest 완료 후에는 회원가입 또는 로그인을 안내한다.

## 6.11 Footer

Home 하단에는 Global Footer를 표시한다.

최소 항목:

```text
GitneaPig Logo / Product Name
Privacy Policy
Terms of Service
```

Route:

```text
Privacy Policy
→ /privacy

Terms of Service
→ /terms
```

정적 디자인 시안과 달리 실제 구현에서는 명세된 링크와 Interaction이 모두 동작해야 한다.

실제 애플리케이션 구현에서는 반드시 위 Route로 동작해야 한다.

## 6.12 Loading State

Home에서 사용자 세션 정보를 확인하는 동안에도 Hero 자체는 가능한 한 즉시 표시한다.

Authenticated User의 Header 정보가 아직 로드되지 않은 경우:

```text
Level / XP / Avatar 영역
→ compact loading placeholder
```

전체 Home을 빈 Loading 화면으로 막지 않는다.

## 6.13 Error State

개인 사용자 정보 로딩 실패가 Home 전체 사용을 막으면 안 된다.

예:

```text
User summary loading failed
→ Hero / Learn / Practice / Quest / Daily Challenge는 계속 사용 가능
```

필요한 경우 Header의 개인 정보 영역만 fallback 상태로 표시한다.

## 6.14 Responsive Behavior

### Desktop

```text
Header
Hero 2-column
Choose Your Next Step 2x2 grid
Footer
```

첫 viewport에서는 Hero 아래 Section이 보이지 않도록 충분한 높이를 유지한다.

### Tablet

Hero는 화면 너비에 따라 2-column 또는 1-column으로 자연스럽게 전환한다.

4개 Card는 `2 x 2` 구조를 우선 사용한다.

### Mobile

Hero는 다음 순서로 세로 배치할 수 있다.

```text
Headline
Description
CTA
Git Visual
Guinea Pig
```

Git Visual과 Mascot은 Mobile에서도 서로 겹치지 않는다.

4개 Card는 1-column stack으로 표시한다.

가로 스크롤이 발생하면 안 된다.


# 7. Learn

## 7.1 Routes

```text
/learn
/learn/:lessonSlug
```

## 7.2 Access

### Guest

Guest는 `/learn`에 접근할 수 있다.

Guest는 다음 Lesson에 접근할 수 있다.

```text
Lesson 1 — Git & Repository
Lesson 2 — Working Directory / Staging / Commit
Lesson 3 — Branch
```

다음 Lesson은 목록에 표시되지만 `Locked` 상태로 유지한다.

```text
Lesson 4 — Merge
Lesson 5 — Remote / Fetch / Pull / Push
```

Guest가 Locked Lesson을 선택하면 Lesson Detail로 진입하지 않고 로그인 또는 회원가입 안내를 표시한다.

### Authenticated User

Authenticated User는 모든 Lesson에 접근할 수 있다.

---

## 7.3 Learn List Page

### Route

```text
/learn
```

### Purpose

사용자가 전체 학습 경로와 각 Lesson의 상태를 한눈에 확인하고,
원하는 사용 가능한 Lesson을 선택할 수 있도록 한다.

### Layout

페이지 상단에는 다음을 표시한다.

```text
Lessons

Follow the learning path or jump to any unlocked lesson.
```

오른쪽 또는 보조 영역에는 현재 완료 상태를 간결하게 표시할 수 있다.

예:

```text
2 / 5 complete
```

Lesson들은 세로 학습 경로 형태로 배치한다.

각 Lesson Card는 다음 정보를 포함한다.

```text
Lesson number
Lesson title
Short description
Difficulty
XP reward
Optional chapter count
Lesson state
```

### Lesson States

최소 다음 상태를 구분한다.

```text
Completed
Current / In Progress
Available
Locked
```

#### Completed

- 완료 아이콘 또는 check 표시
- 완료 상태 Badge 표시
- 다시 진입 가능

#### Current / In Progress

- 현재 학습 중임을 시각적으로 강조
- `Continue` 등 진행 상태를 나타내는 action 사용 가능
- 다른 카드보다 accent border 또는 progress indicator를 사용할 수 있음

#### Available

- 정상 접근 가능
- 클릭 시 해당 Lesson Detail로 이동

#### Locked

- Card 자체는 숨기지 않는다.
- 텍스트와 Card를 visually disabled 상태로 표시한다.
- Guest의 Lesson 4~5는 항상 Locked 처리한다.
- 클릭 시 회원가입/로그인 안내를 표시한다.


### Lesson Card Navigation

```text
Available / Completed / Current Lesson Card 선택
→ /learn/:lessonSlug

Locked Lesson Card 선택
→ Locked 안내
→ Sign Up / Log In
```

### Empty State

기본 Seed Lesson이 항상 존재해야 하므로 일반 상황에서 Empty State는 발생하지 않아야 한다.

데이터 로딩 실패와 Empty Data를 구분한다.

### Error State

Lesson 목록 로딩 실패 시:

```text
Lessons could not be loaded.

[ Retry ]
```

를 제공한다.

---

## 7.4 Lesson Detail Page

### Route

```text
/learn/:lessonSlug
```

### Purpose

사용자가 Git 개념을 단순 암기하는 것이 아니라,
협업 상황을 먼저 이해하고 왜 필요한지 학습한 뒤,
개념과 명령어를 익히고 직접 Mini Practice를 수행하도록 한다.

### Lesson Structure

모든 Lesson은 다음 6단계 학습 흐름을 기본으로 사용한다.

```text
1. Situation
2. Why?
3. Concept
4. Command
5. Practice
6. Result
```

Lesson 콘텐츠에 따라 내부 설명 내용은 달라질 수 있지만,
전체 학습 흐름과 UI 구조는 가능한 한 일관되게 유지한다.

### Breadcrumb

Lesson Detail 상단에는 현재 위치를 표시한다.

예:

```text
Learn / Branch
```

`Learn`은 Lesson 목록으로 돌아가는 Navigation으로 사용할 수 있다.

---

## 7.5 Lesson Progress Indicator

Lesson Detail 상단에는 6단계를 표시하는 progress indicator를 둔다.

```text
Situation
Why?
Concept
Command
Practice
Result
```

상태 표현:

```text
Completed step
→ green

Current step
→ orange / primary accent

Future step
→ gray
```

현재 단계가 명확히 구분되어야 한다.

사용자는 하단 `Back` / `Next`를 사용해 단계 간 이동한다.

이미 도달한 이전 단계는 **항상 다시 열어볼 수 있어야 한다.**
학습자는 `Situation → Why? → Concept → Command → Practice`를 진행한 뒤에도
앞 단계로 돌아가 설명과 명령어를 다시 확인할 수 있다.

상단 Step Indicator에서 이미 도달한 Step을 선택해 이동하는 UI를 제공할 수 있으며,
최소한 `Back` / `Previous`를 통해 이전 Step으로 이동하는 기능은 반드시 제공한다.

아직 도달하지 않은 Future Step을 임의로 건너뛰는 것은 기본 동작으로 요구하지 않는다.

---

## 7.6 Situation Step

### Purpose

Git 기능이나 명령어를 먼저 설명하지 않고,
사용자가 실제 팀 협업 상황을 먼저 이해하도록 한다.

### Content

Situation 화면은 다음 요소를 포함할 수 있다.

```text
Situation label
Scenario title
Short scenario description
Virtual teammate message
User role / user response
```

예:

```text
A New Feature Request

Your tech lead asks you to implement a login page
without breaking the main branch.
```

Virtual Guinea Pig Teammate의 message bubble을 사용해 협업 맥락을 시각적으로 보여주는 것을 권장한다.

사용자 본인의 역할 또는 예상 응답도 별도의 message bubble로 표현할 수 있다.

Situation은 긴 본문 문단만 배치한 문서형 화면으로 만들지 않는다.
가능하면 다음 중 2개 이상을 조합한다.

```text
Guinea Pig teammate
message bubble
role label
small repository / branch visual
highlighted problem statement
```

사용자는 첫 화면에서 "누가 무엇을 부탁했고, 현재 어떤 문제가 있는가"를 빠르게 파악할 수 있어야 한다.

### Rules

Situation 단계에서는 정답 Git Command를 직접 보여주지 않는다.

이 단계의 목적은:

```text
"어떤 문제가 발생하고 있는가?"
```

를 이해시키는 것이다.

---

## 7.7 Why? Step

### Purpose

현재 상황에서 왜 특정 Git 개념이 필요한지 설명한다.

Git 기능 자체를 정의하기 전에,
기능이 없을 때 발생하는 협업 문제를 먼저 이해시키는 것이 핵심이다.

### Content

다음 구조를 권장한다.

```text
Why? label
Main question
Problem explanation
Comparison
```

비교 UI는 상황에 따라 사용할 수 있다.

예:

```text
Without branches
vs
With branches
```

잘못된 접근과 올바른 접근을 단순하고 명확하게 비교한다.

Why?는 설명 문단만 길게 표시하지 않는다.
가능하면 `Without / With`, Before / After, 두 Repository 상태 비교처럼
**문제와 해결 효과를 한눈에 비교할 수 있는 시각 구조**를 사용한다.

Guinea Pig guide note를 사용해 핵심 이유를 한두 문장으로 요약할 수 있다.

### Rules

설명은 명령어 syntax보다 협업 결과와 문제에 초점을 둔다.

---

## 7.8 Concept Step

### Purpose

앞 단계에서 이해한 문제를 해결하기 위해 필요한 Git 개념의 내부 의미를 설명한다.

### Content

다음 요소를 포함할 수 있다.

```text
Concept label
Concept title
Concept explanation
Repository / Git Graph visualization
Guinea Pig guide note
```

예:

```text
What is a branch?

A branch is a lightweight pointer to a commit.
```

### Visualization

가능한 경우 개념 설명 바로 아래에 Git Graph 또는 Repository State visualization을 표시한다.

Branch Lesson의 경우 다음 요소를 시각화할 수 있다.

```text
commit nodes
main pointer
HEAD
branch pointer
origin/main
```

### Guinea Pig Guide

Guide 캐릭터는 짧은 비유나 보충 설명을 제공할 수 있다.

Guide 설명은 본문을 반복하지 않고 이해를 돕는 역할이어야 한다.

Concept 역시 긴 텍스트만 제공하는 화면으로 구현하지 않는다.

기본 학습 구성은 다음 우선순위를 따른다.

```text
짧은 핵심 설명
→ 큰 Git Graph / Repository visualization
→ Guinea Pig guide note
→ 필요한 추가 설명
```

사용자가 Graph와 pointer/HEAD/branch 변화 등을 보면서 개념을 이해하도록 한다.

---

## 7.9 Command Step

### Purpose

사용자가 앞 단계에서 이해한 Git 개념을 실제 CLI 명령어와 연결한다.

### Command Count

한 화면에 너무 많은 명령어를 나열하지 않는다.

각 개념에서 가장 중요한 핵심 명령어 약 3개를 우선 제공한다.

목표는 명령어 개수 자체가 아니라,
각 명령어가 언제 사용되고 어떻게 다른지 이해시키는 것이다.

### Branch Lesson Example

Branch 생성 관련 핵심 명령 예:

```bash
git branch feature/login
```

의미:

```text
새 branch를 생성하지만 현재 branch는 변경하지 않는다.
```

```bash
git switch -c feature/login
```

의미:

```text
새 branch를 생성하고 즉시 그 branch로 이동한다.
GitneaPig에서 현대적인 기본 사용 방식으로 소개한다.
```

```bash
git checkout -b feature/login
```

의미:

```text
새 branch를 생성하고 즉시 이동하는 기존 방식.
오래된 프로젝트나 문서에서도 자주 볼 수 있다.
```

`git checkout feature/login`처럼 이미 존재하는 branch로 이동하는 명령은
필요한 Lesson 맥락에서 별도로 설명할 수 있다.

### Rules

각 Command Block은 최소 다음을 포함한다.

```text
Exact Command / Syntax
Short explanation
Concrete example
Difference from similar commands when relevant
```

**Command 단계는 정답을 숨기는 단계가 아니다.**
Learn의 목적은 여기에서 사용자가 실제로 사용할 명령어를 명확하게 배우는 것이다.

즉, 해당 Lesson의 Practice에서 필요하게 될 핵심 명령어와 사용 예시는
Command Step에서 직접 보여주고 설명한다.

다만 Practice Step으로 넘어가면 그 정답 Command를 Terminal에 미리 채우거나
바로 옆에 그대로 답으로 노출하지 않는다.

학습 의도:

```text
Command Step
→ 보고 이해하고 배운다.

Practice Step
→ 방금 배운 내용을 기억해서 직접 입력한다.
```

가능하면 한 viewport 안에서 핵심 명령어를 모두 확인할 수 있도록 유지한다.

---

## 7.10 Practice Step

### Purpose

사용자가 바로 앞 Command 단계에서 학습한 내용을 직접 기억하고 판단해 적용하도록 한다.

Practice는 단순 복사 입력 문제가 되어서는 안 된다.

### Instruction

Practice 상단에는 수행 목표를 자연어로 제공한다.

예:

```text
Create the feature branch

Rico is waiting.
Create a branch called feature/login
and move to that branch.
```

### Answer Disclosure Rule

Terminal 안에 정답 Command를 미리 표시하지 않는다.

금지 예:

```text
# Mini Practice - try: git branch feature/login
```

이와 같이 정답을 직접 보여주는 힌트는 기본 상태에서 제공하지 않는다.

Terminal 초기 상태는 다음처럼 비어 있어야 한다.

```text
user@gitneapig:~/project$ _
```

### Valid Solutions

정답 판정은 raw command string 일치 여부가 아니라
최종 Repository State를 기준으로 한다.

예:

```text
Success Condition:
currentBranch == "feature/login"
```

따라서 아래처럼 동일한 결과를 만드는 여러 유효한 방법을 허용할 수 있다.

```bash
git switch -c feature/login
```

```bash
git checkout -b feature/login
```

필요한 경우 여러 명령 조합 역시 동일한 성공 상태를 만들면 인정한다.

### Simulator

Mini Practice는 Practice 페이지와 동일한 Simulator Engine을 사용한다.

Learn 전용 가짜 command handler를 별도로 구현하지 않는다.

### Desktop Layout

Practice 영역은 다음 두 주요 패널을 사용한다.

```text
Terminal
Git Graph / Repository Visualization
```

권장 비율:

```text
Terminal approximately 60%
Git Graph approximately 40%
```

Git Graph를 너무 좁은 sidebar로 만들지 않는다.

사용자가 Repository State의 변화를 쉽게 볼 수 있을 만큼 충분한 크기를 제공한다.

### Git Graph Behavior

명령 실행 전과 후의 상태 변화를 즉시 반영한다.

예:

```text
Before

main ← HEAD
  ●
```

Branch 생성 및 이동 후:

```text
feature/login ← HEAD
       ↓
       ●
       ↑
      main
```

실제 Graph 표현은 Commit History에 따라 정확하게 렌더링한다.

### Command Error

잘못된 명령을 입력하면:

```text
Terminal output에 오류 표시
Repository State는 잘못 변경하지 않음
Graph는 실제 state와 동일하게 유지
```

필요한 경우 Guinea Pig feedback을 사용할 수 있다.

### Reset

Lesson Practice에는 현재 Mini Practice attempt를 처음 상태로 되돌리는 `Reset` action을 제공한다.

Reset 동작:

```text
현재 LessonPracticeDefinition.initialState 복원
Terminal output/history 초기화
Git Graph / Repo State 초기화
현재 Practice success temporary state 초기화
Guinea Pig feedback 초기화
```

Lesson Practice의 Reset은 학습용 짧은 attempt이므로 **Confirmation Modal 없이 즉시 실행**한다.

Reset은 상단 workspace control 영역에서 쉽게 찾을 수 있어야 하며,
`Git Graph` / `Repo State`처럼 view를 전환하는 Tab으로 취급하지 않는다.

Reset은 Lesson의 이미 저장된 과거 완료 기록이나 계정 XP를 삭제하지 않는다.

### Terminal Scroll

명령/output이 많아져도 Lesson Detail Page 자체가 Terminal history 때문에 계속 길어지면 안 된다.

```text
Terminal output area
→ independent vertical scroll container
→ overflow-y: auto

Page
→ Terminal output 때문에 자동으로 아래로 밀리지 않음
```

새 output auto-scroll은 Terminal container 내부에서만 수행한다.
사용자가 과거 output을 보기 위해 위로 스크롤한 경우 현재 위치를 강제로 빼앗지 않는다.

### Mobile Layout

Mobile에서는 Terminal과 Git Graph를 억지로 좌우 배치하지 않는다.

다음 중 적합한 방식을 사용한다.

```text
Terminal
↓
Git Graph
```

또는

```text
Tabs:
Terminal | Graph
```

가로 overflow가 발생하면 안 된다.

---

## 7.11 Result Step

### Purpose

Lesson 완료 결과와 다음 행동을 명확하게 보여준다.

### Completion Panel

최소 다음 정보를 표시한다.

```text
Lesson Complete
Guinea Pig celebration visual
Lesson completion message
XP reward information
```

### Authenticated User

Authenticated User가 처음 Lesson을 완료한 경우:

```text
Progress 저장
XP 지급
Achievement 조건 검사
```

동일 Lesson 완료 요청이 중복되어도 XP를 중복 지급하지 않는다.

### Guest

Guest가 접근 가능한 Lesson 1~3을 완료한 경우
완료 경험 자체는 허용한다.

다만 Progress와 XP는 영구 저장하지 않는다.

예:

```text
Lesson Complete!

+180 XP available

Sign in to save your progress and XP.

[ Sign Up ]
[ Log In ]
```

### Main Actions

Result 화면의 두 주요 다음 행동은 다음 위치 관계를 사용한다.

```text
Left
→ Hands-on / Practice More

Right
→ Next Lesson
```

`Next Lesson`이 일반적인 학습 진행 방향이므로 Primary Action으로 취급한다.

예:

```text
┌────────────────────────┐  ┌────────────────────────┐
│ Hands-on               │  │ Next Lesson            │
│ Practice More →        │  │ Merge →                │
└────────────────────────┘  └────────────────────────┘
```

동작:

```text
Practice More
→ /practice

Next Lesson
→ 다음 Lesson Detail
```

### Bottom Navigation

하단에는 필요에 따라 다음을 표시한다.

```text
Previous
Current step count
Back to Lessons
```

반드시:

```text
Back to Lessons
```

를 사용한다.

동작:

```text
Back to Lessons
→ /learn
```

이전 학습 Step으로 이동하는 action은 `Previous`를 사용한다.

---

## 7.12 Practice More Action During Lesson

Lesson Detail 상단 또는 적절한 위치에 `Practice More` action을 제공할 수 있다.

동작:

```text
Practice More
→ /practice
```

가능하면 현재 Lesson의 개념과 관련된 Repository State를 Practice에 넘길 수 있지만,
이는 필수 요구사항은 아니다.

기본 구현에서는 `/practice`의 기본 Sandbox로 이동해도 된다.

---

## 7.13 Lesson Navigation Rules

`Next`:

```text
현재 Step이 완료 가능한 상태
→ 다음 Step으로 이동
```

`Back` 또는 `Previous`:

```text
이전 Step으로 이동
→ Repository Practice state를 임의로 삭제하지 않음
→ 이미 도달한 이전 Step의 학습 콘텐츠를 다시 읽을 수 있음
```

이미 도달한 Step은 다시 방문 가능하다.
예를 들어 Practice에서 Command로 돌아가 명령어를 다시 확인한 뒤
다시 Practice로 이동할 수 있어야 한다.

마지막 Result에서는:

```text
Next Lesson
Back to Lessons
Practice More
```

를 제공한다.

Locked Lesson로 자동 이동시키지 않는다.

Guest가 Lesson 3을 완료한 뒤 다음 Lesson이 Locked인 경우,
`Next Lesson`을 통해 바로 Locked Lesson Detail로 보내지 않는다.

대신 회원가입/로그인 안내를 제공한다.

---

## 7.14 Loading State

Lesson List:

```text
Lesson card skeleton
```

Lesson Detail:

```text
현재 Step content skeleton
```

사용자 Progress만 늦게 로드되는 경우
Lesson 콘텐츠 전체를 막지 않는다.

---

## 7.15 Error State

Lesson 데이터 로딩 실패:

```text
Lesson could not be loaded.

[ Retry ]
[ Back to Lessons ]
```

Mini Practice Simulator 오류:

```text
현재 Repository State를 손상시키지 않음
오류 메시지 표시
Retry 또는 Reset 가능
```

---

## 7.16 Responsive Behavior

### Learn List

Desktop:

```text
Vertical learning path
Wide Lesson Cards
```

Mobile:

```text
Single-column cards
Progress line and card content remain readable
```

### Lesson Detail

Desktop:

```text
Centered learning content
Progress indicator
Single primary content column
```

Practice Step에서만 Terminal + Graph의 multi-panel layout을 사용한다.

Mobile에서는 모든 Step을 single-column 중심으로 재구성한다.

Progress indicator는 작은 화면에서:

```text
horizontal scroll
compact labels
또는 condensed step indicator
```

중 하나를 사용하되 현재 단계는 항상 명확해야 한다.

---


# 8. Practice

## 8.1 Route

```text
/practice
```

## 8.2 Access

### Guest

Guest도 Practice를 사용할 수 있다.

Guest는 다음을 모두 사용할 수 있다.

```text
Playground 선택
Terminal
지원 Git Command 실행
Git Graph
Repo State
Command Guide
Reset
```

Practice 자체는 로그인 기능으로 잠그지 않는다.

### Authenticated User

Authenticated User도 동일한 Practice 기능을 사용할 수 있다.

Practice는 기본적으로 자유 실습 영역이며,
사용자의 XP나 Progress에 직접적인 필수 보상을 연결하지 않는다.

---

## 8.3 Purpose

Practice는 사용자가 Git 명령어를 자유롭게 실험하고,
명령 실행 결과가 Repository 내부 상태에 어떤 변화를 만드는지 직접 확인하는 Interactive Git Sandbox다.

Practice는 Learn이나 Quest와 역할이 다르다.

```text
Learn
→ 왜 필요한지, 개념과 핵심 명령어를 가르친다.

Practice
→ 선택한 Git 상황에서 자유롭게 실험하고 빠르게 Command Guide를 참고한다.

Quest
→ Guide 없이 실제 협업 상황에서 어떤 Git 행동이 필요한지 스스로 판단한다.
```

Practice 안에서 Learn의 긴 설명을 반복하지 않는다.

Command Guide는 빠른 참고용 도구로만 사용한다.

---

## 8.4 Entry Flow

사용자가 `/practice`에 처음 진입하면
바로 빈 Terminal만 표시하지 않는다.

먼저 어떤 종류의 Git 상황을 실습할지 선택하는 Playground Selection 화면을 표시한다.

```text
Practice
  ↓
Choose a Playground
  ↓
Playground 선택
  ↓
해당 Initial Repository State 생성
  ↓
Practice Workspace 진입
```

기본 Playground는 다음 5개를 제공한다.

```text
Free Sandbox
Basic Repo
Branch Playground
Merge Playground
Remote Playground
```

---

## 8.5 Playground Selection

### Purpose

Git 초보자가 아무 설명 없이 빈 Terminal을 보고
"여기서 뭘 해야 하지?"라고 느끼지 않도록 시작점을 제공한다.

각 Playground는 다음 정보를 Card로 표시한다.

```text
Playground title
Short description
Primary concepts
Representative commands
Difficulty
Start action
```

Category Playground(`BASIC`, `BRANCH`, `MERGE`, `REMOTE`)에 진입하면
필수 Objective 대신 **optional practice suggestions**를 제공한다.

예:

```text
Try:
• Inspect existing branches
• Create a feature branch
• Switch between branches
• Compare branch history
```

이 항목은 사용 방향을 제안하는 안내일 뿐 성공 조건이 아니다.

```text
체크리스트 완료율 없음
필수 순서 없음
XP 없음
success/failure 판정 없음
```

Practice의 핵심은 자유 실습이며, Quest/Challenge처럼 만들지 않는다.

Card를 선택하면 해당 Playground의 Initial Repository State를 생성하고 Practice Workspace로 이동한다.


### Free Sandbox

목적:

```text
특정 주제나 목표에 제한되지 않고
Simulator가 지원하는 Git Command를 자유롭게 실험한다.
```

특징:

```text
특정 학습 Objective 없음
모든 지원 Command 사용 가능
Command Guide는 전체 지원 명령 기준
최소한의 기본 Repository State 제공
Reference의 "Practice in Terminal"과 연결
```

Initial State 예:

```text
main branch
2~3개의 기본 commit
clean working tree
empty staging area
origin/main 존재 가능
```

Reference에서 특정 Command Detail의 `Practice in Terminal`을 선택해 Free Sandbox로 진입한 경우,
해당 Command를 Command Guide에서 강조할 수 있다.

예:

```text
/reference/commands/push
→ Practice in Terminal
→ /practice?mode=free&command=push
```

이 경우 Practice는 Free Sandbox로 시작하고,
Command Guide에서 `git push` 항목을 강조한다.

### Basic Repo

목적:

```text
Working Tree
Staging Area
Commit
Log
```

등 가장 기본적인 Git 흐름을 연습한다.

대표 Command Guide:

```text
git status
git add <file>
git add .
git commit -m "<message>"
git log
git log --graph
```

Initial State 예:

```text
main branch
기본 commit history
modified file
untracked file
empty staging area
```

### Branch Playground

목적:

```text
branch 생성
branch 목록 확인
branch 이동
HEAD 변화
branch 삭제
```

등을 자유롭게 연습한다.

대표 Command Guide:

```text
git branch
git branch <name>
git switch <name>
git switch -c <name>
git checkout -b <name>
git branch -d <name>
git log --graph
```

Initial State 예:

```text
main
feature/login
feature/profile
multiple commits
HEAD on main
```

사용자가 branch를 생성, 이동, 삭제하면서
Graph와 branch pointer 변화를 쉽게 확인할 수 있어야 한다.

### Merge Playground

목적:

```text
branch divergence
fast-forward merge
3-way merge
merge conflict
conflict resolution
```

을 연습한다.

대표 Command Guide:

```text
git branch
git switch <name>
git merge <branch>
git status
git add <file>
git commit
git log --graph
```

Initial State는 merge를 연습할 수 있도록
main과 feature branch가 적절히 분기된 상태를 제공한다.

일부 Reset Preset 또는 상황에서는 conflict를 재현할 수 있어야 한다.

### Remote Playground

목적:

```text
remote repository
remote-tracking branch
fetch
pull
push
remote ahead / local ahead
```

관계를 연습한다.

대표 Command Guide:

```text
git fetch
git pull
git push
git log --graph
git status
```

Initial State 예:

```text
local main
origin/main
virtual remote main
local / remote commit difference
```

실제 외부 GitHub Repository와 통신하지 않는다.

모든 Remote 동작은 Simulator 내부의 Virtual Remote State를 사용한다.

---

## 8.6 Practice Workspace Overall Layout

Playground를 선택하면 Practice Workspace를 표시한다.

Desktop 기본 구조:

```text
Global Header

Practice Toolbar

┌───────────────────────────────────┬──────────────────────────┐
│                                   │                          │
│                                   │ Git Graph                │
│            Terminal               │ Repo State               │
│                                   │ Command Guide            │
│                                   │                          │
│                                   │                          │
└───────────────────────────────────┴──────────────────────────┘

Guinea Pig Feedback
```

### Desktop Width Ratio

Terminal이 화면 전체를 독점하지 않는다.

권장 비율:

```text
Terminal
→ approximately 60~65%

Right Panel
→ approximately 35~40%
```

Git Graph가 실제 학습 도구로 충분히 보일 수 있도록
오른쪽 패널을 지나치게 좁게 만들지 않는다.

---

## 8.7 Practice Toolbar

Workspace 상단 Toolbar에는 최소 다음 정보를 제공한다.

```text
Practice
Current Playground
Current Branch
HEAD identifier
Reset
Change Playground
```

예:

```text
Practice
Branch Playground

branch: main
HEAD: f4a8c2d
```

### Change Playground

사용자가 다른 Playground로 이동하려 할 경우,
현재 Sandbox State가 초기화될 수 있음을 알린다.

필요한 경우 Confirmation Modal을 표시한다.

```text
Changing playground will reset the current sandbox.

[ Cancel ]
[ Change Playground ]
```

### Reset

Reset은 현재 Playground의 Initial Repository State로 되돌린다.

Reset 클릭:

```text
Reset
 ↓
Confirmation
 ↓
현재 Repository State 초기화
Terminal history 초기화
Git Graph 초기화
Repo State 초기화
Guinea Pig feedback 초기화
```

사용자가 실수로 작업을 잃지 않도록 확인 단계가 있어야 한다.

---

## 8.8 Terminal

### Purpose

사용자가 Simulator가 지원하는 Git Command를 직접 입력한다.

### Initial Content

Workspace 시작 시 Terminal에는 간단한 환경 정보만 표시한다.

예:

```text
# Welcome to GitneaPig Practice Terminal
# Playground: Branch Playground
# Repository: pixel-paw
# Type help for available commands
```

정답이나 권장 행동을 강제로 제시하지 않는다.

### Command Input

입력 영역:

```text
user@gitneapig:~/project$ _
```

Enter:

```text
현재 입력 Command 실행
```

ArrowUp:

```text
이전에 실행한 Command 불러오기
```

ArrowDown:

```text
Command History에서 다음 Command 불러오기
```

### Command History

실행된 Command와 output은 Terminal 위쪽에 계속 누적한다.

지원하지 않는 Command도 History에는 남긴다.

예:

```text
$ git status
On branch main
...

$ git branch feature/login
Branch 'feature/login' created.
```

### Invalid Command

지원하지 않는 Command 입력 시:

```text
Repository State 변경 금지
Terminal에 명확한 오류 출력
Command History에는 기록
Guinea Pig feedback을 사용할 수 있음
```

예:

```text
git: unsupported command 'rebase'

Type help to see supported commands.
```

---

## 8.9 Command Help

Practice Terminal에서는 최소 다음 자체 도움 기능을 제공한다.

```text
help
```

권장 추가 지원:

```text
git --help
git help
git help <command>
```

실제 Git man page 전체를 복제할 필요는 없다.

GitneaPig Simulator가 지원하는 범위만 간결하게 보여준다.

예:

```text
$ git --help

Supported commands:

status
add
commit
log
branch
switch
merge
fetch
pull
push

Type:
git help <command>
```

Command Help와 오른쪽 `Command Guide`는 동일한 Command Catalog를 Source of Truth로 사용한다.

---

## 8.10 Right Panel Tabs

오른쪽 패널은 다음 3개의 주요 Tab을 제공한다.

```text
Git Graph
Repo State
Command Guide
```

기본 Tab은 `Git Graph`로 시작한다.

Tab 변경은 Terminal State를 초기화하지 않는다.

---

## 8.11 Git Graph Tab

### Purpose

사용자가 Git Command 실행으로 인해
Commit, Branch, HEAD, Remote Tracking 상태가 어떻게 변하는지 시각적으로 확인한다.

### Visual Elements

상황에 따라 다음을 표시한다.

```text
Commit nodes
Parent relationship
Branch pointers
HEAD
Current branch
Remote-tracking branches
Virtual remote branch
Merge commit
Diverged history
```

### Size

Git Graph는 작은 장식 UI가 아니다.

오른쪽 패널의 주요 영역을 충분히 사용해야 한다.

Graph가 화면에서 읽기 어려울 정도로 작으면 안 된다.

Commit node, branch label, HEAD label을 식별할 수 있어야 한다.

### Real-time Update

유효한 Git Command 실행 직후
RepositoryState를 기준으로 Graph를 즉시 다시 렌더링한다.

예:

```text
git switch -c feature/login
→ feature/login pointer 생성
→ HEAD가 feature/login으로 이동
→ Graph 즉시 갱신
```

```text
git commit -m "login form"
→ 새 commit node 생성
→ current branch pointer 이동
→ HEAD 이동
→ Graph 즉시 갱신
```

### Accuracy

Graph는 Terminal output과 독립적으로 임의 상태를 만들지 않는다.

항상 Simulator의 실제 RepositoryState를 렌더링한다.

---

## 8.12 Repo State Tab

### Purpose

Git Graph만으로 확인하기 어려운 Repository 내부 상태를 구조적으로 보여준다.

최소 다음 정보를 표시한다.

```text
Current Branch
HEAD
Working Tree
Staging Area
Branches
Remote
Remote-tracking branches
Conflict state
```

### Working Tree

파일별 상태 예:

```text
modified
untracked
deleted
conflicted
```

### Staging Area

파일별 상태 예:

```text
added
modified
deleted
resolved
```

### Remote

Remote Playground에서는 다음 차이를 명확히 볼 수 있어야 한다.

```text
local branch
origin/main
actual virtual remote branch
```

---

## 8.13 Command Guide Tab

### Purpose

현재 Playground에서 어떤 Git 기능을 연습할 수 있는지 빠르게 확인하는 참고 도구다.

Command Guide는 Learn을 대체하지 않는다.

긴 이론 설명이나 협업 배경 설명을 넣지 않는다.

각 항목은 간결하게 다음을 제공한다.

```text
Command syntax
Short purpose
Optional short example
```

### Contextual Guide Rule

Command Guide는 현재 선택한 Playground에 따라 기본 목록이 달라진다.

예:

```text
Branch Playground
→ Branch 관련 Command Guide

Merge Playground
→ Merge 관련 Command Guide

Remote Playground
→ Remote 관련 Command Guide
```

사용자가 모든 지원 명령어를 보고 싶다면 다음 action을 제공할 수 있다.

```text
View all supported commands
```

### Branch Playground Guide Example

```text
git branch
→ List branches

git branch <name>
→ Create a branch

git switch <name>
→ Switch to an existing branch

git switch -c <name>
→ Create and switch to a new branch

git checkout -b <name>
→ Create and switch using legacy checkout syntax

git branch -d <name>
→ Delete a branch

git log --graph
→ View commit history as a graph
```

### Single Source of Truth

다음은 동일한 Command Catalog를 사용해야 한다.

```text
Simulator parser / handler registry
Practice Command Guide
Terminal help
Reference
```

Command 설명을 각 화면에 서로 다르게 하드코딩하지 않는다.

---

## 8.14 Guinea Pig Feedback

Practice Workspace에는 짧은 Guinea Pig Feedback 영역을 제공할 수 있다.

역할:

```text
방금 실행한 Command의 결과를 짧게 설명
오류가 발생했을 때 이해를 도움
흥미로운 상태 변화를 알려줌
```

예:

```text
You created a new branch, but HEAD is still on main.
```

```text
You switched to feature/login.
HEAD moved with you.
```

```text
Push completed.
Your virtual teammates can now see the remote branch.
```

Feedback은 다음 행동의 정답을 직접 지시하지 않는다.

Practice는 자유 실습 공간이므로
Guinea Pig가 매번 특정 Command를 입력하라고 요구하지 않는다.

---

## 8.15 Supported Git Commands

Practice Simulator의 기본 지원 범위는 다음과 같다.

```text
git status
git add
git commit
git log
git branch
git switch
git checkout
git merge
git fetch
git pull
git push
```

세부 option은 Simulator가 실제로 구현하는 범위만 지원한다.

지원하지 않는 option은 성공한 것처럼 처리하지 않는다.

명확한 unsupported message를 반환한다.

예:

```text
This option is not supported in the GitneaPig simulator yet.
```

Command Catalog에는 각 Command의 Simulator 지원 여부를 명시한다.

---

## 8.16 Playground and Learn Relationship

Playground는 Learn 진행도와 완전히 동일한 범위로 제한하지 않는다.

예:

```text
사용자가 Learn에서 Branch의 기본 개념만 학습했더라도
Branch Playground에서는 더 다양한 Branch Command를 실험할 수 있다.
```

하지만 Practice의 Command Guide는 짧은 syntax 설명만 제공한다.

개념을 제대로 학습하고 싶은 경우
관련 Lesson으로 이동할 수 있는 optional link를 제공할 수 있다.

예:

```text
Need the concept first?
Open Branch Lesson
```

이 link는 필수 action이 아니라 보조 action이다.

---

## 8.17 No Practice Success Goal

Practice는 Quest나 Lesson Mini Practice와 달리
전체 Sandbox에 하나의 필수 성공 조건을 두지 않는다.

사용자는 자유롭게 다음을 반복할 수 있다.

```text
Command 실행
State 확인
Reset
다른 Command 실험
Playground 변경
```

특정 Playground가 간단한 suggested experiment를 보여줄 수는 있지만,
이를 완료해야 Practice를 사용할 수 있도록 강제하지 않는다.

---

## 8.18 Terminal Scroll Behavior

Practice Terminal에서 Command output이 추가될 때
Browser/Page 전체 scroll 위치를 변경하지 않는다.

Auto-scroll은 Terminal container 내부에서만 수행한다.

규칙:

```text
사용자가 Terminal 맨 아래 근처를 보고 있음
→ 새 output으로 자연스럽게 auto-scroll

사용자가 Terminal 안에서 위쪽 history를 보고 있음
→ 현재 scroll 위치 유지
→ 필요하면 "New output" indicator 표시
```

Command 실행 때문에 Header, Right Panel 또는 Page 전체가
갑자기 아래로 이동하면 안 된다.

---

## 8.19 Loading State

Playground 목록 로딩 중:

```text
Playground card skeleton
```

Workspace 초기화 중:

```text
Terminal disabled
Right Panel loading state
```

초기 Repository State 생성이 끝나면 입력을 활성화한다.

---

## 8.20 Error State

Playground 초기화 실패:

```text
Practice environment could not be created.

[ Retry ]
[ Back to Playground Selection ]
```

Command 실행 중 내부 오류:

```text
현재 Repository State를 손상시키지 않음
Terminal에 오류 표시
사용자가 Reset 또는 재시도 가능
```

---

## 8.21 Responsive Behavior

### Desktop

```text
Terminal 60~65%
Right Panel 35~40%
```

Git Graph는 충분한 크기를 유지한다.

### Tablet

화면 폭이 충분하면 split layout을 유지할 수 있다.

좁아지는 경우 비율을 조정하거나 panel 전환 UI를 사용한다.

### Mobile

Terminal과 Right Panel을 동시에 억지로 좌우 배치하지 않는다.

권장:

```text
Terminal
Graph / Repo State / Guide tabs
```

를 세로로 배치하거나,
상단 Tab으로 주요 workspace를 전환한다.

Graph의 label과 commit node를 읽을 수 있어야 한다.

가로 overflow가 발생하면 안 된다.

---


# 9. Quest

## 9.1 Routes

```text
/quests
/quests/:questSlug
```

## 9.2 Access

### Guest

Guest는 Quest List와 Quest 체험에 접근할 수 있다.

Guest는 Quest를 실제로 플레이하고 완료할 수 있다.

다만 다음 데이터는 영구 저장하지 않는다.

```text
Quest completion progress
XP reward
Achievement unlock
Long-term statistics
```

Quest 완료 후 로그인 또는 회원가입을 안내할 수 있다.

### Authenticated User

Authenticated User는 모든 Quest 기능을 사용할 수 있다.

Quest 완료 시:

```text
QuestProgress 저장
XP 지급
Achievement 조건 검사
```

동일 Quest 완료 요청이 중복되어도 XP를 중복 지급하지 않는다.

---

## 9.3 Quest Purpose

Quest는 GitneaPig의 실제 협업 시뮬레이션 모드다.

Quest는 Learn의 Mini Practice보다 더 복합적인 상황을 제공해야 한다.

핵심 차이:

```text
Learn Mini Practice
→ 방금 배운 개념을 짧게 적용
→ 1~2개 핵심 행동

Practice
→ 자유 Sandbox
→ 목표 없음
→ Command Guide 사용 가능

Quest
→ 실제 협업 상황 기반
→ 여러 Git 행동을 연결해서 수행
→ Issue / PR / Review / Remote Event 등 발생
→ Command Guide 없음
→ 필요한 경우 Progressive Hint 사용
```

Quest는 단순히 한 개의 정답 Command를 입력하는 문제가 되어서는 안 된다.

---

## 9.4 Quest List Page

### Route

```text
/quests
```

### Purpose

사용자가 가능한 Quest와 완료 상태를 확인하고,
원하는 협업 시나리오를 선택할 수 있도록 한다.

### Default Quests

기본 Quest는 다음 5개를 제공한다.

```text
1. Feature Branch
2. Staging & Commit
3. Push & Pull Request
4. Remote Ahead
5. Merge Conflict
```

### Quest Card

각 Quest Card는 최소 다음 정보를 표시한다.

```text
Quest title
Scenario summary
Difficulty
XP reward
Estimated duration
Completion state
Relevant teammate avatars
```

### Quest States

최소 다음 상태를 구분한다.

```text
Completed
Available
Locked
```

필요한 경우 Current / In Progress 상태도 추가할 수 있다.


### Quest Unlock Rule

기본 Quest 5개는 순차적으로 unlock된다.

```text
Quest 1
→ initially available

Quest N completion
→ Quest N+1 available
```

Authenticated User는 unlock 상태를 `QuestProgress`로 영구 저장한다.

Guest는 현재 browser session 안에서만 다음 Quest가 unlock되며,
이 상태는 계정 progress/XP로 저장되지 않는다.


### Quest Navigation

```text
Available / Completed Quest 선택
→ /quests/:questSlug

Locked Quest 선택
→ Locked 안내
```

Guest에게 Quest 전체를 무조건 숨기지 않는다.

---

## 9.5 Quest Difficulty Principle

Quest는 Learn Mini Practice보다 분명히 복합적이어야 한다.

기본적으로 하나의 Quest는 최소 3~4개의 의미 있는 Git 행동이 연결되도록 설계한다.

권장 범위:

```text
3~6개의 주요 Git 행동
+
필요한 UI interaction
+
QuestEvent
```

예:

```text
상태 확인
→ 파일 선택
→ staging
→ commit
→ push
→ Pull Request
→ review 대응
```

Quest의 핵심은 단순한 Command 수가 아니라
상황을 이해하고 여러 상태 변화를 연결해서 해결하는 것이다.

---

## 9.6 Quest Detail Overall Layout

Desktop은 3-column 구조를 사용한다.

권장 비율:

```text
Left Panel
→ approximately 24%

Terminal
→ approximately 52%

Right Panel
→ approximately 24%
```

구조 예:

```text
┌────────────────────┬──────────────────────────────┬────────────────────┐
│                    │                              │                    │
│ Story              │                              │ Git Graph          │
│ Objectives         │          Terminal            │ Repo State         │
│ Teammates          │                              │                    │
│ Messages           │                              │                    │
│                    │                              │                    │
└────────────────────┴──────────────────────────────┴────────────────────┘
```

Terminal이 화면 대부분을 독점하지 않는다.

Story / Objectives와 Git Graph를 읽을 수 있을 만큼
좌우 Panel을 충분히 넓게 유지한다.

---

## 9.7 Quest Header / Toolbar

Quest Detail 상단에는 최소 다음 정보를 표시한다.

```text
Back to Quests
Quest title
XP reward
Hint
Reset
```

예:

```text
← Quests / Push & Pull Request     +220 XP

[ Hint ] [ Reset ]
```

### Reset

`Reset`는 Confirmation Modal 없이 즉시 현재 Quest attempt를 초기화한다.

클릭 즉시 다음 상태를 초기화한다.

```text
RepositoryState
Objectives
QuestEvents
Issue state
Pull Request state
Review state
Terminal history
Hint progress
Guinea Pig feedback
Current temporary quest attempt state
```

Reset은 다음 데이터는 삭제하지 않는다.

```text
과거 완료 기록
이미 지급된 XP
Achievement 기록
계정 데이터
```

즉 현재 진행 중인 attempt만 초기화한다.

---

## 9.8 Left Panel

Left Panel은 Quest의 상황과 협업 맥락을 전달한다.

상단 Tab은 Quest에 따라 다음을 사용할 수 있다.

```text
Story
Pull Request
Issues
```

### Story Tab

Story Tab은 다음 정보를 제공한다.

```text
Objectives
Virtual teammate messages
Current collaboration situation
Important context
```

### Objectives

Quest의 완료 조건을 Checklist 형태로 보여준다.

예:

```text
□ Inspect the repository state
□ Commit the required change
□ Push feature/login to origin
□ Open a Pull Request
□ Respond to Luna's review
```

Objective는 raw command string을 요구하지 않는다.

가능한 경우 State나 Event 기반으로 완료 여부를 판단한다.

### Teammate Messages

Virtual Guinea Pig Teammates는 실제 협업 맥락을 전달한다.

예:

```text
Rico:
"The homepage looks great.
Can you get feature/login up on origin so Luna can review it?"

Luna:
"I'm ready to review whenever you push it."
```

Message는 사용자가 정확히 어떤 Command를 입력해야 하는지 직접 지시하지 않는다.

---

## 9.9 Terminal Freedom Rule

Quest Terminal은 Quest가 허용한 몇 개의 Command만 실행하는 구조가 아니다.

Simulator가 지원하는 Command라면,
현재 Objective와 직접 관련이 없어도 정상적으로 실행한다.

예:

```bash
git status
git branch
git log
git switch main
```

사용자가 상태를 확인하거나 여러 접근을 실험하는 것을 허용한다.

### Important Rule

```text
Quest가 Command를 차단하는 것이 아니라
Simulator가 Command를 실행한다.

Quest는 실행 결과의 Repository State와 Event를 관찰한다.
```

지원되는 Command가 Objective에 필요하지 않더라도
"not what's needed here" 같은 이유로 실행 자체를 막지 않는다.

### Example

사용자가:

```bash
git branch
```

를 입력하면:

```text
* feature/login
  main
```

정상 출력.

Objective는 변하지 않을 수 있다.

사용자가:

```bash
git status
```

를 입력해도 정상적으로 현재 상태를 보여준다.

---

## 9.10 Mistakes and Recovery

Quest에서는 사용자의 실수도 실제 Simulator State에 반영될 수 있다.

예:

```text
잘못된 branch로 이동
불필요한 file staging
branch 삭제
원하지 않는 commit
```

Simulator가 지원하는 정상적인 Git 행동이라면
Quest가 이를 임의로 막지 않는다.

사용자는:

```text
Git Command로 복구
또는
Reset
```

를 선택할 수 있다.

이 구조는 사용자가 다양한 Git 행동을 실험하도록 장려한다.

---

## 9.11 Quest Success Conditions

Quest 성공 여부는 raw command string이 아니라
Repository State와 Simulator Event를 중심으로 판정한다.

예:

```text
REMOTE_SYNCED
COMMIT_EXISTS
CURRENT_BRANCH
MERGE_COMPLETED
FILE_CONFLICTED
CONFLICT_RESOLVED
PUSH_COMPLETED
```

Quest마다 여러 Success Condition을 조합할 수 있다.

예:

```text
Push & Pull Request Quest

1. feature/login에 필요한 commit 존재
2. remote feature/login이 해당 commit을 가리킴
3. Pull Request 생성됨
4. review event 처리됨
5. 필요한 후속 commit/push 완료
```

동일한 최종 상태를 만드는 유효한 여러 workflow를 허용할 수 있다.

---

## 9.12 Multi-step Quest Design

Quest는 하나의 짧은 명령 문제보다
작은 협업 에피소드처럼 구성한다.

### Example: Push & Pull Request Quest

Initial Context:

```text
Current Branch:
feature/login

Working Tree:
modified src/login.ts
modified README.md
untracked debug.log

Staging:
empty

Remote:
origin does not contain feature/login
```

Story:

```text
Rico:
"The login feature is ready for review.
Please make sure only the right changes are committed,
push the branch, and open a PR for Luna."
```

Possible Objectives:

```text
□ Inspect the repository state
□ Commit the login-related change
□ Push feature/login to origin
□ Open a Pull Request
□ Respond to Luna's review
```

Possible user flow:

```bash
git status
git add src/login.ts
git commit -m "feat: add login page"
git push -u origin feature/login
```

이후 UI interaction:

```text
Open Pull Request
```

PR 생성 후 QuestEvent:

```text
Luna Review arrives
```

예:

```text
Luna:
"Looks good, but please update the button label."
```

Simulator에 추가 modification이 생성될 수 있다.

사용자는 다시:

```bash
git add src/login.ts
git commit -m "fix: update login button label"
git push
```

와 같은 후속 작업을 수행해야 한다.

최종 조건을 만족하면 Quest를 완료한다.

---

## 9.13 Pull Request Tab

Quest에서 PR 단계가 발생하면
Left Panel의 `Pull Request` Tab을 활성화한다.

PR 화면은 GitHub의 협업 흐름을 단순화해 시뮬레이션한다.

최소 다음 정보를 제공할 수 있다.

```text
Source branch
Target branch
PR title
PR description
Reviewer
Review status
Merge status
```

### Create Pull Request

Push 등의 선행 조건을 만족한 경우:

```text
Open Pull Request
```

action을 활성화한다.

사용자가 클릭하면 PR 생성 UI를 표시한다.

Quest에 따라 title / description을 사용자가 입력하게 할 수 있다.

### Review

PR 생성 후 QuestEvent를 통해 reviewer message를 생성할 수 있다.

예:

```text
Luna requested changes.
```

Review comment는 Story나 PR Tab에서 확인할 수 있다.

### Merge

Quest 목표에 Merge가 포함된 경우
Review 조건 충족 후 Merge action을 활성화할 수 있다.

---

## 9.14 Issues Tab

Quest에 Issue 기반 시나리오가 필요한 경우 `Issues` Tab을 사용한다.

Issue에는 다음 정보를 표시할 수 있다.

```text
Issue title
Description
Assignee
Labels
Status
Acceptance conditions
```

Issue 내용은 정답 Git Command를 직접 알려주는 방식이 아니라
실제 업무 요청에 가까운 형태로 작성한다.

---

## 9.15 Right Panel

Right Panel은 다음 Tab을 제공한다.

```text
Git Graph
Repo State
```

기본 Tab은 `Git Graph`다.

### Git Graph

Practice와 동일한 RepositoryState 기반 Graph renderer를 사용한다.

상황에 따라 다음을 표시한다.

```text
Commit nodes
HEAD
Current branch
Local branches
Remote-tracking branches
Merge state
Divergence
```

Graph는 작은 장식 수준으로 렌더링하지 않는다.

Commit과 branch label을 읽을 수 있는 충분한 크기를 제공한다.

### Repo State

다음 정보를 확인할 수 있다.

```text
Current Branch
HEAD
Working Tree
Staging Area
Branches
Remote
Remote-tracking branches
Conflict state
```

Quest에서 사용자에게 필요한 상태 정보를 숨기지 않는다.

---

## 9.16 Progressive Hint

Quest 상단에는 `Hint` action을 제공한다.

Command Guide는 Quest에 제공하지 않는다.

Hint는 단계적으로 더 구체적인 정보를 제공한다.

권장 단계:

```text
Hint 1
→ 상황에 대한 방향성

Hint 2
→ 필요한 Git 개념

Hint 3
→ 필요한 Command category

Hint 4
→ 구체적인 Command example
```

예:

```text
Hint 1:
Your teammates cannot review a branch that only exists locally.

Hint 2:
Think about synchronizing your local branch with the remote repository.

Hint 3:
You need a push-related command.

Hint 4:
Try using git push with the current feature branch.
```

한 번 열어본 Hint는 해당 attempt 동안 다시 확인할 수 있다.

Quest Result에서 사용한 Hint 수를 표시할 수 있다.

Reset는 Hint progress도 초기화한다.

---

## 9.17 Terminal and Hint Relationship

Terminal에서 잘못된 Command를 입력했다고 해서
자동으로 정답에 가까운 Hint를 계속 출력하지 않는다.

Invalid Command는 Simulator error로 처리한다.

유효하지만 Objective와 무관한 Command는 정상 실행한다.

도움이 필요한 사용자는 명시적으로 `Hint`를 선택한다.

이렇게 해서:

```text
Terminal
→ Git 행동 실행

Hint
→ 학습 지원
```

역할을 분리한다.

---

## 9.18 Quest Events

Quest는 플레이 중 외부 협업 상황이 변화하는 것처럼 보여주기 위해 Event를 사용할 수 있다.

Trigger 예:

```text
QUEST_START
AFTER_COMMAND
AFTER_SIMULATOR_EVENT
CONDITION_MET
```

가능한 Event:

```text
teammate message arrives
virtual remote gets a new commit
Pull Request becomes available
review comment arrives
Issue status changes
merge conflict occurs
```

AFTER_COMMAND trigger는 raw input 문자열보다
정규화된 Command Key와 Simulator Event를 우선 사용한다.

---

## 9.19 Virtual Remote Events

Quest에서 teammate가 remote repository를 변경하는 상황을 만들 수 있다.

예:

```text
Luna pushed a new commit to origin/main.
```

이 Event는 Simulator의 Virtual Remote State를 실제로 변경해야 한다.

단순 UI message만 출력하고 State를 그대로 두면 안 된다.

Remote 변경 후:

```text
fetch
pull
merge
```

등을 통해 사용자가 상태 변화에 대응할 수 있어야 한다.

---

## 9.20 Quest Completion

모든 필수 Success Condition이 만족되면
Quest Complete Result를 표시한다.

최소 다음 정보를 포함한다.

```text
Quest Complete
Quest title
Git concepts used
Important actions performed
Command history
Hints used
XP earned / available
Achievement unlock if applicable
```

Main Actions:

```text
Retry Quest
Next Quest
Back to Quests
```

### Authenticated User

```text
QuestProgress 저장
XP 지급
Achievement 검사
```

### Guest

```text
Quest 완료 경험 허용
Progress 저장 X
XP 저장 X
Achievement 저장 X
```

Guest에게:

```text
Sign in to save your completion and XP.
```

안내를 제공할 수 있다.

---

## 9.21 Retry vs Reset

`Reset`:

```text
플레이 도중 현재 attempt를 즉시 초기화
Quest Detail에 그대로 머무름
```

`Retry Quest`:

```text
Quest 완료 Result에서 다시 같은 Quest를 처음부터 시작
```

둘 다 Quest initialState를 기준으로 새 attempt를 만든다.

---

## 9.22 Terminal Scroll Behavior

Quest Terminal에서 Command output이 추가될 때
Browser/Page 전체 scroll 위치를 변경하지 않는다.

Auto-scroll은 Terminal container 내부에서만 수행한다.

규칙:

```text
사용자가 Terminal 맨 아래 근처를 보고 있음
→ 새 output으로 자연스럽게 auto-scroll

사용자가 Terminal 안에서 위쪽 history를 보고 있음
→ 현재 scroll 위치 유지
→ 필요하면 "New output" indicator 표시
```

Command 실행 때문에 Header, Objectives, Graph 또는 Page 전체가
갑자기 아래로 이동하면 안 된다.

이 규칙은 Practice Terminal에도 동일하게 적용한다.

---

## 9.23 Loading State

Quest List:

```text
Quest card skeleton
```

Quest Detail:

```text
Story / Terminal / Graph skeleton
```

Quest Event가 처리 중이어도
전체 화면을 blocking spinner로 덮지 않는다.

---

## 9.24 Error State

Quest 로딩 실패:

```text
Quest could not be loaded.

[ Retry ]
[ Back to Quests ]
```

Simulator 내부 오류:

```text
Repository State를 손상시키지 않음
Terminal에 오류 표시
Reset 사용 가능
```

PR / Issue Event 오류:

```text
현재 Quest State를 유지
Retry action 제공 가능
```

---

## 9.25 Responsive Behavior

### Desktop

```text
Left Panel ~24%
Terminal ~52%
Right Panel ~24%
```

각 Panel의 핵심 text와 Graph가 읽을 수 있어야 한다.

### Tablet

화면 폭에 따라 Terminal 비중을 줄이고
Side Panel을 Tab 또는 collapsible panel로 전환할 수 있다.

### Mobile

3-column을 그대로 축소하지 않는다.

권장:

```text
Top:
Quest Header / Objectives

Main Tabs:
Story | Terminal | Git Graph | Repo State | PR / Issues
```

또는 세로 stack을 사용한다.

Terminal command input은 항상 접근 가능해야 한다.

가로 overflow가 발생하면 안 된다.

---


# 10. Daily Challenge

## 10.1 Route

```text
/daily-challenge
```

## 10.2 Access

### Guest

Guest도 Daily Challenge에 접근하고 문제를 끝까지 해결할 수 있다.

Guest에게 허용:

```text
Challenge 내용 확인
Terminal 사용
지원 Git Command 실행
Git Graph 확인
Repo State 확인
Hint 사용
Reset 사용
Challenge 완료
```

Guest에게 저장하지 않는 항목:

```text
Daily Challenge 완료 기록
XP reward
Level 반영
Achievement 반영
Long-term statistics
```

### Authenticated User

Authenticated User는 Daily Challenge 완료 기록과 XP 보상을 저장한다.

동일한 Daily Challenge를 중복 완료하더라도
같은 날짜/Challenge에 대해 XP를 중복 지급하지 않는다.

---

## 10.3 Purpose

Daily Challenge는 매일 하나의 짧은 Git 문제를 제공하여
사용자가 배운 개념을 짧게 복습하고 스스로 문제를 해결하도록 한다.

Daily Challenge는 Learn Mini Practice와 Quest 사이의 난이도에 위치한다.

```text
Learn Mini Practice
→ 방금 학습한 내용을 바로 적용
→ 짧고 안내가 많음

Daily Challenge
→ 짧은 독립 문제
→ 사용자가 해결 방법을 스스로 판단
→ 필요하면 Progressive Hint 사용
→ 보통 1~3개의 의미 있는 Git 행동

Quest
→ 긴 협업 Scenario
→ 여러 Event / PR / Review / Remote 상황
→ 보통 3~6개 이상의 연결된 행동
```

Daily Challenge는 하루에 짧게 풀 수 있는 문제여야 하며,
Quest처럼 긴 협업 에피소드가 될 필요는 없다.

---

## 10.3A Daily Challenge Screen Flow

Daily Challenge는 처음부터 Terminal만 보여주는 단일 workspace가 아니다.

기본 흐름:

```text
Challenge Intro / Problem
        ↓
[ Start Challenge ]
        ↓
Challenge Workspace
        ↓
Success Conditions satisfied
        ↓
Challenge Completed
```

### Intro / Problem

시작 전 화면은 최소 다음을 보여준다.

```text
Today's Challenge
Date
Short realistic scenario
Goal
Difficulty
Topic
XP reward
Start Challenge
```

여기서는 사용자가:

```text
무슨 일이 있었는지
무엇을 원하는 상태로 만들어야 하는지
```

를 이해할 수 있어야 하지만 정답 Command 자체를 공개하지 않는다.

### Workspace

`Start Challenge` 이후 Terminal / Graph / Repo State / Hint / Reset을 사용하는 실제 해결 화면으로 전환한다.

### Completed

성공 후 완료 feedback과 reward/guest persistence 차이를 보여준다.

이 3개 상태는 하나의 route 내부 view state로 구현해도 되며
각각 별도의 URL을 요구하지 않는다.

---

## 10.4 Daily Challenge Page Layout

기본 Desktop 구조:

```text
Global Header

Daily Challenge Header
├─ Challenge title
├─ XP reward
├─ Reset timer
├─ Hint
└─ Reset

Challenge Description / Goal

┌──────────────────────────────┬──────────────────────────────┐
│                              │                              │
│ Terminal                     │ Git Graph                    │
│                              │                              │
│                              │ Repo State / Feedback        │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘

Global Footer
```

Terminal과 Git Graph 모두 읽기 쉬운 크기로 제공한다.

Graph는 작은 장식 수준으로 축소하지 않는다.

---

## 10.5 Challenge Header

최소 다음 정보를 제공한다.

```text
DAILY CHALLENGE
Challenge title
XP reward
Reset timer
Hint
Reset
```

예:

```text
DAILY CHALLENGE   +80 XP

Undo the Last Commit

Resets in 14:22:08

[ Hint ] [ Reset ]
```

### Reset Timer

현재 Daily Challenge가 다음 Challenge로 교체되기까지 남은 시간을 표시할 수 있다.

Timer는 시각적 정보이며 Challenge의 성공 판정과 직접 연결하지 않는다.

---

## 10.6 Challenge Description

Challenge 설명은 다음을 포함한다.

```text
현재 상황
Goal
필요한 제약 조건
```

예:

```text
You committed src/login.html too early.
The file needs more work before it goes into a commit.

Goal:
Undo the last commit on main,
but keep your changes in the working directory
so you can keep editing.
```

Challenge 설명은 사용자가 해결해야 할 결과를 알려주되
정답 Command 자체는 기본 상태에서 공개하지 않는다.

---

## 10.7 Answer Disclosure Rule

Challenge 기본 화면에 정답을 사실상 조합할 수 있는 Command tag를 과도하게 노출하지 않는다.

금지 예:

```text
git reset
HEAD~1
--mixed
```

이 세 요소를 기본 화면에 동시에 표시하여
사용자가 정답을 그대로 조합할 수 있게 만드는 방식.

기본 화면에서는 다음 정도의 높은 수준 정보만 보여줄 수 있다.

```text
Difficulty: Intermediate
Topic: Commit History
```

또는:

```text
Topic: Reset / History
```

단, 정답 Command syntax는 Progressive Hint 단계로 이동한다.

---

## 10.8 Progressive Hint

Daily Challenge에는 `Hint` action을 제공한다.

Hint는 누를수록 점점 구체적인 정보를 보여준다.

권장 구조:

```text
Hint 1
→ 문제 상황을 다시 해석하도록 도움

Hint 2
→ 필요한 Git 개념 방향

Hint 3
→ 필요한 Command category

Hint 4
→ 구체적인 Command example
```

예: `Undo the Last Commit`

```text
Hint 1:
You need to move the last commit out of history
without throwing away the file changes.

Hint 2:
Think about moving HEAD backward while preserving your work.

Hint 3:
A reset-related command can do this.

Hint 4:
Consider git reset with HEAD~1 and a mode
that keeps your changes available for editing.
```

첫 Hint부터 정답 전체를 바로 보여주지 않는다.

한 번 연 Hint는 현재 attempt 동안 다시 볼 수 있다.

Reset을 누르면 Hint progress도 초기화한다.

---

## 10.9 Terminal Freedom Rule

Daily Challenge에서도 Quest와 동일한 원칙을 사용한다.

Simulator가 지원하는 유효한 Git Command라면
현재 Challenge Goal과 직접 관련이 없어도 정상적으로 실행한다.

예:

```bash
git status
git log
git branch
```

지원 범위 안에 있는 Command라면 상태 확인이나 실험 목적으로 사용할 수 있다.

### Important Rule

```text
Challenge가 Command를 허용/차단하지 않는다.

Simulator가 Command를 실행한다.

Challenge는 실행 결과의 Repository State와 Event를 관찰한다.
```

따라서 유효하지만 Goal과 무관한 Command를 입력했다고 해서
실행 자체를 막거나 자동으로 오답 처리하지 않는다.

Objective와 무관한 Command는 정상 실행되지만
Challenge completion에는 영향을 주지 않을 수 있다.

---

## 10.10 Invalid Command

Simulator가 지원하지 않는 Command 또는 syntax는
일반 Simulator error로 처리한다.

예:

```text
Unsupported command or option.

Type help to see supported commands.
```

Invalid Command는 Repository State를 잘못 변경하지 않는다.

---

## 10.11 Challenge Success Conditions

Daily Challenge 성공 여부는 raw command string이 아니라
Repository State와 Simulator Event를 중심으로 판정한다.

예: `Undo the Last Commit`

Goal:

```text
마지막 commit을 history에서 제거
AND
파일 변경사항은 working directory에 유지
```

가능한 State 기반 판정 예:

```text
HEAD == previousCommit
AND
target file changes remain in workingTree
AND
target changes are not lost
```

정확한 성공 조건은 `DATA_CONTRACTS.md`의 SimulatorCondition 형식으로 정의한다.

동일한 최종 상태를 만드는 여러 유효한 workflow가 있다면 허용할 수 있다.

---

## 10.12 Reset

Daily Challenge의 Reset 버튼 문구는 다음처럼 단순하게 사용한다.

```text
Reset
```

Daily Challenge의 reset action label은 `Reset`을 사용한다.

Reset은 Confirmation Modal 없이 즉시 현재 attempt를 초기화한다.

클릭 즉시:

```text
RepositoryState
→ challenge initialState

Terminal history
→ 초기화

Challenge completion temporary state
→ 초기화

Hint progress
→ 초기화

Guinea Pig feedback
→ 초기화
```

Reset은 다음 데이터를 삭제하지 않는다.

```text
과거 완료 기록
이미 지급된 XP
Achievement 기록
계정 데이터
```

즉 현재 attempt만 초기화한다.

---

## 10.13 Git Graph

Daily Challenge는 Challenge와 관련된 Repository 변화를 확인할 수 있도록
Git Graph를 제공한다.

상황에 따라 다음을 표시한다.

```text
Commit nodes
HEAD
Current branch
Branch pointers
Remote-tracking branch
Merge state
```

Graph는 Simulator의 실제 RepositoryState를 렌더링한다.

Command 실행 후 즉시 갱신한다.

---

## 10.14 Repo State

필요한 Challenge에서는 다음 정보를 확인할 수 있도록 한다.

```text
Current Branch
HEAD
Working Tree
Staging Area
Branches
Remote / Remote Tracking
Conflict state
```

Daily Challenge의 핵심 Goal을 판단하는 데 필요한 상태를
사용자에게 부당하게 숨기지 않는다.

---

## 10.15 Guinea Pig Feedback

Guinea Pig feedback은 사용자의 행동 결과를 짧게 설명할 수 있다.

예:

```text
HEAD moved back one commit,
and your file changes are still available.
```

Feedback은 정답을 대신 입력해주는 기능이 아니다.

유효하지만 Goal과 무관한 Command를 실행했을 때
매번 "wrong"이라고 말하지 않는다.

필요하면 단순 상태 설명만 제공한다.

---

## 10.16 Completion State

Challenge Success Conditions가 충족되면 Completion Panel을 표시한다.

### Authenticated User

예:

```text
Challenge Complete!

+80 XP earned.

You successfully undid the last commit
while keeping your working changes.
```

`toolkit`이라는 별도 기능이 실제로 존재하지 않으므로
다음과 같은 문구는 사용하지 않는다.

```text
git reset HEAD~1 is now part of your toolkit.
```

### Guest

예:

```text
Challenge Complete!

You successfully undid the last commit
while keeping your working changes.

Sign in to save your completion and earn +80 XP.

[ Sign Up ]
[ Log In ]
```

Guest의 완료 경험은 허용하되
Progress와 XP는 영구 저장하지 않는다.

---

## 10.17 Daily Challenge Reward

Authenticated User가 해당 날짜의 Daily Challenge를 처음 완료한 경우에만 XP를 지급한다.

중복 요청이나 반복 실행으로 XP를 여러 번 얻을 수 없어야 한다.

Challenge를 다시 풀어보는 것은 허용할 수 있지만
해당 날짜의 reward는 한 번만 지급한다.

---

## 10.18 Terminal Scroll Behavior

Daily Challenge Terminal은 Practice / Quest와 동일한 scroll 규칙을 사용한다.

Command output 추가 시:

```text
Page 전체 scroll 이동 금지
Terminal container 내부에서만 auto-scroll
```

사용자가 Terminal 맨 아래 근처를 보고 있다면
새 output으로 자연스럽게 이동한다.

사용자가 위쪽 history를 읽고 있다면
현재 위치를 유지하고 필요하면 `New output` indicator를 표시한다.

---

## 10.19 Loading State

Challenge 데이터 로딩 중:

```text
Challenge header skeleton
Description skeleton
Terminal / Graph loading state
```

전체 Page를 불필요하게 긴 blocking spinner로 덮지 않는다.

---

## 10.20 Error State

Challenge 로딩 실패:

```text
Today's challenge could not be loaded.

[ Retry ]
```

Simulator 내부 오류:

```text
현재 Repository State를 손상시키지 않음
Terminal에 오류 표시
Reset 사용 가능
```

---

## 10.21 Responsive Behavior

### Desktop

Terminal과 Graph를 모두 충분히 읽을 수 있도록 배치한다.

권장:

```text
Terminal
→ approximately 55~60%

Graph / State
→ approximately 40~45%
```

### Tablet

화면 폭에 따라 2-column을 유지하거나
Graph / State를 Tab으로 전환할 수 있다.

### Mobile

Desktop layout을 그대로 축소하지 않는다.

권장:

```text
Challenge Description
Terminal
Git Graph / Repo State
Feedback
```

또는:

```text
Tabs:
Terminal | Graph | State
```

가로 overflow가 발생하면 안 된다.

---


## 10.18 Daily Challenge Date Rule

Daily Challenge의 날짜 경계는:

```text
Asia/Seoul
```

기준으로 계산한다.

해당 날짜의 Challenge assignment가 아직 DB에 없으면
Backend가 seed된 challenge template pool에서 deterministic하게 하나를 선택해 생성한다.

따라서 서버 재시작이나 평가 날짜 때문에
`Today's Challenge`가 존재하지 않는 상태가 발생하면 안 된다.

---

# 11. Reference

## 11.1 Routes

```text
/reference
/reference/commands/:commandKey
```

## 11.2 Access

### Guest

Guest에게 Reference Navigation 항목은 표시하지만
Reference 전체 콘텐츠는 회원 전용으로 제한한다.

Guest가 Reference를 선택하면 일반 Reference 목록 대신
Locked 안내를 표시한다.

```text
Reference is available for members.

Search Git commands, review concepts,
and save useful references after creating an account.

[ Sign Up ]
[ Log In ]
```

Guest는 Command Detail에도 직접 접근할 수 없다.

### Authenticated User

Authenticated User는 Reference 목록, Command Detail, Bookmark 기능을 모두 사용할 수 있다.

---

## 11.3 Purpose

Reference는 사용자가 Git Command와 관련 개념을 빠르게 검색하고,
syntax, 사용 상황, 예제, 실수 사례, 관련 Lesson과 Quest를 다시 확인하는 지식 탐색 영역이다.

Reference는 Learn처럼 단계적으로 가르치는 페이지가 아니며,
Practice의 Command Guide보다 더 자세한 설명을 제공한다.

```text
Learn
→ 개념을 순서대로 학습

Practice Command Guide
→ 현재 Playground에서 빠르게 참고

Reference
→ 전체 Git 지식을 검색하고 자세히 확인
```

---

## 11.4 Reference List Page

### Route

```text
/reference
```

### Layout

Desktop에서는 중앙의 지나치게 좁은 mobile-style column을 사용하지 않는다.

페이지는 충분한 desktop content width를 사용한다.

권장 구조:

```text
Reference title / description

Search

Category Filters
Difficulty Filters
Sort

Command Result Grid
```

Command Card는 desktop에서 2-column 이상을 사용할 수 있다.

### Search

검색 대상:

```text
Command name
Syntax keyword
Summary
Concept keyword
Related topic
```

예:

```text
merge
push
reset
branch
```

검색어 입력 시 관련 Command를 필터링한다.

### Category Filter

예:

```text
All
Setup
Inspect
Stage
Commit
Branch
Merge
Remote
```

### Difficulty Filter

```text
All
Beginner
Intermediate
Advanced
```

### Sort

최소 다음 정렬 방식 중 적절한 항목을 제공한다.

```text
Name
Difficulty
Category
```

### Pagination

결과 수가 많아지는 경우 Pagination을 사용한다.

현재 Seed Data가 적더라도
Advanced Search 요구사항을 고려해 Pagination 구조를 지원한다.

### Command Card

최소 다음 정보를 표시한다.

```text
Command name
Syntax summary
Short description
Category
Difficulty
Bookmark state
```

Card 선택:

```text
→ /reference/commands/:commandKey
```

---

## 11.5 Command Detail Page

### Route

```text
/reference/commands/:commandKey
```

### Desktop Layout Principle

Desktop에서는 모바일 화면을 그대로 넓힌 듯한 좁은 중앙 단일 column을 사용하지 않는다.

권장:

```text
┌──────────────────────────────────────────────────────────────┐
│ Breadcrumb                                                   │
│ Command title / summary                    Bookmark           │
├───────────────────────────────────┬──────────────────────────┤
│                                   │                          │
│ Syntax                            │ Quick Info               │
│ When to use                       │ Category                 │
│ Examples                          │ Difficulty               │
│ Common mistakes                   │ Simulator support        │
│                                   │ Related Commands         │
│                                   │ Related Lessons          │
│                                   │ Related Quests           │
│                                   │                          │
└───────────────────────────────────┴──────────────────────────┘

[ Back to Reference ]        [ Practice in Terminal → ]
```

권장 비율:

```text
Main Content
→ 65~70%

Side Information
→ 30~35%
```

### Main Content

최소 다음을 포함한다.

```text
Syntax
When to use
Examples
Common mistakes
```

### Side Information

다음 정보를 제공할 수 있다.

```text
Category
Difficulty
Simulator Supported
Related Commands
Related Lessons
Related Quests
Bookmark
```

### Common Mistakes

사용자가 실제로 자주 할 수 있는 위험한 사용법이나 잘못된 assumptions을
간단하고 명확하게 표시한다.

예:

```text
Pushing to the wrong remote
Force-pushing a shared branch
```

---

## 11.6 Bookmark Action

Authenticated User는 Reference Command를 Bookmark할 수 있다.

Bookmark는 사용자 계정에 저장된다.

지원 상태:

```text
Not Bookmarked
Bookmarked
```

동일 항목을 중복 Bookmark하지 않는다.

---

## 11.7 Practice in Terminal

Command Detail 하단의 `Practice in Terminal` action은 유지한다.

이 action은 특정 주제 Playground에 강제로 연결하지 않는다.

대신 Practice의 `Free Sandbox`로 이동한다.

예:

```text
/reference/commands/push
→ Practice in Terminal
→ /practice?mode=free&command=push
```

Practice 진입 결과:

```text
Free Sandbox 활성화
Command Guide 전체 지원 명령 표시
현재 Reference Command 강조
```

### Reason

이 구조는 다음 문제를 피한다.

```text
Command마다 "가장 연관된 Playground"를 따로 매핑해야 하는 문제
특정 Playground의 context가 Reference 실습을 제한하는 문제
Reference에서 실습으로 넘어가는 연결이 사라지는 문제
```

따라서 Reference의 실습 연결은 Free Sandbox를 기본 대상으로 한다.

---

## 11.8 Related Content

Command Detail은 관련 콘텐츠를 제공할 수 있다.

```text
Related Commands
Related Lessons
Related Quests
```

각 항목은 실제 대상 페이지로 이동한다.

예:

```text
Related Lesson
→ /learn/:lessonSlug

Related Quest
→ /quests/:questSlug

Related Command
→ /reference/commands/:commandKey
```

---

## 11.9 Loading / Empty / Error States

### Loading

```text
Search skeleton
Command card skeleton
Detail content skeleton
```

### Empty Search Result

```text
No matching commands found.

Try a different keyword or filter.
```

### Error

```text
Reference could not be loaded.

[ Retry ]
```

---

## 11.10 Responsive Behavior

### Desktop

가로 공간을 의도적으로 사용한다.

```text
Reference List
→ wide search / filter area
→ multi-column command grid

Command Detail
→ 2-column main + side info
```

### Mobile

```text
single-column
filters may collapse
Command Detail side info moves below main content
```

가로 overflow가 발생하면 안 된다.

---


# 12. Profile

## 12.1 Route

```text
/profile
/profile/api-keys
```

## 12.2 Access

Authenticated User 전용.

Guest가 접근하면 Login으로 안내한다.

---

## 12.3 Purpose

Profile은 사용자의 계정 정보와 학습 진행 상황을 한눈에 보여주는 개인 Dashboard다.

최소 다음 영역을 제공한다.

```text
Profile Summary
Statistics
Lesson Progress
Recent Achievements
Recent Activity
Edit Profile
```

---

## 12.4 Desktop Layout

Profile도 좁은 mobile-style 중앙 column로만 구성하지 않는다.

desktop에서는 가로 공간을 활용해 Dashboard 형태로 구성한다.

권장 구조:

```text
┌──────────────────────────────────────────────────────────────┐
│ Avatar / Nickname / Level / XP / Edit Profile               │
└──────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Lessons Done │ Quests Done  │ Total XP     │ Streak       │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌────────────────────────────────┬─────────────────────────────┐
│ Lesson Progress                │ Recent Achievements         │
│                                │                             │
│ Git & Repository  100%         │ First Commit                │
│ Staging & Commit  100%         │ Branch Explorer             │
│ Branch             40%         │ ...                         │
│ Merge               0%         │                             │
│ Remote              0%         │                             │
└────────────────────────────────┴─────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Recent Activity                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 12.5 Profile Summary

표시:

```text
Avatar
Nickname
Level
Join date
Current XP
XP required for next level
XP progress bar
Edit Profile
```

---

## 12.6 Statistics

최소:

```text
Lessons Done
Quests Done
Total XP
Streak
```

Streak은 Daily Challenge 및 학습 활동과 연결해 Gamification 요소로 사용한다.

---

## 12.7 Lesson Progress

Lesson Progress는 유지한다.

각 Lesson의 현재 완료율을 표시한다.

예:

```text
Git & Repository              100%
Working Directory & Commit   100%
Branch                         40%
Merge                           0%
Remote / Push / Pull            0%
```

Lesson Progress 항목은 클릭 가능하게 만들 수 있다.

```text
Branch 40%
→ /learn/branch
```

이를 통해 Profile에서 학습으로 바로 재진입할 수 있다.

---

## 12.8 Recent Achievements

최근 획득 Achievement 일부를 표시한다.

예:

```text
First Commit
Branch Explorer
Merger
```

보조 Action:

```text
View all achievements
→ /achievements
```

---

## 12.9 Recent Activity

최근 사용자 활동을 시간 순서대로 표시한다.

예:

```text
Completed Quest
Completed Lesson
Completed Daily Challenge
Achievement Unlocked
```

각 항목에 관련 XP와 시점을 표시할 수 있다.

---

## 12.10 Edit Profile

최소 편집 가능 항목:

```text
Nickname
Avatar
```

Avatar는 다음 세 가지 경로를 지원한다.

```text
Default guinea pig avatar
Preset guinea pig avatar selection
Custom avatar image upload
```

Custom avatar upload는 최소 다음 검증을 수행한다.

```text
Allowed image type validation
Maximum file size validation
Server-side validation
User ownership / authorization
```

업로드 실패 시 기존 avatar를 유지하고 명확한 오류를 표시한다.

이메일/비밀번호 등 Account Security 기능은 별도 Authentication/Settings 설계가 없는 한
현재 Edit Profile의 필수 범위에 포함하지 않는다.

---


## 12.12 Developer API Keys

### Route

```text
/profile/api-keys
```

Authenticated User는 Public API용 API key를 관리할 수 있다.

화면:

```text
API Keys

[ Create API Key ]

Existing Keys
- Label
- Created date
- Revoked/Active state
- Revoke

[ Open API Documentation ]
```

`Revoke`는 key row를 삭제하지 않고 `revokedAt`을 기록한다.
Revoked key는 즉시 Public API 인증에 사용할 수 없으며 목록에는 `Revoked` 상태로 남는다.

Key 생성 시 raw secret은 한 번만 표시한다.

```text
Copy this key now.
You will not be able to view it again.
```

이후 목록에서는 raw key를 다시 보여주지 않는다.

API Documentation:

```text
/api/docs
```

Guest는 접근할 수 없다.

Acceptance:

- [ ] API key를 생성할 수 있다.
- [ ] 생성된 raw key는 한 번만 표시된다.
- [ ] 기존 key 목록을 볼 수 있다.
- [ ] key를 revoke할 수 있다.
- [ ] Public API documentation으로 이동할 수 있다.

---

# 13. Friends

## 13.1 Route

```text
/friends
```

## 13.2 Access

Authenticated User 전용.

## 13.3 Purpose

사용자가 다른 GitneaPig 사용자를 검색하고,
Friend Request를 관리하며,
친구의 기본 진행 상태와 Online/Offline 상태를 확인한다.

## 13.4 Main Functions

```text
Search User
Send Friend Request
Pending Requests
Accept
Decline
Friend List
Remove Friend
Online / Offline
```

### User Search

Nickname 또는 username 기반으로 사용자를 검색한다.

### Pending Requests

받은 Friend Request를 표시한다.

Action:

```text
Accept
Decline
```

`Decline`은 해당 `PENDING` request를 삭제한다.
삭제 후 같은 사용자 pair는 이후 다시 Friend Request를 보낼 수 있다.
보낸 사람은 아직 `PENDING`인 request를 취소할 수 있다.

### Friend List

친구마다 최소 다음을 표시한다.

```text
Avatar
Nickname
Level
XP summary
Online / Offline
Remove action
```

Online 상태는 WebSocket 없이 `lastActiveAt` 기반의 polling 방식으로 처리할 수 있다.


# 14. Achievements

## 14.1 Route

```text
/achievements
```

## 14.2 Access

Authenticated User 전용.

## 14.3 Purpose

사용자가 학습 및 협업 활동을 통해 획득한 Achievement와
아직 잠긴 Achievement를 확인한다.

## 14.4 Layout

상단:

```text
Achievements
Unlocked count / Total count
Progress bar
```

Achievement는 category별로 묶을 수 있다.

예:

```text
Basics
Collaboration
Practice
Consistency
```

## 14.5 Achievement Card

최소 다음 정보를 표시한다.

```text
Icon
Title
Description
XP reward
Unlocked / Locked state
Unlocked date when available
```

최종 Achievement seed는 10개다.

```text
First Lesson
Learning Momentum
Git Foundations
Quest Starter
Collaboration in Motion
Quest Master
Daily Regular
One Week of Practice
Three-Day Streak
Seven-Day Streak
```

Locked Achievement는 시각적으로 구분한다.
Achievement condition을 카드 또는 상세 정보에서 확인할 수 있다.

## 14.6 Fixed XP Rewards

Lesson reward:

```text
Lesson 1   100 XP
Lesson 2   140 XP
Lesson 3   180 XP
Lesson 4   220 XP
Lesson 5   260 XP
```

Quest reward:

```text
Quest 1    140 XP
Quest 2    180 XP
Quest 3    220 XP
Quest 4    260 XP
Quest 5    300 XP
```

모든 Daily Challenge template의 기본 reward:

```text
80 XP
```

Achievement reward는 `DATA_CONTRACTS.md`의 fixed seed table을 따른다.

## 14.7 Level Progression

Level은 XP에서 계산하며 Level 1부터 시작한다.

현재 Level `L`에서 다음 Level로 올라가는 데 필요한 XP:

```text
60 × L
```

Level `L`에 도달하기 위한 누적 XP:

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
```

정확한 `calculateLevel()` contract는 `DATA_CONTRACTS.md`를 따른다.


# 15. Bookmarks

## 15.1 Route

```text
/bookmarks
```

## 15.2 Access

Authenticated User 전용.

## 15.3 Purpose

사용자가 저장한 Lesson, Quest, Command를 한 곳에서 다시 찾을 수 있게 한다.

## 15.4 Content Tabs

최소 다음 Tab을 제공한다.

```text
Lessons
Quests
Commands
```

각 Tab에는 저장 개수를 표시할 수 있다.

예:

```text
Lessons (2)
Quests (2)
Commands (4)
```

## 15.5 Bookmark Item

각 항목은 원래 콘텐츠로 이동한다.

```text
Lesson Bookmark
→ /learn/:lessonSlug

Quest Bookmark
→ /quests/:questSlug

Command Bookmark
→ /reference/commands/:commandKey
```

Bookmark 삭제 action을 제공할 수 있다.

## 15.6 Empty State

특정 Tab에 Bookmark가 없는 경우:

```text
No bookmarked commands yet.

Save useful items from Learn, Quest, or Reference.
```


# 16. Desktop Layout Principle

GitneaPig의 Desktop UI는 좁은 mobile-style 중앙 column을 단순히 확대해서 사용하지 않는다.

Desktop에서는 화면 목적에 맞게 가로 공간을 의도적으로 활용한다.

이 규칙은 특히 다음 페이지에 적용한다.

```text
Learn List
Lesson Situation
Lesson Why
Lesson Concept
Lesson Command
Quest List
Reference List
Reference Detail
Profile
Friends
Achievements
Bookmarks
```

권장 패턴:

```text
설명 + visualization을 좌우 column으로 분리
지원 정보를 side panel로 배치
wide card / multi-column grid 사용
dashboard content를 가로로 배치
```

예:

```text
Lesson Situation
→ Scenario | Team Conversation

Lesson Why
→ Explanation | Comparison

Lesson Concept
→ Concept | Git Graph

Lesson Command
→ Commands | Quick Comparison / Tips

Reference Detail
→ Main Content | Related / Metadata

Profile
→ Progress | Achievements
```

단, 모든 페이지를 억지로 2-column으로 만들 필요는 없다.

집중형 single-column이 더 적절한 화면:

```text
Lesson Practice
Lesson Result
Daily Challenge
Login
Sign Up
```

Mobile에서는 모든 layout을 자연스럽게 single-column 또는 tab-based layout으로 재구성한다.

---

# 17. Authentication

## 17.1 Routes

```text
/login
/signup
/auth/42/callback
/onboarding/profile
```

`/auth/42/callback`은 OAuth callback 처리용 route이며,
일반 사용자가 직접 탐색하는 page가 아니다.

`/onboarding/profile`은 42 OAuth를 통해 처음 가입한 사용자에게만 필요한
초기 프로필 설정 화면이다.

---

## 17.2 Authentication Methods

GitneaPig는 다음 두 가지 인증 방식을 지원한다.

```text
Email + Password
42 OAuth
```

---

## 17.3 Login Page

### Route

```text
/login
```

### UI

최소 다음 요소를 제공한다.

```text
Log in to GitneaPig

Email
Password

[ Log In ]

or

[ Continue with 42 ]

Don't have an account?
Sign Up
```

### Email / Password Login

로그인 성공 후 이동 규칙:

```text
returnTo가 존재
→ returnTo로 이동

returnTo가 없음
→ /
```

예:

```text
Guest
→ /bookmarks
→ /login?returnTo=/bookmarks
→ 로그인 성공
→ /bookmarks
```

### Validation

최소 다음 오류를 처리한다.

```text
Email format invalid
Email empty
Password empty
Invalid credentials
Server error
```

계정 존재 여부를 불필요하게 노출하지 않는다.

예:

```text
Invalid email or password.
```

---

## 17.4 Sign Up Page

### Route

```text
/signup
```

### UI

기본 Email 가입:

```text
Create your GitneaPig account

Email
Nickname
Password
Confirm Password
Avatar

[ Create Account ]

or

[ Continue with 42 ]

Already have an account?
Log In
```

### Validation

```text
Email
- required
- valid format
- unique

Nickname
- required
- length limit
- unique

Password
- required
- minimum length

Confirm Password
- must match Password

Avatar
- user can select a preset guinea pig avatar
- user can upload a custom avatar image
- default avatar may be used if not selected
```

### Success

```text
User 생성
→ 자동 로그인
→ returnTo 또는 /
```

회원가입 성공 후 다시 Login을 요구하지 않는다.

---

## 17.5 42 OAuth

### Entry

Login과 Sign Up 모두 다음 action을 제공한다.

```text
Continue with 42
```

### Existing User Flow

```text
Continue with 42
→ 42 OAuth Authorization
→ callback
→ existing linked GitneaPig user found
→ login
→ returnTo 또는 /
```

### New User Flow

42 계정에 GitneaPig 전용 nickname/avatar가 없으므로
최초 OAuth 로그인에서는 Profile Onboarding을 진행한다.

```text
Continue with 42
→ 42 OAuth Authorization
→ callback
→ no linked GitneaPig user
→ temporary authenticated onboarding state
→ /onboarding/profile
→ nickname 설정
→ avatar 설정
→ account creation/finalization
→ logged-in state
→ returnTo 또는 /
```

### 42 Profile Onboarding UI

```text
Welcome to GitneaPig!

Set up your profile

Nickname
[________________]

Choose your guinea pig
[ avatar options ]

[ Continue ]
```

Nickname:

```text
required
unique
length-limited
```

Avatar:

```text
select from provided guinea pig avatars
upload a custom avatar image
default avatar allowed
```

Custom image upload는 type/size validation을 적용한다.

GitneaPig에서 사용자에게 표시하는 이름은
42 login/identifier가 아니라 GitneaPig nickname을 사용한다.

---

## 17.6 Password Storage

Email/Password 사용자의 password는 Argon2로 hash한다.

```text
Plain Password
→ Argon2 Hash
→ DB
```

Plain password를 저장하거나 log에 남기지 않는다.

---

## 17.7 JWT / Cookie

Authentication은 JWT + HttpOnly Cookie를 사용한다.

원칙:

```text
JWT는 HttpOnly Cookie로 전달
Frontend JavaScript에서 token 직접 저장/읽기 금지
Secure cookie in production
HTTPS required
```

---

## 17.8 Protected Routes

Authenticated User 전용:

```text
/profile
/friends
/achievements
/bookmarks
```

Guest가 직접 접근하면:

```text
현재 route를 returnTo로 보존
→ /login
```

로그인 후 원래 route로 복귀한다.

```text
/reference
/reference/commands/*
```

Guest에게 route 자체를 숨기지 않고 member-locked 안내를 표시한다.

---

## 17.9 Guest Simulator State During Login

Guest가 Learn / Quest / Practice 등에서 로그인으로 이동할 때
현재 route는 보존한다.

현재 Simulator terminal history와 repository attempt state를
로그인 전후에 완전히 복원하는 것은 필수 요구사항이 아니다.

최소 요구:

```text
returnTo route 보존
```

---

## 17.10 Logout

Authenticated Header의 Avatar menu에서:

```text
Log Out
```

선택 시:

```text
Authentication cookie/session 제거
Frontend auth state 초기화
→ /
```

Logout 후 protected data가 화면에 남지 않아야 한다.

---

## 17.11 Authenticated User Access to Login / Sign Up

이미 로그인한 사용자가:

```text
/login
/signup
```

에 직접 접근하면 `/`로 redirect한다.

---

## 17.12 Auth Initialization

App 시작 시 HttpOnly Cookie를 기반으로 현재 사용자 상태를 확인한다.

상태:

```text
authInitializing
guest
authenticated
```

초기 확인 중 Guest Header를 잠깐 렌더링했다가
Authenticated Header로 바뀌는 flicker를 피한다.

---

## 17.13 OAuth Error State

42 OAuth 실패 시:

```text
42 login failed.
Please try again.

[ Try Again ]
[ Use Email Login ]
```

---


## 17.15 Session Lifetime

GitneaPig의 normal login session은:

```text
JWT in HttpOnly Cookie
Lifetime: 8 hours
Refresh token: not used
Sliding expiration: not used
```

Session 만료 시:

```text
→ Login required
→ safe returnTo 유지
```

---

## 17.16 42 OAuth Failure

42 OAuth 실패 또는 state 검증 실패:

```text
→ /login?oauthError=42
```

Login Page는 사용자에게 재시도 가능한 일반 오류를 표시한다.

```text
42 login failed.
Please try again.
```

`returnTo`는 application 내부 relative path만 허용한다.

---

# 18. Localization / Language Switching

## 18.1 Supported Languages

GitneaPig는 다음 세 언어를 지원한다.

```text
ko — 한국어
en — English
ja — 日本語
```

---

## 18.2 Header Language Selector

Language selector는 로그인 여부와 관계없이
Global Header 우측에 항상 표시한다.

Desktop 권장:

```text
Guest

[ main navigation ]        [ 한국어 ▼ ] [ Log In ] [ Sign Up ]
```

```text
Authenticated

[ main navigation ] [ Level / XP ] [ 한국어 ▼ ] [ Avatar ]
```

즉 Authenticated 상태에서는 Avatar 바로 왼쪽에 둔다.

---

## 18.3 Language Menu

현재 선택 언어를 text로 표시한다.

예:

```text
한국어 ▼
```

Dropdown:

```text
✓ 한국어
  English
  日本語
```

아이콘만 표시하는 방식보다 현재 언어 이름을 보여주는 방식을 우선한다.

---

## 18.4 Translation Scope

사용자에게 보이는 application text 전체가 전환되어야 한다.

포함:

```text
Header
Footer
Home
Learn
Lesson Content
Practice UI
Practice Command Guide descriptions
Quest Story
Quest Objectives
Virtual teammate messages
Daily Challenge
Reference
Profile
Friends
Achievements
Bookmarks
Authentication
Privacy Policy
Terms of Service
Error / Empty / Loading messages
```

---

## 18.5 Do Not Translate Git Syntax

Git command 자체는 번역하지 않는다.

예:

```text
브랜치를 생성합니다.

git switch -c feature/login
```

금지:

```text
git 스위치 -c feature/login
```

교육 콘텐츠에서는 필요할 경우:

```text
브랜치 (Branch)
커밋 (Commit)
스테이징 영역 (Staging Area)
```

처럼 한국어/일본어 설명과 영어 원어를 함께 표시할 수 있다.

---

## 18.6 Language Persistence

Guest:

```text
browser local persistence
```

Authenticated:

```text
User language preference in DB
```

Authenticated User가 언어를 변경하면 preference를 저장한다.

로그인 직후에는 저장된 user preference를 우선 적용할 수 있다.

---

## 18.7 Routing

언어별 path prefix는 필수로 사용하지 않는다.

즉:

```text
/learn
/practice
/quests
```

route는 그대로 유지하고 i18n resource만 전환한다.

다음과 같은 구조는 현재 필수 아님:

```text
/ko/learn
/en/learn
/ja/learn
```

---


# 19. Privacy Policy

## 19.1 Route

```text
/privacy
```

## 19.2 Access

Guest / Authenticated User 모두 접근 가능하다.

Footer에서 항상 쉽게 접근 가능해야 한다.

예:

```text
Privacy Policy
Terms of Service
```

Privacy / Terms link는 로그인 여부와 관계없이 표시한다.

---

## 19.3 Requirement

Privacy Policy는 placeholder 또는 빈 페이지여서는 안 된다.

GitneaPig의 실제 데이터와 기능에 맞는 내용을 포함해야 한다.

---

## 19.4 Privacy Policy Content

최종 화면에 다음 내용을 실제 policy text로 작성한다.

### 1. Information We Collect

GitneaPig에서 실제 사용하는 범위에 맞춰 다음 정보를 설명한다.

```text
Account Information
- email address for email/password accounts
- GitneaPig nickname
- selected avatar
- 42 OAuth account identifier / information required for authentication

Learning and Progress Data
- lesson progress
- quest progress
- daily challenge completion
- XP
- level
- achievements
- streak

User Saved Data
- bookmarks

Social Data
- friend requests
- friendship relationships
- online/activity state required for Friends features

Technical / Service Data
- authentication/session information
- lastActiveAt
- basic request/error information needed to operate and secure the service
```

GitneaPig가 실제로 수집하지 않는 민감한 데이터를
Privacy Policy에 수집한다고 작성하지 않는다.

### 2. How We Use Information

```text
Authenticate users
Create and maintain user accounts
Save learning progress
Award XP and achievements
Provide Daily Challenge and streak features
Provide Bookmark and Friends features
Display account profile
Maintain service security and integrity
Prevent duplicate rewards / corrupted progress
Improve and troubleshoot the service
```

### 3. Authentication and Cookies

```text
GitneaPig uses authentication cookies.
JWT is stored in an HttpOnly cookie.
Cookies are used to maintain authenticated sessions and protect account access.
```

Production에서는 HTTPS/Secure cookie 설정을 사용한다.

### 4. 42 OAuth

GitneaPig가 42 OAuth를 사용하는 점을 명확히 설명한다.

```text
Users may authenticate through 42.
GitneaPig receives information required to identify the authorized 42 account.
A first-time 42 OAuth user creates a GitneaPig nickname and avatar separately.
```

GitneaPig는 42와의 관계를 과장하거나 공식 제휴를 암시하지 않는다.

### 5. Data Sharing

실제 구현 기준으로 작성한다.

기본 방침:

```text
GitneaPig does not sell personal information.
Data is shared with third parties only when required to provide configured services,
such as 42 authentication, or when legally required.
```

사용하지 않는 analytics/ad service를 policy에 임의로 추가하지 않는다.

### 6. Data Retention

```text
Account-related information is retained while the account is active
or as needed to operate the service.

Temporary session information may expire earlier.

If account deletion is supported, associated personal data is deleted
or anonymized according to the implemented deletion behavior.
```

Account deletion 기능을 실제로 만들지 않는다면
존재하지 않는 삭제 버튼을 약속하지 않는다.

그 대신 실제 연락/처리 방법을 명시한다.

### 7. Security

```text
Passwords are stored as Argon2 hashes.
Plain passwords are not stored.
Authentication uses HttpOnly cookies.
HTTPS is used in deployment.
Application and database access are separated by user ownership and authorization checks.
```

완전한 보안을 보장한다고 표현하지 않는다.

### 8. User Choices

```text
Users can update nickname/avatar.
Users can change the interface language.
Users can remove bookmarks.
Users can manage friend relationships.
```

실제 구현되는 선택권만 명시한다.

### 9. Policy Updates

```text
The Privacy Policy may be updated when the service changes.
The effective/update date is displayed on the page.
```

### 10. Contact

Project가 실제 사용할 수 있는 contact method를 명시한다.

placeholder:

```text
Contact: <project contact email or team contact method>
```

최종 제출 전 반드시 실제 contact information으로 교체한다.

---

## 19.5 Privacy Page UI

문서형 page로 작성한다.

Desktop에서 너무 좁은 column을 사용하지 않되
긴 정책 문서를 지나치게 넓게 펼치지 않는다.

권장:

```text
Page title
Last updated date
Table of contents optional
Readable policy content
Footer
```

---


# 20. Terms of Service

## 20.1 Route

```text
/terms
```

## 20.2 Access

Guest / Authenticated User 모두 접근 가능하다.

Footer에서 항상 쉽게 접근 가능해야 한다.

---

## 20.3 Requirement

Terms of Service는 placeholder 또는 빈 페이지여서는 안 된다.

GitneaPig의 실제 기능과 성격에 맞는 내용을 포함해야 한다.

---

## 20.4 Terms Content

최종 화면에 다음 내용을 실제 Terms text로 작성한다.

### 1. About GitneaPig

```text
GitneaPig is an educational web application designed to help users
learn and practice Git/GitHub collaboration concepts through
lessons, a simulated repository, quests, challenges, and reference content.
```

### 2. Acceptance of Terms

서비스를 사용하면 해당 Terms에 동의하는 것으로 본다는 기본 내용을 작성한다.

### 3. Accounts

```text
Users are responsible for the activity performed through their account.
Users should provide accurate account/profile information.
Users must not access another user's account without authorization.
```

Email/Password와 42 OAuth 모두 지원한다는 점과 충돌하지 않게 작성한다.

### 4. Educational Simulator

GitneaPig Simulator의 성격을 명확히 한다.

```text
The Git simulator is an educational simulation.
It does not execute arbitrary shell commands on the host system.
It may intentionally simplify or limit behavior compared with a complete Git implementation.
Users should verify commands in an appropriate real repository before relying on them for important work.
```

이 항목은 GitneaPig 프로젝트에 특히 중요하다.

### 5. Acceptable Use

금지 예:

```text
attempting unauthorized access
abusing authentication or APIs
interfering with other users
attempting to corrupt service data
automated abuse or excessive requests
using the service for unlawful activity
```

교육용 simulator를 이용해 실제 shell/network 공격 기능을 제공하지 않는다.

### 6. User Interactions

Friends 기능과 관련해:

```text
Users are responsible for how they interact with other users.
Abusive use of friend requests or other social features may be restricted.
```

현재 별도의 chat 기능이 없으므로
chat moderation terms를 억지로 추가하지 않는다.

### 7. Progress, XP, and Achievements

```text
XP, levels, streaks, achievements, and challenge completion
are in-service gamification features and have no monetary value.
```

오류/중복 요청 방지를 위해 service가 잘못 지급된 progress/reward를 수정할 수 있다는
합리적인 조항을 둘 수 있다.

### 8. Availability and Changes

```text
Features may be changed, updated, or temporarily unavailable.
The project does not guarantee uninterrupted availability.
```

### 9. Intellectual Property / Project Content

GitneaPig 자체 UI/content와 외부 service/technology를 구분한다.

Git, GitHub, 42 등 제3자 명칭/상표의 소유권을 주장하지 않는다.

필요 시:

```text
GitneaPig is an educational project and is not presented as an official GitHub or 42 service.
```

### 10. Disclaimers

```text
Educational content and simulator output are provided for learning purposes.
The service does not guarantee that all simulated behavior exactly matches
every Git version, hosting platform, or repository configuration.
```

### 11. Limitation of Liability

학생 프로젝트 성격에 맞는 합리적이고 과장되지 않은 기본 disclaimer를 작성한다.

### 12. Account Restriction / Termination

다음과 같은 경우 access를 제한할 수 있다고 작성할 수 있다.

```text
security abuse
unauthorized access attempts
service disruption
serious violation of these Terms
```

### 13. Changes to Terms

```text
Terms may be updated as the application changes.
The effective/update date is displayed.
```

### 14. Contact

실제 project contact information을 표시한다.

placeholder:

```text
Contact: <project contact email or team contact method>
```

최종 제출 전 실제 값으로 교체한다.

---

## 20.5 Terms Page UI

Privacy와 동일한 policy-document visual family를 사용한다.

```text
Page title
Last updated date
Readable sections
Footer
```

Privacy와 Terms가 완전히 다른 style로 보이지 않게 한다.

---


# 21. Footer

Footer는 모든 일반 application page에서 접근 가능해야 한다.

최소:

```text
Privacy Policy
Terms of Service
```

권장:

```text
GitneaPig
Privacy Policy
Terms of Service
```

Privacy / Terms는 Auth 여부와 관계없이 항상 접근 가능하다.

Workspace 화면에서 Footer가 UX를 방해하는 경우
page 하단 또는 application shell 구조 안에서 접근성을 유지하는 방식으로 제공할 수 있다.

---

# 22. Multi-user / Concurrency Requirements

GitneaPig는 여러 사용자가 동시에 로그인하고 서비스를 사용해도
서로의 데이터가 섞이거나 손상되지 않아야 한다.

이 요구사항은 사용자 간 실시간 chat이나
실시간 공동 편집 기능을 필수로 요구하는 것으로 해석하지 않는다.

핵심은:

```text
Multiple users can be active simultaneously.
Concurrent requests are handled safely.
User-owned data remains isolated.
No race condition corrupts progress or reward data.
Real-time updates are reflected when a feature actually requires them.
```

## 22.1 Required Concurrency Cases

### User Data Isolation

```text
User A bookmark
≠
User B bookmark
```

Progress, XP, friends, achievements 등 모든 user-owned data에 동일하게 적용한다.

### Completion / XP Idempotency

동일 completion request가 동시에 여러 번 들어와도:

```text
XP reward once
Achievement unlock once
Completion row once
```

이어야 한다.

### Daily Challenge

동일 사용자 + 동일 날짜 + 동일 challenge는
reward를 한 번만 지급한다.

### Friendship

동일 사용자 pair에 중복 pending/friendship data가 생성되지 않게 한다.

### Bookmark

동일 사용자 + 동일 target의 Bookmark 중복 row를 방지한다.

### Progress

동시 요청으로 progress가 rollback되거나
다른 사용자의 progress로 overwrite되지 않아야 한다.

---

## 22.2 Implementation Guidance

권장:

```text
Prisma transaction
Unique constraints
Atomic updates
Server-side authorization
Idempotent completion logic
```

Frontend만으로 concurrency를 막으려 하지 않는다.

---

## 22.3 Real-time Behavior

Friends online status는 다음 방식으로 구현한다.

```text
lastActiveAt
+
polling
```

---


# 23. Progressive Web App (PWA)

## 23.1 Module Goal

GitneaPig는 installable PWA와 offline support를 제공한다.

이 기능은 단순히 manifest 파일만 추가하는 수준이 아니라,
사용자가 네트워크 연결이 끊긴 상태에서도 가능한 기능과 불가능한 기능을
명확하게 구분해 사용할 수 있어야 한다.

---

## 23.2 Installability

최소 다음을 제공한다.

```text
Web App Manifest
Application name
Short name
App icons
Theme/background metadata
Standalone display mode
Service Worker
Installability requirements
```

지원 브라우저에서 사용자가 GitneaPig를 설치 가능한 Web App으로 인식할 수 있어야 한다.

---

## 23.3 Offline Cache Scope

Offline에서 최소 다음을 사용할 수 있도록 cache 전략을 설계한다.

```text
Application shell
Static assets
Guest-safe Lesson 1–3 content
Guest-safe Practice Command Guide content
Practice shell
Free Sandbox
Client-side Git Simulator
```

Git Simulator가 pure TypeScript client-side module이므로,
이미 필요한 frontend resources가 cache된 경우 Practice / Free Sandbox의
repository simulation은 네트워크 없이도 실행 가능해야 한다.

---

## 23.4 Online-required Features

다음 기능은 server state 또는 external authentication이 필요하므로
offline에서 정상 동작한다고 가장하지 않는다.

```text
Email login/signup requiring server request
42 OAuth
Persisted progress synchronization
XP / Achievement persistence
Daily Challenge reward persistence
Bookmarks synchronization
Friends / online status
Profile update
Avatar upload
Public API
Authenticated Reference detail
Protected Lesson 4–5 content
Other private/authenticated API responses
```

Offline에서 해당 기능을 시도하면 silent failure 대신
명확한 offline 안내를 표시한다.

예:

```text
You're offline.
This action requires an internet connection.
```

---

## 23.5 Offline State Indicator

Application은 현재 offline 상태를 사용자가 인지할 수 있게 한다.

예:

```text
Offline
Some features are unavailable.
```

Indicator는 핵심 콘텐츠를 가리지 않는 compact UI로 제공한다.

---

## 23.6 Cache Versioning / Update Behavior

새 frontend version 배포 시
오래된 cache 때문에 application이 깨지지 않도록 versioned cache 전략을 사용한다.

새 service worker가 준비된 경우
사용자가 안전하게 새 버전으로 갱신할 수 있어야 한다.

---


## 23.8 Private Cache Security

Authenticated/private API response는 shared persistent Service Worker cache에 저장하지 않는다.

예:

```text
Profile
Friends
Bookmarks
User Progress / XP
API Keys
Authenticated Reference detail
Protected Lesson 4–5 content
Auth/OAuth responses
```

Logout 시 user-specific runtime/query cache를 제거한다.

```text
Persistent public cache
→ guest-safe data only

Private data
→ no-store / network-only
```

공용 PC에서 이전 사용자의 private content가 Guest 또는 다음 사용자에게 노출되어서는 안 된다.

---

# 24. Selected Module Plan

GitneaPig는 최종 평가에서 다음 Module 구성을 목표로 한다.

```text
Web
────────────────────────────────────
Frontend + Backend Framework      2
ORM                               1
Public API                        2
Advanced Search                   1
Custom Design System              1
PWA                               1

Accessibility / Internationalization
────────────────────────────────────
Multiple Languages                1
Additional Browsers               1

User Management
────────────────────────────────────
Standard User Management          2
42 OAuth                          1

Gaming and User Experience
────────────────────────────────────
Gamification                      1

Modules of Choice
────────────────────────────────────
Custom Git Simulator              2

────────────────────────────────────
Target Total                     16
```

---

## 24.1 Standard User Management Evidence

Module 요구를 충족하기 위해 다음 기능을 실제 구현한다.

```text
Profile page
Profile information update
Default avatar
Preset avatar selection
Custom avatar upload
Friends add/remove
Friends list
Online / Offline status
```

Friends의 online status는 실제 Friends 화면에 badge/text로 노출한다.

구현 방식:

```text
lastActiveAt
+
polling
```

---

## 24.2 Gamification Evidence

최소 세 가지 이상의 persistent gamification feature를 실제 제공한다.

GitneaPig는 다음을 사용한다.

```text
XP / Level
Achievements
Daily Challenge
Streak
```

DB에 progression을 저장하고,
progress bar / completion feedback / achievement state 등
시각적 feedback을 제공한다.

---

## 24.3 Advanced Search Evidence

Reference Search는 다음을 실제 지원한다.

```text
Search
Filters
Sorting
Pagination
```

단순 keyword input 하나만 구현하고 Advanced Search Module을 주장하지 않는다.

---

## 24.4 Custom Design System Evidence

최소 10개 이상의 reusable component를 실제 여러 화면에서 재사용한다.

Design System에는 최소 다음이 포함되어야 한다.

```text
Color palette
Typography
Icons
Button variants
Input styles
Card patterns
Badge system
Progress components
Tabs
Modal / Dropdown
Terminal
Git Graph
Repository State Panel
```

실제 구현과 `DESIGN_SYSTEM.md`가 일치해야 한다.

---

## 24.5 Additional Browser Support Evidence

기준 브라우저:

```text
Google Chrome
```

추가 지원 브라우저:

```text
Firefox
Microsoft Edge
```

각 브라우저에서 전체 핵심 기능을 테스트한다.

최소 검증 범위:

```text
Authentication
42 OAuth callback flow where testable
Learn
Practice
Simulator
Quest
Daily Challenge
Reference Search
Profile
Avatar upload
Friends
Achievements
Bookmarks
Localization
PWA behavior where supported
Responsive layout
```

브라우저별 limitation이 있다면 README에 문서화한다.

---

## 24.6 Public API Evidence

Public API는 최소 다음 요구를 모두 충족해야 한다.

```text
5+ endpoints
Secured API key
Rate limiting
Documentation
GET
POST
PUT
DELETE
```

단순 내부 frontend API를 Public API Module로 계산하지 않는다.

---

## 24.7 Custom Git Simulator Major Evidence

Custom Git Simulator는 Git command 문자열에
고정된 성공 문구를 반환하는 mock이 아니다.

기술적 범위:

```text
Command parsing / normalization
Working Tree
Staging Area
Commit snapshots
Commit graph / parent relationships
Branches / HEAD
git diff / git diff --staged
Merge
Merge conflict state
Conflict resolution
Virtual remote repository
Remote-tracking branches
Fetch
Pull
Push
State-based validation
Git Graph visualization
Reusable integration across Learn / Practice / Quest / Daily Challenge
```

README에는 최소 다음을 설명한다.

```text
Why this custom module was chosen
Technical challenges
How RepositoryState is modeled
How commands derive output/state transitions
How merge/conflict/remote behavior is represented
How it adds value to GitneaPig
Why its scope and technical complexity justify Major status
Known differences from real Git
```

---

# 25. Page Specification Template

이 문서의 이후 모든 Page 명세는 다음 형식을 사용한다.

```text
Route
Access
Purpose
Layout
Visible Components
Buttons / Inputs
User Actions
Action Results
State Changes
Navigation
Guest / Authenticated Difference
Loading State
Empty State
Error State
Responsive Behavior
Functional Acceptance Criteria
```

Codex는 기능 이름만 존재하는 Placeholder UI를 만들면 안 된다.

명세된 Button, Input, Tab, Menu는 실제 동작해야 하며, 페이지 이동이나 상태 변화가 명시되어 있다면 반드시 구현해야 한다.

---

# 26. Implementation Interpretation Rules

Codex는 이 문서를 다음 원칙으로 해석한다.

1. 명세에 존재하는 기능을 임의로 삭제하거나 단순화하지 않는다.
2. 버튼이 명세되어 있다면 실제 동작을 구현한다.
3. 링크와 Route가 명세되어 있다면 실제 Navigation을 구현한다.
4. Guest와 Authenticated User의 차이를 구현한다.
5. Loading / Empty / Error 상태를 Placeholder 없이 처리한다.
6. 모든 주요 페이지는 Responsive하게 동작해야 한다.
7. Simulator가 필요한 페이지는 동일한 Simulator Engine을 공유한다.
8. Learn, Practice, Quest에서 동일 Git Command의 동작을 별도로 중복 구현하지 않는다.
9. 최종 구현 완료 여부는 `ACCEPTANCE_CHECKLIST.md`를 기준으로 판단한다.
10. 시각적 배치와 스타일은 `DESIGN_SYSTEM.md`를 따른다.

---
