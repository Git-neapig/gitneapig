# Git Workflow

GitneaPig 팀의 Git/GitHub 협업 규칙입니다.

---

## 1. 기본 원칙

- `main` 브랜치는 항상 통합 가능한 안정 상태를 유지한다.
- `main`에서 직접 기능 개발을 하지 않는다.
- 기능 작업은 별도 Branch에서 진행한다.
- 작업 완료 후 Pull Request를 통해 `main`에 Merge한다.
- 중요한 변경은 최소 1명의 Review를 거친다.

---

## 2. Issue

Issue는 구체적인 작업 단위로 사용한다.

예:
- RepositoryState 정의
- Command Parser 구현
- `git status` 구현
- Quest Hint UI 구현
- Login validation 추가
- Public API Bookmark endpoint 구현

하나의 Branch는 여러 Issue를 포함할 수 있다.

```text
feat/simulator-core

- Issue #12 RepositoryState 정의
- Issue #13 Command Parser 구현
- Issue #14 git status 구현
- Issue #15 git add 구현
```

---

## 3. Branch

Branch는 하나의 기능 묶음 단위로 만든다.

```text
feat/<기능>
fix/<버그>
docs/<문서>
test/<대상>
chore/<작업>
refactor/<대상>
```

예:

```text
feat/simulator-core
feat/quest-system
feat/terminal-history
feat/github-oauth
fix/login-validation
docs/api
test/simulator-merge
chore/docker-setup
```

항상 최신 `main`에서 새 Branch를 만든다.

```bash
git switch main
git pull
git switch -c feat/<기능>
```

---

## 4. Commit

Commit은 가능한 한 하나의 의미 있는 변경 단위로 만든다.

```text
feat:
fix:
docs:
test:
chore:
refactor:
```

예:

```text
feat: add git switch simulation
fix: validate duplicate user email
docs: document simulator architecture
test: add commit command tests
chore: configure docker compose
```

---

## 5. Push

처음 Branch를 Remote에 Push할 때:

```bash
git push -u origin <branch-name>
```

이후에는:

```bash
git push
```

를 사용한다.

---

## 6. Pull Request

Branch의 기능 구현과 테스트가 완료되면 `main`으로 Pull Request를 생성한다.

PR에는 최소 다음 내용을 작성한다.

```text
## 작업 내용
- 무엇을 구현했는지

## 테스트
- 어떻게 동작을 확인했는지

## 관련 Issue
- Closes #이슈번호
```

여러 Issue를 한 PR에서 완료하는 경우:

```text
Closes #12
Closes #13
Closes #14
```

처럼 작성한다.

---

## 7. Review

중요한 기능은 최소 1명의 팀원이 Review한다.

Review 시 확인할 내용:
- 요구 기능이 정상적으로 구현되었는가
- 다른 기능에 영향을 주지 않는가
- 이해하기 어려운 코드가 없는가
- 테스트가 충분한가
- AI로 생성한 코드라면 담당자가 내용을 이해하고 있는가

---

## 8. Merge

Review와 테스트가 완료되면 `main`으로 Merge한다.

Merge 후 사용이 끝난 Branch는 삭제한다.

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
Review
  ↓
Merge to main
  ↓
Branch 삭제
```

---

## 9. 다른 작업을 시작하기 전

새로운 Branch를 만들기 전에 항상 최신 `main`을 기준으로 시작한다.

```bash
git switch main
git pull
git switch -c feat/<새로운-기능>
```

이미 작업 중인 Branch에서 `main`의 최신 변경이 필요한 경우에는 팀원과 상황을 확인한 뒤 Merge 또는 Rebase 방식을 선택한다.

초기에는 불필요하게 복잡한 Rebase 사용을 강제하지 않는다.

---

## 10. Conflict

Merge Conflict가 발생하면 임의로 상대방 코드를 삭제하지 않는다.

현재 Branch의 변경과 상대 Branch의 변경을 모두 확인한 뒤 필요한 결과를 결정한다.

자신이 이해하지 못하는 영역에서 Conflict가 발생하면 해당 코드 담당자와 함께 해결한다.

---

## 11. main Branch

`main`은 다음 상태를 유지한다.

- Build 가능
- 실행 가능
- 완료되지 않은 기능을 직접 포함하지 않음
- 직접 Push하지 않음
- Pull Request를 통해 변경

프로젝트 초기 Repository 설정이 완료된 이후에는 Branch Protection을 적용한다.

---

## 12. 작업 단위 기준

```text
Issue
= 구체적인 작업 단위

Branch
= 여러 Issue를 포함할 수 있는 기능 단위

Pull Request
= 하나의 기능 묶음을 main에 통합하는 단위
```

Branch가 너무 오래 유지되어 `main`과 차이가 커지지 않도록 한다.

기능 범위가 커지면 하나의 Branch를 더 작은 기능 Branch로 나눈다.

---

## 13. AI 사용 규칙

- 이해하지 못한 코드를 그대로 Merge하지 않는다.
- 큰 기능 전체를 한 번에 생성하지 않는다.
- 작은 기능 단위로 구현하고 확인한다.
- 담당자는 자신의 코드 동작을 설명할 수 있어야 한다.
- 정상 Case와 Error Case를 테스트한다.
- 핵심 로직은 다른 팀원의 Review를 받는다.

---

# Workflow Summary

```text
Issue 생성
    ↓
최신 main에서 Branch 생성
    ↓
구현 / Commit
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
