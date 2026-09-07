# Git Workflow

> GitneaPig 팀의 Git/GitHub 협업 규칙이다.
>
> 기본 전략은 **GitHub Flow**이며 `develop` branch는 사용하지 않는다.
> `main`은 항상 통합 가능한 상태로 유지하고 모든 기능 변경은 Pull Request로 합친다.

---

# 1. 기본 원칙

- `main`에서 직접 기능 개발하지 않는다.
- 모든 작업은 별도 branch에서 진행한다.
- 최신 `main`을 기준으로 새 branch를 만든다.
- 작업 완료 후 Pull Request를 통해 `main`에 merge한다.
- 중요한 변경은 최소 1명의 review를 받는다.
- 이해하지 못한 코드는 merge하지 않는다.
- 하나의 거대한 branch보다 기능 단위의 짧은 branch를 선호한다.
- merge 후 사용이 끝난 remote branch는 삭제한다.

---

# 2. 전체 흐름

```text
Issue 생성
    ↓
최신 main 확인
    ↓
Feature Branch 생성
    ↓
구현 / 테스트
    ↓
Commit
    ↓
Push
    ↓
Pull Request
    ↓
Review / Test
    ↓
main Merge
    ↓
Branch 삭제
```

---

# 3. Issue

Issue는 **구체적인 작업 단위**로 만든다.

좋은 예:

```text
RepositoryState type 정의
git status 구현
git diff --staged 구현
Quest Hint UI 구현
42 OAuth callback 구현
Avatar upload validation 추가
Public API rate limit 구현
```

너무 큰 예:

```text
Backend 전부 구현
Simulator 완성
Frontend 만들기
```

하나의 branch가 서로 밀접한 여러 Issue를 포함할 수는 있다.

예:

```text
feat/simulator-basic

Issue #12 RepositoryState
Issue #13 git status
Issue #14 git add
Issue #15 git commit
```

서로 독립적인 기능까지 한 branch에 묶지는 않는다.

---

# 4. Branch

## 4.1 Naming

```text
feat/<feature>
fix/<bug>
refactor/<target>
test/<target>
docs/<target>
chore/<task>
```

예:

```text
feat/simulator-basic
feat/learn-flow
feat/quest-system
feat/42-oauth
feat/public-api
fix/login-validation
test/simulator-merge
docs/api-guide
chore/docker-setup
```

## 4.2 Create

항상 최신 `main`에서 시작한다.

```bash
git switch main
git pull origin main
git switch -c feat/<feature>
```

현재 다른 branch에서 작업 중이면 먼저 변경사항을 commit/stash한 뒤 이동한다.

---

# 5. Commit

Commit은 가능한 한 **하나의 의미 있는 변경 단위**로 만든다.

Prefix:

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
fix: reject duplicate friend request
test: add merge conflict cases
docs: update simulator architecture
chore: configure pnpm workspace
```

피해야 할 예:

```text
update
fix
final
working
changes
codex
```

하나의 commit에 서로 관련 없는 변경을 섞지 않는다.

---

# 6. Push

처음 remote에 올릴 때:

```bash
git push -u origin <branch-name>
```

이후:

```bash
git push
```

force push는 기본적으로 사용하지 않는다.

이미 review 중인 branch의 history를 바꿔야 하는 특별한 이유가 있으면
팀원과 먼저 확인한다.

---

# 7. Pull Request

기능 구현과 테스트가 완료되면 `main`으로 PR을 만든다.

PR에는 최소 다음을 작성한다.

```md
## 작업 내용
- 무엇을 구현했는지

## 테스트
- 어떤 명령/환경에서 확인했는지
- 주요 정상/에러 케이스

## 관련 Issue
- Closes #12
```

여러 Issue:

```text
Closes #12
Closes #13
Closes #14
```

PR이 너무 커져 review가 어려우면 기능 단위를 다시 나눈다.

---

# 8. Review

중요 기능은 최소 1명의 팀원이 review한다.

확인 항목:

- 요구사항과 실제 동작이 일치하는가
- 다른 기능을 깨뜨리지 않는가
- validation / authorization이 빠지지 않았는가
- 정상 case와 error case가 테스트되었는가
- 중복된 코드가 불필요하게 생기지 않았는가
- 공통 component / shared type을 재사용할 수 있는가
- AI/Codex가 만든 코드를 담당자가 설명할 수 있는가

Review에서 이해되지 않는 핵심 코드는 질문하고 확인한 뒤 merge한다.

---

# 9. Merge

Review와 필요한 테스트가 끝난 뒤 `main`으로 merge한다.

현재 repository의 branch protection / ruleset을 따른다.

기본 정책:

```text
main 직접 push 금지
PR 필수
최소 1 approval
force push 금지
branch deletion protection 유지
```

merge 후:

```text
remote feature branch 삭제
local branch 정리
main update
```

예:

```bash
git switch main
git pull origin main
git branch -d feat/<feature>
```

---

# 10. 다른 작업 시작 전

새 작업은 항상 최신 `main`에서 시작한다.

```bash
git switch main
git pull origin main
git switch -c feat/<new-feature>
```

기존 작업 branch에서 최신 `main`이 필요한 경우
팀 상황에 따라 merge 또는 rebase를 선택한다.

초기 팀 workflow에서는 rebase를 강제하지 않는다.

---

# 11. Conflict

Conflict가 발생했을 때 상대 코드를 임의로 삭제하지 않는다.

순서:

```text
1. 충돌한 파일 확인
2. 현재 branch 변경 의도 확인
3. main 또는 상대 branch 변경 의도 확인
4. 필요한 최종 코드 결정
5. 관련 담당자와 확인
6. build/test
7. conflict resolution commit
```

자신이 이해하지 못하는 영역은 해당 담당자와 함께 해결한다.

---

# 12. main Branch 기준

`main`은 다음 상태를 유지해야 한다.

- build 가능
- 핵심 test 통과
- 실행 가능한 상태
- 알려진 치명적 오류 없음
- unfinished experiment 직접 포함하지 않음
- PR을 통해서만 변경

`main`에 merge된 내용은 다른 팀원이 바로 branch base로 사용할 수 있다고 가정한다.

---

# 13. 작업 단위

```text
Issue
= 구체적인 작업

