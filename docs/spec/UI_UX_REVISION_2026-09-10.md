# Approved UI/UX Revision - 2026-09-10

This addendum records the user's approved revision and takes precedence over
conflicting earlier text in MASTER_SPEC, DATA_CONTRACTS, DESIGN_SYSTEM and
ACCEPTANCE_CHECKLIST, only for the scope below. All other rules remain unchanged.
An approved requirement is not evidence of implementation or verification.
See [revision evidence](../implementation/UI_UX_REVISION.md) for actual status.

## Product and Lifecycle

- Learn retains six stages. Whole lesson cards are keyboard-accessible links;
  separate Start/All Lessons controls are removed. Completed progress fills 100%.
- Actual practice success is latched together with the simulator state transition.
  It triggers Result navigation and completion persistence once per attempt.
  Result deep links, bookmarks and stage navigation alone never submit completion.
- Persistence failure preserves the passed attempt and shows a separate save
  failure with a save-only retry. Reset and Result navigation cannot cancel a
  pending save. Existing server ownership, prerequisites and fixed idempotent
  rewards remain authoritative; this does not introduce transcript verification.
- Leaving/re-entering a lesson resets its temporary simulator. Account completion
  and rewards remain. Reset clears the attempt, terminal history and draft input.
  Passed users can view read-only sample solutions with reasons; viewing never
  executes commands or changes state/rewards. Guest visibility follows the existing
  current-tab completion policy. Samples are not claimed to be unique solutions.
- Learn Result: Back / Next Lesson; last lesson: Back / Back to Learn.
  Quest Result: Back / Next Quest; last quest: Back / Back to Quests.
  Authentication and prerequisite conditions still apply to next content.
- Independent Practice becomes one Free Sandbox, without a command-guide tab.
  Legacy mode/command URLs open Free Sandbox without executing commands. Shared
  BASIC/BRANCH/MERGE/REMOTE seed definitions are retained for other consumers.
- Quest cards are links when unlocked. Every objective has three ordered hints:
  goal reminder, strategy and concrete solution example. An explicit `hint` sends
  a teammate message; blank input does nothing. A new objective starts at hint one.
  Hints never run commands or manipulate completion. Completing all conditions
  opens Quest Complete automatically and submits the idempotent reward request.
- Daily opens its situation, terminal and graph immediately; no Intro Start step.
  Success opens the completed view. Same-day revisits show completion first, with
  an explicit retry that does not erase records or grant another reward.
  Members read server completion across devices. Guests use the current tab's
  session only; guest records are never imported into a member account.
- Reference remains authenticated and covers usage, supported syntax/options,
  contextual examples with before/after descriptions, mistakes and related lessons.
  Each copy control copies only its own example. Real Git's additional features
  are distinguished from the supported educational subset.

## Approved Learn Corrections

The user approved the recommendations in
[the complete review table](../implementation/LEARN_CONTENT_REVIEW.md).

| Lesson | Approved condition/content |
| --- | --- |
| 01 | On main, a reachable commit with the exact message `First record` contains README.md. Other files/messages alone cannot pass. |
| 02 | Stage only the modified README.md, not notes.txt or a README deletion. Staging, not committing, is the goal; commit is explicitly follow-up learning. |
| 03 | Keep creation and switching to feature/login; allow branch+switch, switch -c and checkout -b. |
| 04 | On main, merge completion must include the prepared feature commit in main's ancestry. An unrelated merge is insufficient. |
| 05 | Keep publishing local main; allow valid explicit/upstream push forms. |

## Data and API

### Stage Bookmarks

Responses add `stage: LessonStageType | null`. Create/replace requests accept
`stage?: LessonStageType | null`. Both internal and Public API use the same parser.

- LESSON accepts SITUATION, WHY, CONCEPT, COMMAND, PRACTICE, RESULT.
- Omitted/null LESSON stage defaults to SITUATION, including legacy Public API calls.
- QUEST and COMMAND stay whole-content targets; their response stage is null.
  A non-null stage on either is a validation error, never silently ignored.
- DB stage is non-null text: six values for LESSON, empty-string sentinel otherwise.
  A check constraint enforces this and uniqueness becomes
  `(userId, targetType, targetId, stage)`. API clients never receive the sentinel.
