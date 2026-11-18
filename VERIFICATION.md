# Verification record

## Native course materials, 17 November 2026

- `npm run course:import` imports 708 native documents, 205 visible files, and inline illustrations. The manifest also indexes 534 official streaming variants and 18 external items. Eleven external items are Google Slides presentations with local PDF alternatives; the other seven are two ZIPs and five database files above the 24 MiB file limit. No required lecture notes, assignments, sections, or shorts are missing.
- `npm test`: 72 unit/backend/corpus tests pass. Corpus checks validate required coverage, file hashes and sizes, sanitized markup, local document links, and local illustration/download targets. Existing private state and authentication tests pass.
- `npm run test:course-import`: six importer tests pass, including executable-markup removal, source query normalization, links and headings, captions, and rejection of missing required documents before manifest publication.
- `npx playwright test tests/learning.spec.ts tests/materials.spec.ts`: seven browser scenarios pass without page errors. The actual shipped C notes render with code and local images at desktop and 390px mobile width. Other scenarios cover cross-document navigation, reloads, section anchors, provider switching, local PDFs/downloads, and the stale chapter-selection regression. API fixtures isolate these checks from the learner's saved progress.
- `npm run typecheck` and `git diff --check` pass. `npm run deploy:check` builds the production Worker and reads 1,119 static assets successfully. The build artifact contains no copied `.dev.vars`. No deployment was performed.
- Real-corpus screenshots are `test-results/native-c-notes-desktop.png` and `test-results/native-c-notes-mobile.png`. The existing learning verification below records the earlier external-link implementation; this native import supersedes it.
- A live browser check played the official C lecture's 360p MP4 inside the app and observed playback advance beyond one second. The YouTube embed loaded the correct lecture thumbnail and controls, but playback did not advance during the automated check. YouTube playback remains unverified. Evidence is in `.audit/live-media-result.json`, `.audit/live-media-mp4.png`, and `.audit/live-media-youtube.png`. These checks did not record watched progress.

## Learning workspace, 17 November 2026

- `npm run check`: build, typecheck, and 69 unit/backend tests pass, including old snapshot compatibility, lesson completion prerequisites, separate course results, binary search termination, and an actual isolated D1 round-trip for lesson notes/checkpoints.
- `npx playwright test tests/learning.spec.ts`: three isolated browser scenarios pass. They cover keyboard interaction, all seven labs, invalid/correct checkpoints, exercise gating, lesson completion/reopening, refresh persistence, local draft recovery, official chapter selection, lazy lecture embeds, manual links/search, and mobile width. No page errors. This suite mocks only its own API requests and does not reset the user’s local study state. Video behavior in these scenarios uses an isolated iframe fixture; it does not prove streaming playback.
- Desktop and mobile screenshots: `test-results/learn-desktop.png`, `test-results/learn-mobile.png`, `test-results/resources-mobile.png`.
- Shared browser inspection of the authenticated animations.dev lesson confirmed lesson navigation, a constrained reader, video, editor/preview exercises, hints, and explicit completion. Its content was not copied and its course progress was not changed.
- Both `manual.cs50.io` and `cs50.dev` returned `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-ancestors 'self'`. They are linked externally. The eleven lecture IDs came from the official 2026 week pages’ video iframes; all eleven notes URLs returned 200. The gradebook and workspace links match the official course navigation.
- Production remains undeployed. Existing saved snapshots need no database migration for the optional `learning` field.
- The embedded lecture uses Harvard’s `video.cs50.io` player, which returned CSP `frame-ancestors *`. Its lecture thumbnail loaded inside the local app. A raw YouTube privacy-domain embed reported video unavailable and was replaced. The later live playback check timed out waiting for the play control; streaming playback remains unverified. A separate video link and Harvard’s week page provide fallback access. Screenshot: `.audit/lecture-player.png`.
- After the T3 restart, `npm run deploy:check`, `npm run typecheck`, `npm test`, and all three learning browser scenarios passed again. Production packaging contains no copied `.dev.vars`. No production upload was performed.

Verified on 16 November 2026 in the Windows workspace with Node 24.15.0.

## Passing checks

- `npm run check` builds the TanStack client and Cloudflare Worker, checks TypeScript, and passes 58 tests across five files.
- `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` passes.
- `npm run test:e2e` passes the complete desktop and mobile browser workflow against the local Worker-backed development app.
- `npm run deploy:check` builds the explicit production environment and passes Wrangler's upload dry run. The configured owner, origin, sender, and D1 binding match the production brief.
- `npm run db:remote` applies migration 0001 to the new APAC D1 database. No existing application database was modified.
- Cloudflare reports Email Sending enabled for `cs50track.dhaf.in`. Public DNS resolves its three bounce MX records and its SPF, DKIM, and DMARC records.
- The production packaging script removes the copied local `.dev.vars` fixture from the deployment artifact.

## Browser behavior exercised

The browser suite signs in through the captured local link and confirmation page. It checks resource persistence after refresh, submitted versus passed results, deletion and undo, selecting a study task, timer pause and resume, finishing without inferred assignment progress, switching tasks, stale-heartbeat recovery, manual date and time correction, and keeping form input after a failed save.

It also drops the response from a successful write. The client retries with the same operation ID, and the saved session appears once. The suite accepts Saturday catch-up, changes availability without losing recovery work, checks plan history, navigates at a 390-pixel viewport without horizontal page overflow, and signs out. It resets the local demo study state after success.

The backend tests use real isolated Miniflare D1 databases. They cover owner-only login, scanner-safe confirmation, single-use and expired links, session invalidation, origin checks, rate limits, production failure modes, state validation, version conflicts, and idempotent writes.

## Evidence

The reproducible browser check is [tests/study.spec.ts](tests/study.spec.ts). Desktop and mobile captures from the exercised state are in `.audit/today-desktop.png` and `.audit/today-mobile.png`. Playwright traces remain local under `test-results/` when a check fails.

The Model the Domain principle shaped the session state machine and versioned plan data. Prove It Works required the browser workflow and real D1 tests before calling the implementation complete. The integration review repaired availability regeneration, optional-resource blocking, task selection, timer recovery, and plan-history bounds.

## Operational limits

The application has not been published. Live email delivery and the custom-domain route require verification after deployment. No email was sent to the owner during this build. No destination address was verified in the inspected Cloudflare account.

Progress is recorded manually and does not synchronize with Harvard's gradebook. The course catalog is pinned to CS50x 2026. The timer uses heartbeats to estimate a safe recovery point and lets the learner correct the recorded duration. The private snapshot API limits individual saves to 1 MB and retains up to 100 plan versions within that request budget.

## Local login bypass, 17 November 2026

Local development now opens the configured owner's dashboard without a login cookie. Bypass requires AUTH_MODE=development, a loopback request host, and valid local configuration. Set LOCAL_AUTH_BYPASS=false to exercise email-link login locally. The production mode never bypasses authentication, even if LOCAL_AUTH_BYPASS=true is present.

The typecheck and all 60 unit/backend tests pass. Fresh browser contexts opened the dashboard directly on both 127.0.0.1 and localhost and retained access after refresh. This targeted browser check did not reset study data. The full study browser scenario also supports the bypass or explicit email-link mode.
