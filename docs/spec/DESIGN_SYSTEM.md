# GitneaPig — DESIGN_SYSTEM.md

> 이 문서는 GitneaPig의 **시각 언어, UI primitive, reusable component, responsive layout, interaction state, accessibility, Terminal/Git Graph 표현 규칙**을 정의한다.
>
> `MASTER_SPEC.md`가 무엇을 보여주고 어떻게 동작하는지를 정의하고,
> `DATA_CONTRACTS.md`가 어떤 데이터와 API를 사용하는지를 정의한다면,
> 이 문서는 그 기능을 **어떤 일관된 UI로 표현할지** 고정한다.
>
> Codex는 이 문서에 없는 화면별 임의 색상/간격/컴포넌트 스타일을 추가하지 않는다.
> 새로운 UI가 필요하면 가능한 한 기존 token과 component를 조합한다.

---

# 1. Design Direction

## 1.1 Product Mood

GitneaPig의 시각 방향:

```text
Developer Tool
+
Learning Platform
+
Friendly Guinea Pig Character
```

핵심 인상:

```text
Dark
Technical
Compact
Readable
Playful, but not childish
```

Git/GitHub collaboration을 배우는 도구이므로
일반 교육 사이트보다 IDE / Terminal / Git client에 가까운 분위기를 사용한다.

단, 실제 IDE처럼 지나치게 복잡하거나 회색 일변도로 만들지 않는다.

Guinea Pig mascot과 warm orange accent가
기술적인 화면 안에서 친근한 학습 경험을 만든다.

---

## 1.2 Visual Principles

### A. Dark-first

기본 Theme은 Dark다.

---

### B. Orange is an Accent, not a Background

Orange는 다음에 사용한다.

```text
Primary CTA
Current state
Active tab
Focus/selection
XP / reward emphasis
Important brand highlight
```

큰 Page background 전체를 Orange로 칠하지 않는다.

---

### C. Dense but Breathable

Developer tool처럼 정보량은 충분히 제공하지만
element를 붙여놓지 않는다.

```text
Compact controls
+
Clear grouping
+
Enough section spacing
```

을 유지한다.

---

### D. Desktop Uses Horizontal Space

Desktop에서 모든 내용을 좁은 중앙 column 안에 가두지 않는다.

특히:

```text
Lesson Concept
Practice
Quest
Daily Challenge
Reference Detail
Profile
```

은 넓은 screen을 적극적으로 사용한다.

---

### E. Simulator State is Visual

Terminal output만으로 상태를 설명하지 않는다.

가능한 경우:

```text
Terminal
+
Git Graph
+
Repository State
```

가 같은 정보를 서로 다른 방식으로 보여준다.

---

### F. Mascot Supports the Task

Mascot은 decoration만을 위해 화면 중앙을 차지하지 않는다.

사용:

```text
Hero
Empty state
Success state
Hint / contextual feedback
Authentication
Error state where appropriate
```

Terminal 입력 영역이나 중요한 Git Graph를 가리지 않는다.

---

# 2. Design Technology

## 2.1 Styling

```text
Tailwind CSS
```

모든 design token은 Tailwind theme 또는 CSS variable로 중앙 관리한다.

페이지별 임의 hex value를 직접 사용하지 않는다.

---

## 2.2 Icons

기본 icon set:

```text
lucide-react
```

규칙:

```text
16px → compact control
18px → normal UI
20px → prominent action
24px+ → empty state / feature illustration only
```

Icon만으로 의미가 불명확한 action에는 text label 또는 accessible label을 제공한다.

Emoji를 주요 UI icon 대신 사용하지 않는다.

---

## 2.3 Fonts

### UI Font

```text
Inter
```

Package:

```text
@fontsource/inter
```

Fallback:

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

---

### Monospace Font

Terminal / Git command / hash / branch / code:

```text
JetBrains Mono
```

Package:

```text
@fontsource/jetbrains-mono
```

Fallback:

```css
font-family:
  "JetBrains Mono",
  "SFMono-Regular",
  Consolas,
  "Liberation Mono",
  monospace;
```

External runtime font CDN을 사용하지 않는다.

---

# 3. Color System

## 3.1 Token Rule

Color는 semantic token으로 사용한다.

권장 CSS variable naming:

```css
--color-bg
--color-surface-1
--color-surface-2
--color-surface-3
--color-border
--color-border-strong

--color-text
--color-text-muted
--color-text-subtle

--color-primary
--color-primary-hover
--color-primary-pressed
--color-primary-soft

--color-success
--color-warning
--color-danger
--color-info
```

---

## 3.2 Base Palette

### Background / Surface

| Token | Value | Usage |
|---|---|---|
| `bg` | `#0E0E10` | page background |
| `surface-1` | `#141416` | card / panel |
| `surface-2` | `#18181B` | elevated panel / input |
| `surface-3` | `#202024` | hover / selected neutral |
| `border` | `#2A2A30` | default border |
| `border-strong` | `#3A3A42` | emphasized border |

---

### Text

| Token | Value | Usage |
|---|---|---|
| `text` | `#F5F7FA` | primary text |
| `text-muted` | `#A7AFBA` | secondary text |
| `text-subtle` | `#747D89` | metadata / placeholder |
| `text-inverse` | `#111317` | text on bright accent |

---

### Brand / Primary

| Token | Value | Usage |
|---|---|---|
| `primary` | `#D4711A` | CTA / active / current |
| `primary-hover` | `#E07B1E` | hover |
| `primary-pressed` | `#B85F12` | pressed |
| `primary-soft` | `rgba(212, 113, 26, 0.14)` | subtle selected background |

---

### Semantic

