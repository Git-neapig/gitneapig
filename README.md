# GitneaPig

GitneaPig is an interactive Git and collaboration learning application prepared for the 42 curriculum. The exact curriculum attribution line, participant logins, roles and individual contributions must be supplied and confirmed by the team before submission; they are not invented here.

## Run With Docker

Requirements: Docker Desktop or Docker Engine with Compose, and Node.js 22 with pnpm 10.34.5 for the optional environment generator.

```sh
corepack enable
corepack prepare pnpm@10.34.5 --activate
pnpm env:init
docker compose up --build
```

`env:init` creates `.env` with independently generated database, session and API-key secrets, permissions `0600`, and never overwrites an existing file. Alternatively, configure `.env` from `.env.example` and replace all example secrets. Production refuses example session/API-key secrets. Use URL-safe database credentials, or URL-encode them in a custom connection URL.

Open [GitneaPig](https://localhost:8443). The initial stack creates PostgreSQL, applies migrations, seeds the localized catalogs, starts NestJS and serves the built frontend through Nginx HTTPS. Only loopback HTTP/HTTPS ports are published; PostgreSQL and NestJS are private to the Compose network. HTTP on port 8080 redirects to HTTPS. The defaults are for local evaluation, not public hosting.

A 30-day local self-signed certificate is generated on first startup. A self-signed certificate is encrypted but is not automatically trusted by browsers: review and trust the local certificate yourself, or mount a certificate issued by a trusted CA. Do not disable TLS verification for public deployment. The certificate files are `/etc/nginx/tls/fullchain.pem` and `/etc/nginx/tls/privkey.pem` in the `tls_data` volume. For a public host, configure `DOCKER_APP_ORIGIN`, ports, `TLS_HOST`, a trusted certificate and the matching 42 callback URL.

Named volumes retain the database, avatars and TLS files across container replacement. `docker compose down` retains them; `docker compose down -v` permanently destroys them and should not be used on data you need.

## Local Development

```sh
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm build
pnpm dev
```

Configure `.env` with a running PostgreSQL database before migration. Backend tools load the repository-root `.env`; exported environment variables take precedence. The frontend defaults to [127.0.0.1:5173](http://127.0.0.1:5173) and proxies `/api` and `/uploads` to NestJS on port 3000. `APP_ORIGIN` must exactly match the browser's origin, including scheme, hostname and port. If port 5173 is occupied, use `pnpm --filter @gitneapig/frontend dev --port 5174` and start the backend with `APP_ORIGIN=http://127.0.0.1:5174`. Rebuild shared packages after editing their source.

Backend development uses TypeScript compilation before Node execution so Nest dependency injection receives decorator metadata. Nodemon polling avoids file-watcher limits. The simulator never runs the host Git binary or a shell.

### 42 OAuth

Register a 42 application and set `OAUTH_42_CLIENT_ID`, `OAUTH_42_CLIENT_SECRET` and `OAUTH_42_REDIRECT_URI` to the application's exact HTTPS callback. The default Docker callback is `https://localhost:8443/api/v1/auth/42/callback`.

The implementation exchanges a real authorization code with `api.intra.42.fr`, verifies state, and identifies accounts only by the stable 42 subject. Email is never used to auto-link accounts. A new account is created only after a signed, short-lived onboarding context is completed. Real provider verification requires team-owned credentials; there is no demo login or fake OAuth provider in production.

## Features

- **Learn:** five localized, six-stage lessons with stage bookmarks, automatic Result after actual practice success, save-only retry and read-only solutions for completed lessons. Guest access to lessons 1-3 and member-only lessons 4-5 remain. Temporary attempts reset on re-entry; saved progress and rewards remain.
- **Practice:** one Free Sandbox with file editing, terminal history, Git graph and repository state. Refresh clears the attempt and draft. No required goal, XP or guide tab. Other seed definitions remain available to shared learning scenarios; legacy mode links open Free Sandbox without executing commands.
- **Quests:** five sequential collaboration scenarios with real repository/event/PR/review/issue transitions. Explicit `hint` delivers three progressive teammate hints per objective. Actual success opens the result automatically.
- **Daily Challenge:** direct workspace, Seoul-calendar assignments, four hints, automatic results and explicit retry. Member completion survives another device login; guest completion is tab-session-only and never imported. Repeat completion never pays again.
- **Reference:** authenticated command details with supported syntax/options, contextual examples and before/after descriptions, mistakes, related learning, filters and pagination. Each example copies independently; Practice links never execute a command.
- **Accounts:** Argon2id email/password authentication, 8-hour HttpOnly sessions, profile edits, three languages, preset/default/custom avatars, friendship requests and online status.
- **Progress:** transactional fixed XP, derived levels, streaks, ten achievements and a recent-activity projection. Repeat completion does not grant more XP.
- **Bookmarks/API keys:** private bookmark management, one-time display of random API keys, soft revocation and five owner-scoped public bookmark endpoints.
- **PWA:** install/update controls, cached app resources and public lessons, offline real Practice, and explicit exclusion of private API data from persistent caches.

## Architecture

| Path | Responsibility |
| --- | --- |
| `apps/frontend` | React 19, Vite, React Router, Tailwind, i18next, Workbox PWA and approved mascot assets |
| `apps/backend` | NestJS 11 with Express, validation, auth, profile/social APIs, content, rewards, Prisma and OpenAPI |
| `packages/shared` | Framework-independent DTOs, localized content contracts, 12-command metadata and level calculation |
| `packages/simulator` | Pure deterministic repository state transitions, parser, snapshots, diff, merge, remotes and Quest runtime |
| `infra` | Container startup, Nginx HTTPS and local certificate generation |
| `tests/e2e` | Real-browser guest/member, collaboration, layout and offline flows |
| `docs/spec` | Authoritative product, data, design and acceptance specifications |

`node-diff3` performs line-based three-way merging; Git state, ancestry, pointers, staging and remote behavior remain explicitly modeled by the simulator. `sharp` decodes and re-encodes avatar bytes before UUID-named files are saved. The approved PNG identities are reused unchanged; the wordmark is real UI text. Home's scripted presentation terminal is deliberately separate from the interactive simulator.

### Persistent Data

Prisma defines 15 models in `apps/backend/prisma/schema.prisma`:

| Models | Relationships and important fields |
| --- | --- |
| `User` | UUID identity; normalized unique email/nickname; optional unique 42 subject; password hash; avatar source/path; language; integer XP/streak; timestamps |
| `Lesson`, `LessonProgress` | Stable content ID/slug/order, localized JSONB and fixed reward; composite user/lesson progress with stage 0-5 and completion/reward flags |
| `Quest`, `QuestProgress` | Localized JSONB scenario and prerequisites; composite user/quest completion |
| `DailyChallengeTemplate`, `DailyChallenge`, `DailyChallengeProgress` | Template pool, unique date assignment and unique user/date completion with matching challenge/date foreign key |
| `Achievement`, `UserAchievement` | Ten fixed rules and unique user/achievement unlocks |
| `Bookmark` | Unique owner/type/target/stage; six Learn stages, whole Quest/Command targets; target existence is validated by the service |
| `Friendship` | Unique canonical UUID pair, requester must be one endpoint, pending/accepted state |
| `ApiKey` | Owner, label, HMAC-SHA256 digest, creation/revocation timestamps; never the raw key |
| `CommandReference` | Authenticated localized detail and related content IDs |

SQL constraints supplement Prisma's unique and foreign-key constraints. Completion runs in a serializable transaction with at most three attempts for retryable races. Rewards, streak and newly unlocked achievements commit together. Levels and recent activity are derived rather than independently stored.

## Public API

[Interactive OpenAPI documentation](https://localhost:8443/api/docs) describes authentication and responses.

Evaluation path: **Profile dropdown → Bookmark Integration (북마크 연동) → Create API key → API documentation and request demonstration**.
The screen retains **Create API key** and **Issued API keys** labels. The label identifies a purpose, for example personal learning notes, not one particular bookmark. The full key appears only immediately after creation. On-site bookmarks do not need keys; external programs use this secret to access only its owner's bookmarks. No third-party service integration is implied.

For a first demonstration, run the following in your computer's terminal with Python 3. Enter the key at the hidden prompt, never in a URL, screenshot, source file or logged command. This uses the actual default local HTTPS service. If your service runs at another address, replace only `https://localhost:8443` with the trusted origin shown in your browser. The request demonstration lives in this documentation; the integration screen contains only the introduction and key management. Trust the local certificate first (or use Python's `SSL_CERT_FILE` with its public certificate); do not disable verification.

```sh
python3 - <<'PY'
import getpass, json, urllib.request, urllib.error
key = getpass.getpass("GitneaPig API key: ")
request = urllib.request.Request(
    "https://localhost:8443/api/v1/public/bookmarks",
    headers={"X-API-Key": key},
)
try:
    with urllib.request.urlopen(request) as response:
        print(json.dumps(json.load(response), ensure_ascii=False, indent=2))
except urllib.error.HTTPError as error:
    print("HTTP", error.code)
PY
```

An empty account returns `items: []`, `page: 1`, `pageSize: 12`, `totalItems: 0`, `totalPages: 0`; otherwise items contain bookmark IDs, target type/ID, stage and creation time. Main errors: 400 invalid target/stage, 401 missing/invalid/revoked key, 404 missing or another owner's item, 409 duplicate, 429 rate limit (wait for `Retry-After`). Never print the request headers or key while troubleshooting.

| Method | Path | Action |
| --- | --- | --- |
| GET | `/api/v1/public/bookmarks` | Paginated owner-only list |
| GET | `/api/v1/public/bookmarks/:id` | Owner-only item |
| POST | `/api/v1/public/bookmarks` | Create `{ "targetType": "LESSON", "targetId": "lesson-1", "stage": "CONCEPT" }` |
| PUT | `/api/v1/public/bookmarks/:id` | Replace the target |
| DELETE | `/api/v1/public/bookmarks/:id` | Delete an owner-only item |

Public routes authenticate exclusively through `X-API-Key`; session cookies are ignored. Each valid key has a 60-request/60-second fixed window, with `429` and `Retry-After` on excess requests. Revoked keys remain recorded but cannot authenticate. The in-memory rate limiter assumes the single backend instance in this Compose stack; horizontal replicas need a shared limiter before deployment.

Internal unsafe routes require the exact configured `Origin`, including sign-up/login, onboarding and API-key management. Private responses use `Cache-Control: no-store`. API keys are HMACed with a separate secret; changing that secret invalidates existing keys. Completion deliberately follows the approved authenticated completion-declaration policy, not server-side execution of the user's simulator transcript.

Bookmark lists accept optional `targetType=LESSON`, `QUEST`, or `COMMAND`; pagination and totals apply to that category. Omitting it preserves the all-bookmarks response.

Omitted/null Learn stage defaults to SITUATION. Quest/Command have null stages and reject non-null stages. Existing Learn bookmarks migrate to SITUATION without changing IDs or creation dates. No reset is needed; migrations are additive.

Demonstrate all five methods with a generated key: create one stage bookmark, list/get it, PUT another stage and DELETE it. Use a second account's key to confirm owner isolation (404 for another owner's ID), omit the key to confirm 401, and revoke the original key to confirm 401. The real HTTP/DB suite also verifies the 60-per-60-second boundary and 429. These are validation steps, not a claim that manually opening API docs proves them.

## Verification

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:integration
pnpm exec playwright install chromium firefox
pnpm exec playwright install msedge
pnpm test:e2e
```

Integration tests require `TEST_DATABASE_URL` pointing to a migrated, dedicated database whose name ends in `_test`. Apply migrations with `DATABASE_URL="$TEST_DATABASE_URL" pnpm db:migrate` first. They create real accounts and remove only those accounts after the suite. E2E member tests similarly clean up their own generated accounts; `DATABASE_URL` must match the tested backend. Do not run these tests against public production.

Browser tests expect a running frontend/backend at `E2E_BASE_URL` (default `http://127.0.0.1:5173`). Production offline tests are enabled separately:

```sh
pnpm --filter @gitneapig/frontend preview --port 4173
E2E_BASE_URL=http://127.0.0.1:4173 E2E_PWA=1 \
  pnpm exec playwright test tests/e2e/offline.spec.ts --project=chromium
```

For the local self-signed Docker stack, use `E2E_ALLOW_SELF_SIGNED=1` only with a loopback hostname and `E2E_CA_CERT` pointing to its public certificate file. Chrome/Chromium service-worker tests pin that certificate's public key without modifying system trust. Member cleanup inside Docker additionally requires `E2E_DOCKER_PROJECT` and optionally `E2E_DOCKER_ENV_FILE`. The local certificate was separately verified using `curl --cacert`; local automated allowances are not evidence of public certificate trust.

`node scripts/verify-deployment.mjs --project NAME --env-file PATH --certificate PATH` checks HTTPS/security/OpenAPI and intentionally recreates that local evaluation stack's backend/frontend containers to verify retained database/avatar data and replacement cleanup. Run it separately from browser tests, never against production. See the evidence document for complete invocations.

See [implementation progress](docs/implementation/IMPLEMENTATION_PLAN.md) and [acceptance evidence](docs/implementation/ACCEPTANCE_EVIDENCE.md) for exact results, remaining gates and the evaluation walkthrough. Screenshots and traces are generated outside the repository under `/tmp` by default.

The [2026-09-10 revision log](docs/implementation/UI_UX_REVISION.md) supersedes earlier flow/test counts for this UI/UX update. The [approved revision specification](docs/spec/UI_UX_REVISION_2026-09-10.md) and [Learn review](docs/implementation/LEARN_CONTENT_REVIEW.md) record the scope and approved goal changes. [42 setup](docs/implementation/OAUTH_42_SETUP.md) documents the deferred real-provider verification.

## Evaluation Modules

The approved score table lists **12 named modules totaling 16 planned points**. Acceptance section 37 separately requests 13 entries; this discrepancy requires team clarification. No additional module or earned score is invented to make the counts match.

| Module | Size / Points | Implementation evidence |
| --- | --- | --- |
| Frontend + Backend Framework | Major / 2 | React application and NestJS/Express services |
| ORM | Minor / 1 | Prisma models, migrations, constraints and seed |
| Public API | Major / 2 | Five documented, API-key-only bookmark operations |
| Advanced Search | Minor / 1 | Reference search/filter/sort/pagination and friend search |
| Custom Design System | Minor / 1 | Shared tokens and reusable accessible controls |
| PWA | Minor / 1 | Prompted updates, offline simulator/public lessons and cache exclusions |
| Multiple Languages | Minor / 1 | Korean, English and Japanese UI and domain content |
| Additional Browsers | Minor / 1 | Separate Chrome, Chromium, Firefox and mobile projects; Edge verification still needs installation |
| Standard User Management | Major / 2 | Auth, profile, persistent avatars, friends and presence |
| 42 OAuth | Minor / 1 | Real provider integration, state and onboarding; live credentials still required |
| Gamification | Minor / 1 | Persistent XP, derived levels, streaks and achievements |
| Custom Git Simulator | Major / 2 | Deterministic parser/state machine, snapshot deltas, ancestry, three-way conflicts, remote separation and scenario event runtime |

The simulator's complexity is in meaningful state transitions rather than predetermined answers: alternative valid command sequences work, file edits can occur between staging and commit, merges preserve both parents, conflicts must be resolved and staged, and remote objects/tracking/upstream pointers are separate. Tests verify determinism and inputs remain immutable. This is evidence for evaluator review, not a guarantee that a module will receive points.

## Team (Complete Manually Before Submission)

This section is intentionally a template. After implementation, the team will finalize it from each member's actual contribution. The unfilled fields do not block implementation. Do not invent 42 IDs, role assignments, contributions, collaboration tools or meeting practices.

### Members and Contributions

Add one row per actual member. Replace the marked fields manually before submission.

| Member / 42 ID | Actual role(s) and responsibilities | Implemented features / modules / components | Contribution evidence and challenges addressed |
| --- | --- | --- | --- |
| [TEAM TO COMPLETE] | [TEAM TO COMPLETE] | [TEAM TO COMPLETE] | [TEAM TO COMPLETE: actual commits/PRs and work performed] |

Required role coverage from the specification: Product Owner, Project Manager / Scrum Master, Tech Lead / Architect and Developers. This is a checklist of required coverage, not a claim that roles have been assigned. Record actual feature/module ownership in the table above.

### Collaboration and Project Management

| Topic | Actual team practice |
| --- | --- |
| Work organization and task distribution | [TEAM TO COMPLETE] |
| Collaboration / task-management tools | [TEAM TO COMPLETE] |
| Communication channels | [TEAM TO COMPLETE] |
| Meetings and working process | [TEAM TO COMPLETE] |

All members must review and be able to explain the code. Generated implementation is not evidence of individual human contribution or commits.

## Release Preparation

This implementation was assisted by Codex for code, content, tests, documentation and verification. No team contributions are attributed without confirmation. The original subject v21.1 file was not provided, so exact curriculum wording and final subject compliance remain a manual gate.

### Privacy Operating Values

The approved operator is **GitneaPig Team**. Public operator/contact values and all retention settings are centralized in `apps/frontend/src/lib/privacy-policy.ts` and rendered in Korean, English and Japanese. Change that source, update its policy date, then rebuild/redeploy the frontend; the PWA's normal update flow also applies.

The privacy contact is deliberately `privacy@PLACEHOLDER`, visibly marked as uncreated and not linked as a working email address. Replace it with a real dedicated GitneaPig team email, never a member's personal email, before production deployment and final submission. This missing address does not block the current implementation phase. A valid replacement automatically becomes a contact link without changing translated pages.

Approved retention: account/profile and related learning/social data remain while the account is active; uploaded avatars remain while active or until replaced/deleted; API-key metadata follows account lifecycle and revocation state; deleted-account data is permanently deleted within 30 days of confirmed deletion; operational/security logs are retained for up to 30 days. The source file is authoritative for these operating values.

Before production/submission:

- [ ] Create the dedicated team mailbox, replace the placeholder and verify that privacy questions/requests can be received.
- [ ] Verify the operator's confirmed-account-deletion procedure removes associated database records and uploaded files within the approved deadline, including any deployed backups/exports. The app does not expose a self-service account-deletion button or scheduled deletion job.
- [ ] Configure and verify time-based retention for operational/security logs at the deployment host/log collector. The current Compose stdout/stderr logs do not enforce a maximum age; size-based rotation alone would not establish the approved time limit.
- [ ] Rebuild, verify all three privacy translations and refresh the installed PWA before final release.

These are release operating checks, not missing team information or reasons to pause implementation. Displaying the approved policy does not itself implement automated deletion or log retention.

## Known Scope and Limitations

- The UI/UX revision's production browser run found one Firefox timing issue: a late PWA update notice shifts the State tab during a click. Its layout remedy is awaiting user approval; the revision is not declared fully verified. Exact Figma1 parity and clean mascot background derivatives also remain open.
- The simulator is an educational subset of Git, not a host filesystem or full Git implementation. It has no Git binary, network remote, hooks, shell, rebase, stash, binary-file merging or arbitrary command execution. Commit IDs are deterministic `cN` values, not SHA object hashes; merge-base selection targets the authored acyclic exercises rather than all criss-cross histories.
- 42 provider sign-in and evaluator/team requirements remain unverified without external input. Browser installation, certificate trust and PWA installation UI vary by operating system.
- Approved mascot PNGs include baked backgrounds/checkerboard pixels. These are preserved, not silently redrawn or treated as layout instructions.
- Browser in-memory state is scoped to the current account. Protected lessons, Reference, profiles, friends, bookmarks, API keys and private progress are not shipped as cached content or stored in persistent service-worker caches.
- A complete public release is not claimed until the remaining acceptance gates have been satisfied.

## Primary References

[React](https://react.dev/), [NestJS](https://docs.nestjs.com/), [Prisma](https://www.prisma.io/docs/), [Git](https://git-scm.com/docs), [42 API](https://api.intra.42.fr/apidoc), [Vite PWA](https://vite-pwa-org.netlify.app/guide/inject-manifest), [Playwright](https://playwright.dev/).