Branch
= 서로 밀접한 Issue를 구현하는 기능 단위

Commit
= 의미 있는 변경 한 단위

Pull Request
= review 가능한 기능 묶음을 main에 통합하는 단위
```

Branch가 너무 오래 유지되어 `main`과 차이가 커지지 않도록 한다.

---

# 14. Codex / AI 사용 규칙

GitneaPig는 Codex/AI를 적극적으로 사용할 수 있지만,
최종 code ownership은 팀에게 있다.

## 14.1 구현 전

Codex는 먼저 아래 문서를 읽는다.

```text
docs/spec/MASTER_SPEC.md
docs/spec/DATA_CONTRACTS.md
docs/spec/DESIGN_SYSTEM.md
docs/spec/ACCEPTANCE_CHECKLIST.md
```

Codex용 시작 instruction:

```text
docs/CODEX_IMPLEMENTATION_START_PROMPT.md
```

## 14.2 구현 중

- AI가 제품 규칙을 임의로 바꾸게 두지 않는다.
- fake API / fake persistence / placeholder를 완료로 취급하지 않는다.
- 큰 기능을 한 번에 이해 없이 merge하지 않는다.
- phase별 build/test 결과를 확인한다.
- Simulator 핵심 logic은 unit test와 함께 확인한다.
- AI가 생성한 보안/인증/동시성 code는 사람이 반드시 review한다.

## 14.3 Commit

Codex가 수백 파일을 한 번에 하나의 commit으로 묶게 두지 않는다.

가능하면 phase 또는 의미 있는 기능 단위로 나눈다.

예:

```text
chore: initialize pnpm workspace
feat: implement simulator repository state
feat: add authentication
feat: add lesson and practice flows
test: add completion concurrency tests
```

Git author를 실제 기여자와 다르게 꾸미지 않는다.

## 14.4 사람의 확인

AI가 수정한 내용을 commit하기 전에 최소 다음을 확인한다.

```bash
git status
git diff
```

그리고 관련 test/build를 실행한다.

담당자는 자신이 merge한 핵심 code를 설명할 수 있어야 한다.

---

# 15. 다른 컴퓨터에서 작업할 때

다른 팀원/컴퓨터에서도 항상 remote GitHub repository를 기준으로 작업한다.

처음:

```bash
git clone git@github.com:Git-neapig/gitneapig.git
cd gitneapig
```

그 다음:

```bash
git switch main
git pull origin main
git switch -c feat/<feature>
```

이미 존재하는 remote feature branch를 이어서 작업한다면:

```bash
git fetch origin
git switch <branch-name>
git pull
```

각 컴퓨터에서 Git identity를 확인한다.

```bash
git config user.name
git config user.email
```

private repository라면 해당 GitHub account에 repository 접근 권한이 있어야 한다.

---

# 16. 현재 Project Foundation 변경 절차

공통 spec, architecture, workflow처럼
모든 기능의 기준이 되는 문서는 foundation branch에서 준비한 뒤 PR로 `main`에 합친다.

예:

```text
chore/project-foundation
        ↓
Pull Request
        ↓
Review
        ↓
main
```

그 다음 실제 기능 개발 branch를 `main`에서 만든다.

Codex가 초기 구현을 담당하는 경우도 동일하다.

```text
main
  ↓
feat/initial-implementation
```

Codex가 있는 다른 컴퓨터에서는
foundation이 main에 merge된 뒤 clone하는 것을 기본으로 한다.

---

# 17. 마지막 확인

PR을 만들기 전:

```bash
git status
```

확인:

- 불필요한 파일이 포함되지 않았는가
- `.env`가 포함되지 않았는가
- secret/token이 포함되지 않았는가
- generated build output이 포함되지 않았는가
- debug log가 남지 않았는가
- 관련 test를 실행했는가

---

# Workflow Summary

```text
Issue
  ↓
latest main
  ↓
Feature Branch
  ↓
Implement + Test
  ↓
Meaningful Commits
  ↓
Push
  ↓
Pull Request
  ↓
Review
  ↓
Merge to main
  ↓
Delete Branch
```