| Token | Value | Usage |
|---|---|---|
| `success` | `#48C78E` | completed / success |
| `warning` | `#F3B84B` | warning |
| `danger` | `#F26D78` | destructive / error |
| `info` | `#63A7FF` | informational state |

Semantic color만으로 상태를 표현하지 않는다.

예:

```text
green + "Completed"
red + error icon + message
orange + "Current"
```

처럼 text/icon을 함께 사용한다.

---

## 3.2A Final Palette Rule

위 값은 GitneaPig의 최종 implementation baseline palette로 사용한다.

브라우저 font anti-aliasing이나 image asset 때문에 미세한 시각 차이가 생길 수는 있지만,
Codex가 페이지마다 별도 orange/black palette를 다시 선택하면 안 된다.

새 semantic color가 필요하면 기존 token과의 역할 관계를 먼저 정의한다.

---

## 3.3 Git Graph Colors

Git Graph branch line은 branch를 구분하기 위해 제한된 palette를 사용한다.

```text
Graph 1 → #FF8A3D
Graph 2 → #63A7FF
Graph 3 → #48C78E
Graph 4 → #B58CFF
Graph 5 → #F3B84B
Graph 6 → #EF78B7
```

Branch color 자체가 branch identity의 유일한 정보가 되어서는 안 된다.

항상:

```text
branch label
commit node
connection line
```

을 함께 사용한다.

---

# 4. Typography

## 4.1 Type Scale

| Token | Size | Line Height | Weight |
|---|---:|---:|---:|
| `display` | 48px | 56px | 700 |
| `h1` | 36px | 44px | 700 |
| `h2` | 28px | 36px | 700 |
| `h3` | 22px | 30px | 600 |
| `h4` | 18px | 26px | 600 |
| `body-lg` | 17px | 28px | 400 |
| `body` | 15px | 24px | 400 |
| `body-sm` | 14px | 21px | 400 |
| `caption` | 12px | 18px | 500 |
| `mono` | 14px | 22px | 400 |
| `mono-sm` | 12px | 18px | 400 |

Mobile에서는 `display`를 36px 수준으로 축소한다.

---

## 4.2 Heading Rule

Page:

```text
H1
→ page title

H2
→ major section

H3
→ card group / subsection
```

Heading level을 단순히 시각적 크기를 위해 건너뛰지 않는다.

---

## 4.3 Git Command Text

Git command:

```text
monospace
```

예:

```text
git switch feature/login
```

명령어 text는 번역하지 않는다.

---

# 5. Spacing System

기본 단위:

```text
4px
```

주요 scale:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

규칙:

```text
control internal gap
→ 8–12

card padding
→ 20–24

panel gap
→ 16–24

major section gap
→ 48–80
```

Desktop layout을 넓게 만든다는 이유로
element 내부 padding까지 과도하게 늘리지 않는다.

---

# 6. Radius

```text
xs   4px
sm   6px
md   10px
lg   14px
xl   18px
pill 999px
```

기본:

```text
Button → 8–10px
Input → 8–10px
Card → 12–14px
Modal → 14–18px
Badge → pill
Terminal → 12–14px
```

모든 element를 과하게 둥글게 만들지 않는다.

---

# 7. Border / Elevation

Dark UI에서는 shadow보다 border를 우선 사용한다.

Default Card:

```text
1px solid border
```

Elevated overlay:

```text
stronger border
+
subtle shadow
```

권장:

```css
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.28);
```

Page 내부 일반 card에 강한 drop shadow를 반복하지 않는다.

---

# 8. Layout Grid

## 8.1 Breakpoints

Tailwind 기준:

```text
sm  640px
md  768px
lg  1024px
xl  1280px
2xl 1536px
```

---

## 8.2 Content Width

일반 page shell:

```text
max-width: 1440px
```

Desktop horizontal padding:

```text
32px
```

Large desktop:

```text
40–48px
```

Tablet:

```text
24px
```

Mobile:

```text
16px
```

---

## 8.3 Narrow Reading Content

Privacy / Terms처럼 읽기 중심 화면:

```text
max-width: 820px
```

단, Page Header/Breadcrumb은 일반 shell에 둘 수 있다.

---

# 9. Responsive Rules

## 9.1 Desktop

Desktop에서는:

```text
two-column
three-column
split workspace
dashboard grid
```

를 적극 사용한다.

---

## 9.2 Tablet

복잡한 3-column layout은:

```text
main + side panel
```

또는 tab layout으로 줄인다.

---

## 9.3 Mobile

Mobile:

```text
single column
stacked cards
tabs for secondary tools
full-width primary CTA
```

Terminal/Git Graph:

```text
Tabs
Terminal | Git Graph | Repo State
```

형태를 사용할 수 있다.

Horizontal scroll은:

```text
terminal code
long Git command
graph canvas
```

처럼 불가피한 영역에만 제한한다.

Page 전체 horizontal scroll은 금지한다.

---

# 10. Focus / Keyboard / Accessibility

## 10.1 Focus Ring

Keyboard focus:

```text
2px primary
2px offset using bg color
```

`outline: none`만 적용하고 대체 focus indicator를 제거하는 것을 금지한다.

---

## 10.2 Touch Target

Interactive control:

```text
minimum 40 × 40px
```

가능하면:

```text
44 × 44px
```

---

## 10.3 Contrast

주요 text와 interactive control은 WCAG AA 수준의 가독성을 목표로 한다.

`text-subtle`은 작은 본문이나 핵심 instruction에 사용하지 않는다.

---

## 10.4 Motion

Animation duration:

```text
120–220ms
```

대부분:

```text
150ms
```

사용.

`prefers-reduced-motion`에서는 불필요한 transition/graph animation을 줄인다.

---

## 10.5 Home Full-page Scroll Motion