- Additive migration maps existing LESSON rows to SITUATION and preserves every
  ID/createdAt. Existing test data must not be reset or arbitrarily deleted.
- Duplicate create/replace remains 409. Ownership, target validation and rate limits
  are unchanged. PUT preserves bookmark ID and createdAt.
- Bookmarks display lesson name plus stage name and open `/learn/:slug?stage=TYPE`.
  Opening Result through that URL does not create progress/rewards.

### Other Additive Contracts

- `GET /api/v1/daily-challenge/:id/progress`: session-authenticated, owner-only,
  no-store response `{challengeId, dateKey, completed, completedAt}`. Absent progress
  returns false/null; no new completion row is created by reading it.
- `LessonPracticeDefinition.solution` adds localized command/reason examples.
- `QuestObjective.hints` adds a three-element localized tuple. Legacy quest-level
  hints may remain in stored content for compatibility but are not the active UI.
- `CommandExample.before` and `.after` are optional localized descriptions, stored
  within existing JSONB examples. They are documentation, not scripted simulator output.
- Simulator adds exact `STAGED_FILES` and `COMMIT_REACHABLE` conditions;
  `COMMIT_EXISTS` accepts optional exact message, snapshot path and branch ancestry.
  Existing callers without those optional fields retain their previous semantics.

## Layout and Interaction

- Only Home uses vertical scroll snap. Fit working panels to available height where
  practical; allow scrolling for long content and small displays, never clip content.
- Use wide desktop panels instead of a centered mobile column. The supplied
  Gitneapig2 Practice screenshot establishes approximately 60/40 terminal/graph,
  goal above the terminal, and Back/Next aligned to the content edges.
- Terminal scroll passes to the page when there is no internal overflow or when
  the active direction reaches a boundary. Interior terminal history scroll stays local.
- File editor label is File name in all languages; safe relative paths remain valid.
  Deleted files leave the current Files list immediately; Git deleted/staging/commit
  behavior remains distinct and functional.
- Profile dropdown supports desktop hover across trigger and menu, keyboard and
  touch operation, outside click and Escape. Uploaded-image deletion resets to the
  default avatar and cleans up the old server file, with visible failure handling.
- Profile dropdown entry is Bookmark Integration / 북마크 연동. Keep Create API key
  and Issued API keys within its screen. Explain external bookmark CRUD, secret keys,
  label purpose, one-time disclosure, safe local-terminal requests, expected results
  and errors. Normal on-site bookmarks do not require a key. Public API stays intact.
- Password remains 8-128 characters; guidance emphasizes the minimum of eight.
- Approved mascot originals remain intact. White-background logo/avatar derivatives
  and a transparent Home mascot are requested, with the mascot inside the decorative
  terminal without obscuring text. Do not claim these assets finished without inspection.
- Figma1 controls the requested reading/result/quest/reference visual targets.
  Missing exact views must be identified, not reconstructed from guesses.

## Revision Acceptance

- Six stage bookmarks, preserved legacy IDs/dates, API defaults, duplicates and deep links.
- Actual-pass-only auto completion; save failure/retry; Back/Reset and no duplicate rewards.
- Approved lesson goals, negative cases, alternative solutions and published solutions.
- Three hints per objective, no blank hint, no state mutation and automatic Quest result.
- Member Daily cross-session persistence, guest isolation, revisit and reward-safe retry.
- Sequential hyphens/Backspace, input/history refresh, immediate file removal,
  per-example copy, wheel boundary handoff, profile menu and server avatar cleanup.
- ko/en/ja and desktop/mobile geometry, actual browser screenshots, console health,
  unit/HTTP integration/E2E/typecheck/lint/build and PWA private-cache rules.
- Video evidence must distinguish observed rendering symptoms from inferred cause;
  another browser's successful input is not proof of the exact native-app fix.

## Deferred Decisions

42 application registration/live OAuth verification is deferred; document setup
without inventing credentials. Session-expiry profile/Learn disagreement is a
follow-up investigation. Keep approved privacy operating values centralized and
the final dedicated team email visibly uncreated until release. README team IDs,
roles, contributions and practices remain manually completed, not invented.
