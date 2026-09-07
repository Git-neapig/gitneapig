# GitneaPig — Codex Implementation Start Prompt

You are implementing the GitneaPig ft_transcendence web application in this repository.

Before modifying code, read these four files completely:

1. `docs/spec/MASTER_SPEC.md`
2. `docs/spec/DATA_CONTRACTS.md`
3. `docs/spec/DESIGN_SYSTEM.md`
4. `docs/spec/ACCEPTANCE_CHECKLIST.md`

## Source-of-truth priority

Use the following priority when information overlaps:

```text
Product behavior and user flows
→ MASTER_SPEC.md

Data models, API contracts, persistence, simulator behavior, security and concurrency
→ DATA_CONTRACTS.md

Visual system, responsive behavior, reusable components and UI interaction details
→ DESIGN_SYSTEM.md

Completion and verification criteria
→ ACCEPTANCE_CHECKLIST.md

```

Do not redesign the product, change the selected modules, replace the technology stack, or add unrelated features.

Implement the UI from `DESIGN_SYSTEM.md` and the functional specifications.

## Required stack

Use the stack defined in the specifications, including:

- TypeScript
- React + Vite
- React Router
- Tailwind CSS
- i18next / react-i18next
- vite-plugin-pwa
- NestJS 11 + Express Adapter
- PostgreSQL
- Prisma
- Node.js 22
- pnpm workspace
- Vitest
- Jest
- Playwright
- Docker Compose
- Nginx + HTTPS

Use the repository structure and shared-package boundaries defined in the specifications.

## Working rules

1. Inspect the existing repository before creating or replacing files.
2. Preserve existing work that is compatible with the specifications.
3. Do not create placeholder-only pages, fake APIs, fake persistence, scripted simulator responses, or TODO implementations and call them complete.
4. Do not use the real shell or Git binary for the virtual Git simulator. Implement the deterministic pure TypeScript simulator described in `DATA_CONTRACTS.md`.
5. Reuse the same simulator engine in Learn Practice, Practice, Quest, and Daily Challenge.
6. Implement reusable design-system components before duplicating page-specific UI.
7. Keep authenticated/private data out of persistent PWA caches.
8. Enforce validation, authorization, ownership, reward idempotency, and concurrency rules on the backend.
9. All user-facing content required by the specification must support Korean, English, and Japanese.
10. Do not silently omit difficult features. If a requirement cannot be completed, record it explicitly as incomplete rather than replacing it with a mock.

When the specification does not dictate a low-level implementation detail, choose the simplest maintainable solution that satisfies all four documents. Do not invent new product behavior.

## Implementation process

First, inspect the repository and create:

`docs/implementation/IMPLEMENTATION_PLAN.md`

The plan must:

- describe the current repository state;
- identify reusable existing code;
- break implementation into dependency-ordered phases;
- map each phase to relevant sections of `ACCEPTANCE_CHECKLIST.md`;
- include database/migration/seed work;
- include simulator work;
- include frontend/backend integration;
- include automated tests;
- include Docker/HTTPS/PWA/browser validation;
- include final README/evaluation work.

Use approximately this dependency order unless the existing repository strongly requires a small adjustment:

```text
Phase 0  Repository / pnpm workspace / tooling foundation
Phase 1  Shared contracts + design tokens + reusable UI primitives
Phase 2  Pure TypeScript Git simulator + unit tests
Phase 3  Prisma schema / migrations / seeds
Phase 4  NestJS foundation + auth + 42 OAuth + security
Phase 5  User/profile/avatar/friends/bookmarks/API keys
Phase 6  Learn + Practice
Phase 7  Quest + Daily Challenge
Phase 8  Reference + advanced search + Public API
Phase 9  XP/level/streak/achievements integration
Phase 10 Localization + responsive polish + accessibility
Phase 11 PWA/offline/cache rules
Phase 12 Docker Compose + Nginx + HTTPS
Phase 13 Integration/E2E/concurrency/browser tests
Phase 14 README + final acceptance/evaluation validation
```

After writing the plan, **continue implementing immediately**. Do not stop merely to ask for approval between phases.

Complete phases in dependency order. After each phase:

- run the relevant tests;
- run type-check/lint/build where applicable;
- fix failures before moving on;
- update `docs/implementation/IMPLEMENTATION_PLAN.md` with actual completion status and any necessary implementation notes.

Do not mark a phase complete only because routes or visual shells exist. A feature is complete only when its UI, interaction, state/persistence, authorization/error behavior, and relevant tests work as required.

## Acceptance-driven completion

Use `docs/spec/ACCEPTANCE_CHECKLIST.md` continuously during implementation.

Near the end, perform a full repository-wide verification against every applicable checklist section.

Pay particular attention to:

- deterministic simulator state and commit IDs;
- `git diff` vs `git diff --staged`;
- merge/conflict/remote behavior;
- Learn's six-stage teaching experience and backward navigation;
- Terminal internal scrolling;
- Practice having no mandatory objective;
- Quest terminal freedom and state/event-based completion;
- Daily Challenge Intro → Workspace → Completed flow;
- exact fixed XP/level/Achievement seed rules;
- 42 OAuth onboarding and no email-based auto-linking;
- avatar named-volume persistence and replacement cleanup;
- canonical friendship pair/concurrency;
- soft-revoked API keys;
- Public API security/rate limiting/docs;
- ko/en/ja completeness;
- PWA private-cache exclusions;
- Chrome/Firefox/Edge behavior;
- Privacy/Terms;
- one-command Docker startup;
- clean browser console;
- README/module evidence.

## Final report

When implementation is genuinely complete, provide a concise report containing:

1. what was implemented;
2. important architectural decisions made only where the spec left low-level freedom;
3. commands used to build/run/test;
4. automated test results;
5. any acceptance items that still require manual verification;
6. any known incomplete requirement, if one remains.

Do not claim the project is complete while any known required feature is a stub, placeholder, mock, or failing test.