Home Desktop은 Hero와 `Choose Your Next Step`의 두 full-screen section 사이에
vertical scroll snap을 사용한다.

권장 구현:

```css
.home-scroll {
  height: calc(100dvh - var(--app-header-height));
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-behavior: smooth;
}

.home-section {
  min-height: calc(100dvh - var(--app-header-height));
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

실제 DOM 구조에 따라 body scroll을 사용할 수 있지만 결과 동작은 동일해야 한다.

목표:

```text
조금 스크롤
→ 중간에 애매하게 멈추지 않음
→ 다음 section으로 부드럽게 정렬
```

`prefers-reduced-motion: reduce`에서는 smooth behavior를 제거하거나 최소화한다.

Home 이외의 workspace/document page에는 이 snap behavior를 적용하지 않는다.

---

# 11. Core Reusable Components

Custom Design System module의 최소 10 reusable component 조건을
여유 있게 충족하기 위해 다음 component를 실제 shared UI로 구현한다.

위치 권장:

```text
apps/frontend/src/components/ui/
```

화면별 복사본을 만들지 않는다.

---

## 11.1 Button

Variants:

```text
primary
secondary
ghost
danger
```

Sizes:

```text
sm
md
lg
```

States:

```text
default
hover
focus
pressed
disabled
loading
```

Primary Button:

```text
orange background
dark text
```

Secondary:

```text
surface background
border
primary text
```

---

## 11.2 IconButton

Icon-only action용.

반드시:

```text
aria-label
tooltip when meaning is not obvious
```

예:

```text
Reset
Copy
Bookmark
Close
```

---

## 11.3 TextInput

States:

```text
default
focus
error
disabled
```

구조:

```text
Label
Input
Helper/Error text
```

---

## 11.4 PasswordInput

TextInput 기반.

추가:

```text
show/hide password
```

---

## 11.5 SearchInput

Reference / Friends Search에 재사용.

```text
Search icon
clear button
optional debounce
```

---

## 11.6 Select / Dropdown

사용:

```text
Language
Sort
Filter
Playground selection where appropriate
```

Keyboard navigation을 지원한다.

---

## 11.7 Card

Variants:

```text
default
interactive
selected
locked
success
```

Card 전체가 link일 경우 nested interactive element 충돌을 피한다.

---

## 11.8 Badge

Variants:

```text
neutral
primary
success
warning
danger
info
locked
```

예:

```text
Current
Completed
Locked
Online
Offline
Beginner
```

---

## 11.9 Tabs

사용:

```text
Practice right panel
Daily Challenge right panel
Bookmarks
```

Active tab은:

```text
color
+
indicator
+
aria-selected
```

로 표현한다.

---

## 11.10 ProgressBar

사용:

```text
Lesson progress
XP / Level
Achievement progress
```

Progress text 또는 accessible value를 제공한다.

---

## 11.11 Modal / Dialog

사용:

```text
Practice Reset confirmation
Change Playground warning
locked content auth prompt
destructive confirmation
```

Quest / Daily `Reset`은 MASTER_SPEC 정책대로 confirmation을 사용하지 않는다.

Modal:

```text
focus trap
Escape close where safe
initial focus
focus return
```

---

## 11.12 Tooltip

짧은 보조 설명에만 사용한다.

중요한 instruction을 Tooltip 안에만 숨기지 않는다.

---

## 11.13 EmptyState

구조:

```text
optional mascot/icon
title
description
optional CTA
```

사용:

```text
No bookmarks
No friends
No search results
No achievements in category
```

---

## 11.14 Alert / InlineMessage

Variants:

```text
info
success
warning
error
offline
```

Form error / OAuth error / offline 제한에 사용한다.

---

## 11.15 Skeleton

Page 또는 card loading state.

Layout shift를 줄일 수 있도록 실제 element 크기와 유사하게 만든다.

---

## 11.16 Breadcrumb

예:

```text
Learn / Branch
Reference / git push
```

---

## 11.17 Pagination

Reference Advanced Search에서 필수.

구조:

```text
Previous
Page numbers
Next
```

Mobile에서는 condensed representation을 사용할 수 있다.

---

## 11.18 Avatar

Variants:

```text
default guinea pig
preset guinea pig
custom upload
```

Sizes:

```text
sm
md
lg
xl
```

Custom image:

```text
object-fit: cover
```

실패 시 default avatar fallback.

---

## 11.19 StatusDot

Friends online/offline 등에서 Badge와 함께 사용 가능.

Color만으로 상태를 판단하게 하지 않는다.

---

## 11.20 LanguageSelector

Header shared component.

표시:

```text
한국어 ▼
English ▼
日本語 ▼
```

Globe icon 단독 UI를 사용하지 않는다.

---

# 12. Application Components

다음은 generic primitive보다 product-specific하지만
여러 화면에서 공유하는 reusable component다.

---

## 12.1 AppHeader

Desktop:

```text
Logo
Navigation
Spacer
Language Selector
Auth controls / User controls
```

Guest:

```text
Login
Sign Up
```

Authenticated:

```text
XP / Level summary
Avatar
User menu
```

Sticky 사용 가능.

Header가 Terminal workspace를 지나치게 축소시키지 않도록 높이는 compact하게 유지한다.

권장 높이:

```text
64px
```

---

## 12.2 AppFooter

항상:

```text
Privacy Policy
Terms of Service
```

를 쉽게 찾을 수 있어야 한다.

Optional:

```text
GitneaPig mark
small copyright/team text
```

---

## 12.3 PageHeader

구조:

```text
Breadcrumb optional
Title
Description optional
Actions optional
```

---

## 12.4 GitCommandChip

Git command inline 표현.

예:

```text
git status
git add .
git push
```

monospace + surface background.

복잡한 command는 wrapping 또는 horizontal code scroll을 허용한다.

---

## 12.5 TerminalPanel

Learn / Practice / Quest / Daily Challenge에서 공유.

상세 규칙은 Terminal section 참고.

---

## 12.6 GitGraphPanel

Learn / Practice / Quest / Daily Challenge에서 공유.

---

## 12.7 RepoStatePanel

최소 표현:

```text
Current Branch
HEAD
Working Tree
Staged Files
Remote Tracking
Merge State where applicable
```

---

## 12.8 CommandGuidePanel

Practice 전용 guest-safe command projection.

```text
Command
Syntax
Short purpose
Short example
```

Reference Detail 전체 내용을 보여주지 않는다.

---

## 12.9 HintPanel

Quest / Daily Challenge.

Progressive Hint:

```text
1 Situation
2 Concept
3 Command category
4 Concrete example
```

현재 단계까지만 표시한다.

---

## 12.10 ObjectiveList

Quest.

States:

```text
pending
current
completed
```

완료 조건의 raw internal rule을 사용자에게 그대로 노출하지 않는다.

---

## 12.11 XPReward

완료 결과에서 재사용.

```text
+20 XP
```

Guest:

```text
Sign in to save progress and earn XP
```

처럼 persistence 차이를 명확하게 표현한다.

---

## 12.12 LockedContent

Guest의:

```text
Lesson 4–5
Reference
authenticated-only actions
```

에 재사용.

구조:

```text
Lock icon
Feature title
Reason
Sign Up
Log In
```

---

## 12.13 MascotMessage

Guinea Pig contextual feedback.

구조:

```text
small mascot
short message
optional action
```

사용 예:

```text
Nice! You created a branch.
Your remote has changed.
Try inspecting the repository state.
```

정답 command를 곧바로 알려주지 않아야 하는 Quest에서는
Hint policy를 우회하지 않는다.

---

# 13. Terminal Design

## 13.1 Visual Structure

```text
Panel Header
────────────
Terminal output scroll area
────────────
Prompt + input
```

Terminal은 일반 textarea처럼 보이지 않게 한다.

---

## 13.2 Terminal Colors

```text
Background
→ slightly darker than card

Prompt
→ primary orange

Command
→ main text

Success/help output
→ neutral/main text

Error
→ danger

Muted metadata
→ text-muted
```

---

## 13.3 Prompt

예:

```text
gitneapig $
```

또는 selected scenario context가 필요하면:

```text
main $
```

Prompt 자체는 input value에 포함하지 않는다.

---

## 13.4 Command History

Up / Down key로 history 탐색.

현재 input과 history navigation의 keyboard behavior는 실제 terminal convention과 유사하게 한다.

---

## 13.5 Scrolling

Terminal output 영역만 scroll한다.

Terminal panel은 workspace의 사용 가능한 높이 안에서 유지하고,
history가 늘어나면 panel 자체가 계속 커지는 것이 아니라 output viewport에 vertical scrollbar가 생겨야 한다.

구현 기준:

```text
Terminal panel
→ min-height: 0 in flex/grid parent

Output viewport
→ overflow-y: auto
→ overscroll-behavior: contain

Page
→ command history 때문에 높이가 계속 증가하지 않음
→ output 추가 때문에 page scroll position이 강제로 이동하지 않음
```

Learn Practice / Practice / Quest / Daily Challenge 모두 같은 규칙을 사용한다.

새 output:

```text
user is near bottom
→ auto-scroll

user has intentionally scrolled up
→ position 유지
→ optional "New output" indicator
```

---

## 13.6 Copy

Terminal text는 selection/copy 가능해야 한다.

---

## 13.7 Error State

Invalid Git command:

```text
danger text
+
short actionable message
```

과도한 modal을 띄우지 않는다.

---

# 14. Git Graph Design

## 14.1 Structure

Git Graph는 최소 다음을 시각화한다.

```text
Commit node
Parent edge
Branch lane
Branch label
HEAD indicator
Remote-tracking label where relevant
Commit message
Short commit ID
```

---

## 14.2 HEAD

현재 HEAD는 눈에 띄어야 한다.

예:

```text
HEAD
↓
main
```

Orange accent 또는 compact label 사용.

---

## 14.3 Commit Node

Selected commit:

```text
larger node
+
strong border/ring
```

Hover 가능한 경우:

```text
commit ID
message
parent
```

tooltip 제공 가능.

---

## 14.4 Branch Labels

Local:

```text
main
feature/login
```

Remote-tracking:

```text
origin/main
```

visual treatment를 구분한다.

예:

```text
Local → solid label
Remote → outlined label
```

---

## 14.5 Conflict

Conflict를 graph에서 빨간색 line 하나로만 표현하지 않는다.

Repo State / file status에도:

```text
Conflicted
```

를 함께 표시한다.

---

# 15. Repository State Design

File groups:

```text
Working Tree
Staging Area
Conflicts
```

Status treatment:

```text
Untracked
Modified
Deleted
Staged
Conflicted
Resolved
```

각 status는 Badge + text를 함께 사용한다.

File path는 monospace.

---

# 16. Navigation

## 16.1 Main Navigation

Desktop:

```text
Learn
Practice
Quest
Daily Challenge
Reference
```

Authenticated secondary/user menu:

```text
Profile
Friends
Achievements
Bookmarks
API Keys
Logout
```

---

## 16.2 Active State

Active navigation:

```text
primary text
+
subtle primary-soft background or underline
```

한 화면에서 여러 nav가 동시에 active처럼 보이지 않는다.

Primary navigation active state는 route 기준으로 상호 배타적이다.

```text
Learn / Practice / Quest / Daily Challenge / Reference
→ 동시에 정확히 하나만 active
```

특히 Practice 화면에서 Daily Challenge까지 함께 orange active background를 갖는 것을 금지한다.

---

## 16.3 Mobile Navigation

Mobile에서는 compact menu/drawer를 사용할 수 있다.

Language selector와 auth action을 접근 불가능한 secondary menu 깊숙이 숨기지 않는다.

---

# 17. Home Page Visual Rules

## 17.1 Hero

첫 viewport의 대부분을 Hero가 차지한다.

Desktop:

```text
Left  → headline / description / CTA
Right → Git visual / terminal / mascot
```

두 영역은 겹치지 않는다.

Hero right visual은 단순 큰 mascot 하나보다:

```text
Git graph
Terminal snippet
Mascot
```

을 조합한 developer-learning scene을 사용한다.

---

## 17.2 Headline

한 줄이 지나치게 길지 않도록:

```text
max-width around 700px
```

정도.

---

## 17.3 CTA

Primary:

```text
Start Learning
```

Secondary:

```text
Practice
```

Quest CTA가 있더라도 Primary보다 강조하지 않는다.

---

## 17.4 Next Step Cards

스크롤 후:

```text
Learn
Practice
Quest
Daily Challenge
```

4개의 compact card.

Desktop에서는 4-column 또는 충분히 넓은 2×2를 사용.

큰 marketing card처럼 과도한 illustration을 넣지 않는다.

### Full-height Rule

`Choose Your Next Step` Section 자체는 내용이 적더라도
Hero와 동일하게 full viewport composition을 유지한다.

```text
Hero
→ viewport 1

Next Step
→ viewport 2
```

가장 아래까지 scroll했을 때 Hero의 일부가 화면 상단에 남아 있지 않아야 한다.

Cards를 억지로 크게 만드는 대신 section 내부의 vertical alignment / spacing으로 높이를 구성한다.

### Scroll Snap

Desktop에서는 10.5의 Home full-page scroll motion을 적용한다.

Footer는 두 번째 section 하단에 자연스럽게 배치할 수 있다.

---

# 18. Learn Visual Rules

## 18.1 Learn List

Desktop:

```text
wide vertical learning path
```

Lesson node 상태:

```text
Completed → success
Current   → primary
Available → neutral
Locked    → muted + lock
```

---

## 18.2 Situation

Learn은 읽기 문서가 아니라 단계적인 teaching experience처럼 보여야 한다.

Desktop:

```text
Scenario / highlighted problem
│
└── Guinea Pig Team Conversation
```

2-column 가능.

권장 visual ingredients:

```text
Guinea Pig teammate portrait
message bubble
role label
short scenario card
small repository/branch cue
```

긴 text paragraph 하나만 중앙에 놓는 형태는 피한다.

---

## 18.3 Why

```text
Short explanation
│
└── Visual Comparison
```

권장:

```text
Without branches | With branches
Before            | After
Problem state     | Improved state
```

Guinea Pig guide callout으로 핵심 이유를 짧게 강조할 수 있다.

---

## 18.4 Concept

```text
Short concept explanation
│
└── Large Git Graph / Repository visualization
│
└── Guinea Pig guide note
```

Graph가 보조 illustration처럼 작아지지 않게 한다.

본문보다 visualization이 학습의 핵심 도구처럼 느껴져야 한다.

---

## 18.5 Command

Desktop:

```text
Command area 65%
Quick Tips / comparison 35%
```

Command Step에서는 실제로 배워야 할 syntax와 concrete example을 명확하게 보여준다.

```text
Exact command
Purpose
Concrete example
Difference from similar command
```

이 단계에서 답을 숨기지 않는다.

---

## 18.6 Practice Stage

Desktop:

```text
Terminal ~60%
Git Graph / Repo State ~40%
```

Practice에서는 바로 이전 Command Step에서 배운 명령어를 기억해 직접 입력한다.
정답 command를 terminal placeholder, tip, adjacent guide에 기본 노출하지 않는다.

상단/오른쪽 control 영역에는 쉽게 찾을 수 있는 `Reset` action을 제공한다.

```text
Git Graph | Repo State                       Reset
```

Reset은 Tab이 아니라 action이며 confirmation 없이 실행한다.

Terminal history가 길어지면 13.5의 독립 scroll 규칙을 적용한다.

---

## 18.6A Lesson Stage Navigation

이미 도달한 이전 Step은 다시 방문 가능해야 한다.

```text
Situation
Why?
Concept
Command
Practice
Result
```

상단 indicator 또는 `Back / Previous`를 사용해 이전 내용을 다시 읽을 수 있다.

특히 Practice에서 Command로 돌아가 명령어를 복습한 뒤 다시 Practice로 진입하는 흐름을 막지 않는다.

Future Step을 완료 전 자유롭게 skip하는 UI는 필수가 아니다.

---

## 18.7 Result

Actions:

```text
[ Practice More ]               [ Next Lesson → ]
secondary                         primary
```

---

# 19. Practice Visual Rules

## 19.1 Playground Picker

5 cards:

```text
Free Sandbox
Basic Repo
Branch Playground
Merge Playground
Remote Playground
```

Card에:

```text
Title
Short description
Difficulty/context where useful
```

Category Playground는 workspace 진입 후 optional `Try:` suggestions를 보여줄 수 있다.

```text
Try:
• Inspect existing branches
• Create a branch
• Switch branches
```

이 UI는 ObjectiveList가 아니다.

```text
checkbox progress 없음
completion percentage 없음
XP 없음
required order 없음
```

Command Guide는 현재 Playground의 topic에 맞게 filtered/contextual하게 시작한다.
Free Sandbox만 전체 simulator-supported command guide를 기본 제공한다.

---

## 19.2 Workspace

Desktop:

```text
Terminal                 60–65%
Right Tool Panel         35–40%
```

Right Tabs:

```text
Git Graph
Repo State
Command Guide
```

Default:

```text
Git Graph
```

---

## 19.3 Toolbar

```text
Playground name
Current branch
HEAD
Spacer
Reset
Change Playground
```

`Reset`은 destructive red button으로 과장하지 않는다.
Practice에서는 confirmation dialog가 따른다.

---

# 20. Quest Visual Rules

## 20.1 Quest List

Card 정보:

```text
Title
Scenario summary
Difficulty
Status
XP
```

정답 command를 유추할 수 있을 정도의 command tag는 사용하지 않는다.

---

## 20.2 Quest Workspace

Desktop:

```text
Left Context/Objectives     ~24%
Terminal                    ~52%
Right State/Tools           ~24%
```

최소 1280px 정도에서 3-column.

더 좁으면:

```text
Terminal
+
tabbed supporting panels
```

로 전환.

---

## 20.3 Terminal Freedom

사용자가 objective에 불필요한 valid command를 실행해도
UI는 error style로 막지 않는다.

Simulator 결과를 그대로 보여준다.

---

## 20.4 Reset

Label:

```text
Reset
```

Quest에서는 confirmation 없음.

Reset은 tall right panel의 맨 아래처럼 발견하기 어려운 위치에 두지 않는다.

권장:

```text
Quest header / toolbar                         Reset
```

또는:

```text
Graph | Repo | Hints                          Reset
```

Tab과 혼동되지 않는 compact action button으로 표시한다.

---

## 20.5 Hint

Hint 자체가 답이 되지 않게:

```text
Hint 1 → situation
Hint 2 → concept
Hint 3 → command category
Hint 4 → concrete example
```

시각적으로 단계가 누적되어도 좋다.

---

## 20.6 Pull Request / Review UI

실제 GitHub 화면을 그대로 복제하지 않는다.

GitneaPig design language 안에서:

```text
Source branch
Target branch
PR status
Review status
Action
```

을 compact card/panel로 보여준다.

---

# 21. Daily Challenge Visual Rules

Daily Challenge는 Practice workspace를 이름만 바꾼 화면처럼 보여서는 안 된다.

기본 visual flow:

```text
Intro / Problem
→ Workspace
→ Completed
```

## 21.1 Intro / Problem

시작 전에는 challenge context를 먼저 읽게 한다.

```text
Today's Challenge
Date
Short collaboration scenario
Goal
Difficulty
Topic
XP
Start Challenge
```

문제 설명은 정답 command를 직접 노출하지 않는다.

Practice와 달리 "오늘 해결할 문제"가 명확하게 존재해야 한다.

---

## 21.2 Workspace

Challenge를 시작한 뒤:

```text
Terminal                  55–60%
Git Graph / Repo State    40–45%
```

추가:

```text
compact challenge context
Hint
Reset
```

Practice의 Command Guide를 넣지 않는다.

Reset은 쉽게 찾을 수 있는 upper workspace action이며 confirmation이 없다.

---

## 21.3 Hint / Reset

Quest와 동일한 progressive hint.

```text
Situation
→ Concept
→ Command category
→ Concrete example
```

Reset:

```text
no confirmation
```

---

## 21.4 Completed State

성공 후 다음을 명확히 보여준다.

```text
Challenge Completed
short result summary
XP reward for authenticated user
Guest persistence notice when relevant
next action
```

새로운 rewards shop 같은 별도 기능을 임의로 추가하지 않는다.

---

# 22. Reference Visual Rules

## 22.1 Guest

Reference Navigation은 표시한다.

Guest가 접근하면:

```text
LockedContent
```

를 사용.

---

## 22.2 Search

Top search area:

```text
Search Input
Category Filter
Difficulty Filter
Sort
```

Result grid는 Desktop 공간을 충분히 사용한다.

Pagination은 grid 아래.

---

## 22.3 Reference List Card

최소:

```text
Command name
Syntax
Category
Difficulty
Short description
Simulator support
```

---

## 22.4 Reference Detail

Desktop:

```text
Main                         65–70%
Sidebar                      30–35%
```

Main:

```text
Syntax
When to use
Examples
Common mistakes
```

Sidebar:

```text
Category
Difficulty
Simulator support
Related Commands
Related Lessons
Related Quests
Bookmark
Practice in Terminal
```

---

# 23. Profile Visual Rules

## 23.1 Desktop

Profile은 좁은 social-profile column이 아니라 dashboard다.

```text
Profile Summary
Stats
Lesson Progress
Recent Achievements
Recent Activity
```

---

## 23.2 Stats

4 cards:

```text
Lessons Done
Quests Done
Total XP
Streak
```

동일 높이, 동일 정보 hierarchy.

---

## 23.3 Edit Profile

```text
Nickname
Avatar
```

Avatar:

```text
Default
Preset
Upload
```

Custom upload에는:

```text
preview
allowed format
2 MB limit
error
```

를 보여준다.

---

## 23.4 API Keys

`/profile/api-keys`는 developer utility page처럼 compact하게 구성.

Raw key 생성 직후에는:

```text
Warning
Key field
Copy button
```

을 명확히 보여준다.

다시 표시할 수 없다는 경고가 CTA 근처에 있어야 한다.

---

# 24. Friends Visual Rules

Page sections:

```text
User Search
Pending Requests
Friends
```

Friend row:

```text
Avatar
Nickname
Level
Online/Offline
Action
```

Online:

```text
StatusDot + Online
```

Offline:

```text
StatusDot + Offline
```

색만 사용하지 않는다.

---

# 25. Achievements Visual Rules

Summary:

```text
Unlocked / Total
Overall progress
Category filters
```

Card:

```text
Icon
Title
Description
XP
Condition/progress
Unlocked/Locked
Unlocked date when applicable
```

Locked achievement를 단순 opacity 20%로 만들어 읽기 어렵게 하지 않는다.

---

# 26. Bookmarks Visual Rules

Tabs:

```text
Lessons
Quests
Commands
```

각 tab에 count 표시.

Bookmark item:

```text
Type
Title
Short summary
Open
Remove
```

Remove는 destructive action이지만
실수 복구가 쉬운 단순 bookmark이므로 과도한 confirm modal은 필수가 아니다.

---

# 27. Authentication Visual Rules

## 27.1 Login / Signup Container

Desktop에서 auth form이 화면 한가운데 지나치게 작은 mobile card처럼 보이지 않게 한다.

권장:

```text
Left  → brand/mascot/context
Right → form
```

또는 충분한 width의 centered form + supporting visual.

---

## 27.2 OAuth Button

```text
Continue with 42
```

Email/password submit과 명확히 분리하되
OAuth만 과도하게 강조하지 않는다.

---

## 27.3 OAuth Error

Inline Alert:

```text
42 login failed.
Please try again.
```

Actions:

```text
Try 42 Again
Use Email Instead
```

---

## 27.4 Onboarding

필수:

```text
Nickname
Avatar
```

Preset avatar grid + custom upload option.

---

# 28. Privacy / Terms

읽기 중심.

```text
max-width 820px
comfortable line-height
clear heading hierarchy
table of contents optional
```

Dark background 위에서 긴 문서를 읽기 어렵지 않도록
body text contrast를 충분히 유지한다.

---

# 29. PWA / Offline UI

## 29.1 Offline Indicator

Compact top/bottom banner 또는 Header status.

```text
Offline
Some features are unavailable.
```

Primary content를 가리지 않는다.

---

## 29.2 Network-only Action

Offline에서 disabled 처리만 하고 이유를 숨기지 않는다.

예:

```text
You're offline.
This action requires an internet connection.
```

---

## 29.3 PWA Update

새 Service Worker:

```text
A new version is available.
[ Update ]
```

사용자 확인 뒤 reload.

---

# 30. Loading States

## 30.1 Initial Auth Check

Header에서 Guest/Login state가 순간적으로 깜빡이지 않도록
Auth initialization 동안 skeleton 또는 neutral state 사용.

---

## 30.2 Page Loading

전체 화면 spinner만 사용하는 대신
페이지 구조와 비슷한 Skeleton을 우선 사용한다.

---

## 30.3 Mutation Loading

Submit button:

```text
loading
disabled
```

중복 submit 방지.

---

# 31. Error States

Error hierarchy:

```text
Field validation
→ field inline error

Recoverable section error
→ InlineMessage + Retry

Page fetch failure
→ Page Error State + Retry

Fatal unexpected
→ generic error page
```

Backend raw error message를 UI에 그대로 출력하지 않는다.

---

# 32. Empty States

Empty state는 제품 상태를 설명하고 가능한 다음 행동을 제공한다.

예:

```text
No bookmarks yet.
Save a lesson, quest, or command to find it here.
[ Browse Lessons ]
```

Friends:

```text
No friends yet.
Search by nickname to add someone.
```

---

# 33. Confirmation Rules

Confirmation Required:

```text
Practice Reset
Change Playground when current state will be lost
Account-sensitive destructive action if added
```

No Confirmation:

```text
Quest Reset
Daily Challenge Reset
Bookmark Remove
```

MASTER_SPEC의 각 기능 정책이 우선한다.

---

# 34. Toast Rules

Toast를 모든 action에 남발하지 않는다.

적합:

```text
Bookmark saved
Profile updated
Avatar uploaded
API key revoked
```

부적합:

```text
Tab changed
Page opened
Every Git command succeeded
```

Git command feedback은 Terminal/MascotMessage로 제공한다.

Toast duration:

```text
4–5 seconds
```

Critical error는 자동 소멸 Toast만으로 전달하지 않는다.

---

# 35. Mascot Rules

## 35.1 Character Identity Rule

GitneaPig에서 **캐릭터 정체성을 가지는 모든 인물 표현은 Guinea Pig 캐릭터로 통일한다.**

적용 대상:

```text
User default / preset avatar
Learn scenario character
Quest teammate
Reviewer
Tech Lead
Virtual team member
Character-based feedback identity
```

캐릭터는 다음 요소로 서로 구분할 수 있다.

```text
clothing
accessories
color accents
glasses
hats
headsets
expressions
role-specific props
```

단, 각 캐릭터는 시각적으로 명확하게 Guinea Pig로 인식되어야 한다.

최종 캐릭터 표현에 다음을 사용하지 않는다.

```text
generic human avatar
human emoji
robot avatar
unrelated animal character
```

`System`처럼 실제 인물을 나타내지 않는 시스템 메시지는
neutral system icon을 사용할 수 있다.

이 규칙은 Learn과 Quest의 대화 UI에도 동일하게 적용한다.

---

## 35.2 Role

Mascot은 다음 상태를 돕는다.

```text
Welcome
Encouragement
Hint
Empty state
Completion
Friendly error
```

---

## 35.3 Size

Hero:

```text
large
```

Workspace feedback:

```text
small/medium
```

Terminal 바로 위에 거대한 mascot을 반복 표시하지 않는다.

---

## 35.4 Consistency

같은 mascot character라도:

```text
happy
thinking
warning
celebrating
```

같은 상태 variant를 사용할 수 있다.

Mascot 자체의 style은 한 illustration family로 유지한다.

---


## 35.5 Mascot Asset Quality

Mascot은 최종 제품에서 단순 emoji/clip-art 품질로 남기지 않는다.

최종 mascot/character asset은 동일한 illustration family로 제작하거나 사용한다.

Asset 방향:

```text
cute but not childish
polished
rounded and expressive
works on dark UI
consistent illustration family
```

Mascot asset이 아직 준비되지 않은 구현 단계에서는
layout을 깨뜨리지 않는 temporary placeholder를 사용할 수 있지만
placeholder 자체를 최종 artwork로 간주하지 않는다.


# 36. Content Style

UI text는 짧고 행동 중심.

좋음:

```text
Create Branch
Run Command
Try Again
Continue Learning
```

피함:

```text
Click here in order to proceed to the next step
```

---

## 36.1 Technical Terminology

Git 용어는 정확히 유지한다.

```text
Working Tree
Staging Area
Commit
Branch
Remote-tracking Branch
Merge Conflict
```

사용자에게 설명할 때만 locale별 설명을 붙인다.

---

# 37. Internationalization Layout

KO / EN / JA에서 string 길이가 달라져도 깨지지 않아야 한다.

고정 width button 안에 text를 강제로 잘라내지 않는다.

Header Navigation은 충분한 gap과 responsive collapse를 가진다.

일본어에서는 단어 단위 spacing을 임의로 넣지 않는다.

Git command는 locale에 관계없이 동일.

---

# 38. Browser Support Visual Contract

Baseline:

```text
Chrome
```

Additional:

```text
Firefox
Edge
```

다음이 browser별로 동일해야 한다.

```text
Layout
Font fallback
Terminal keyboard input
Scrollable panels
Git Graph rendering
Modal focus
PWA supported behavior
Avatar upload
```

Browser-specific limitation이 있으면 README에 기록한다.

---

# 39. Component Folder Structure

권장:

```text
apps/frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   ├── TextInput.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Tabs.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Dialog.tsx
│   │   ├── Tooltip.tsx
│   │   ├── Alert.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Breadcrumb.tsx
│   │   ├── Pagination.tsx
│   │   └── Avatar.tsx
│   │
│   └── product/
│       ├── AppHeader.tsx
│       ├── AppFooter.tsx
│       ├── PageHeader.tsx
│       ├── TerminalPanel.tsx
│       ├── GitGraphPanel.tsx
│       ├── RepoStatePanel.tsx
│       ├── CommandGuidePanel.tsx
│       ├── HintPanel.tsx
│       ├── ObjectiveList.tsx
│       ├── LockedContent.tsx
│       └── MascotMessage.tsx
```

실제 파일명은 구현 과정에서 조정 가능하지만
generic UI component와 product-specific component의 분리는 유지한다.

---

# 40. Tailwind / CSS Token Structure

권장:

```text
apps/frontend/src/styles/
├── tokens.css
├── globals.css
└── terminal.css
```

`tokens.css`:

```css
:root {
  --color-bg: #0E0E10;
  --color-surface-1: #141416;
  --color-surface-2: #18181B;
  --color-surface-3: #202024;

  --color-border: #2A2A30;
  --color-border-strong: #3A3A42;

  --color-text: #F5F7FA;
  --color-text-muted: #A7AFBA;
  --color-text-subtle: #747D89;

  --color-primary: #D4711A;
  --color-primary-hover: #E07B1E;
  --color-primary-pressed: #B85F12;
  --color-primary-soft: rgba(212, 113, 26, 0.14);

  --color-success: #48C78E;
  --color-warning: #F3B84B;
  --color-danger: #F26D78;
  --color-info: #63A7FF;
}
```

Tailwind class와 raw CSS 모두 동일 token을 사용한다.

---

# 41. Custom Design System Module Evidence

평가에서 Custom Design System Module을 설명할 수 있도록
실제 구현은 다음을 만족한다.

## 41.1 Required Foundations

```text
Color palette
Typography
Icon system
Spacing scale
Radius
Responsive layout rules
Focus/accessibility states
```

---

## 41.2 Reusable Components

최소 10개보다 여유 있게 다음 component를 실제 재사용한다.

```text
1  Button
2  IconButton
3  TextInput
4  PasswordInput
5  SearchInput
6  Select/Dropdown
7  Card
8  Badge
9  Tabs
10 ProgressBar
11 Dialog
12 Tooltip
13 EmptyState
14 Alert
15 Skeleton
16 Breadcrumb
17 Pagination
18 Avatar
19 StatusDot
20 LanguageSelector
```

그리고 product component:

```text
21 TerminalPanel
22 GitGraphPanel
23 RepoStatePanel
24 CommandGuidePanel
25 HintPanel
26 ObjectiveList
27 LockedContent
28 MascotMessage
```

단순히 파일을 만들어 놓는 것으로 인정하지 않는다.

여러 실제 페이지에서 같은 component를 재사용해야 한다.

---


# 42. Codex Implementation Rule

Codex가 UI를 구현할 때 우선순위:

```text
1. Design token
2. Generic reusable component
3. Product reusable component
4. Page composition
5. Page-specific exception only when unavoidable
```

금지:

```text
page마다 임의 hex 사용
page마다 서로 다른 Button 구현
비슷한 Card를 매번 새로 복사
Reference와 Practice Command Guide를 같은 상세 UI로 구현
Desktop를 단순한 480px centered column으로 구현
Terminal output 때문에 page 전체가 무한히 길어지게 구현
```

새 component가 필요하면 먼저 기존 component 조합으로 해결 가능한지 확인한다.

새 visual token이 필요하면 임의값을 바로 사용하지 않고
기존 semantic token에 추가하는 방식으로 확장한다.
