# CS50 Track notes

## Confirmed intent

- Help the user finish Harvard CS50x in 10 weeks, described as roughly two to three months.
- Build a platform to plan study and track progress.
- Use TanStack and Cloudflare.
- Target domain is `cs50track.dhaf.in`.
- Authenticate with an email login link.
- Start from Week 0 and complete all required work, including the final project.
- Start the study plan on 17 November 2026.
- Use a college-style schedule with SKS as a workload reference.
- The user accepted study after gym at 09:00, Monday through Friday until 13:30 with a 30-minute break, Saturday 09:00 to 11:30 for catch-up, and Sunday off.
- The user accepted using catch-up capacity first and reviewing larger plan and finish-date changes before applying them.
- The first release is private, with login restricted to the user's configured email address.
- Use components from the Agentic UI MCP at `https://mcp.agenticui.dev/mcp`.
- The user invoked poteto-mode, swarm, and loop-me.
- Loop-me makes `workflows/*.md` the source of truth. Resolve the interview before implementing the workflows.

## Visual references

The supplied images show a light interface with goals beside a calendar, a weekly schedule, focus sessions, progress over time, and recommendations for adjusting a plan. These are references. Calendar integrations, AI coaching, distraction detection, focus-quality scores, and music playback are not confirmed requirements.

## Verified course facts

Checked on 16 November 2026 against the official course website.

- CS50x has eleven numbered course weeks, Week 0 through Week 10, followed by a final project. Course weeks and the user's ten calendar weeks are different concepts.
- The course's weekly path is lecture, recommended section and shorts, then problem-set submission. The final project follows the course material.
- An assignment passes at a score of at least 70%. Course completion requires passing every required assignment.
- CS50's gradebook is the source of official assignment results. Watching videos alone does not establish completion.
- The FAQ estimates 10 to 20 hours for each week's problem sets, in addition to lecture time. This is course guidance, not an estimate of this user's pace.
- The current overall course deadline is 30 June 2027 at 23:59 UTC. The user's ten-week target is a personal deadline.
- All ten problem-set pages, the Week 10 page, and the final-project page have now been inspected directly. The assignment catalog and course-derived counting examples are recorded in `workflows/course-progress.md`.
- The catalog has 27 problem-set completion groups plus one final-project group. Alternatives satisfy a group once. This count is derived from the required submissions on the official pages, not from the number of videos or individual alternatives.
- Week 10 has a lecture and final-project link, with no separate problem set. The C Hello, World exercise is preparation, distinct from the submitted Hello, It's Me assignment.
- Final-project submission includes a demonstration video and form, README and code submission, and a gradebook visit to check course completion. The project checklist and passing result need separate tracking.

Sources:

- [How to take CS50x](https://cs50.harvard.edu/x/#how-to-take-this-course).
- [CS50x FAQ](https://cs50.harvard.edu/x/faqs/).
- [CS50x syllabus](https://cs50.harvard.edu/x/syllabus/).

## Historical workspace and tool findings

- The repository initially contains a starter README and an SVG icon. No app code, workflow specs, or AGENTS.md were found in the workspace.
- No pstack model settings file was found at `C:/Users/dopamine/.agents/pstack-models.md`.
- The swarm skill defaults to `grok-4.7-xhigh-fast`. T3 reports the Grok provider disabled. No workers have been launched and no replacement model has been selected.
- A direct MCP initialize request to Agentic UI returned HTTP 401. Component tools and component contents remain unverified. Authentication must be resolved before claiming to use those components.
- Agentic UI's public OAuth resource metadata identifies `https://mcp.agenticui.dev/` as its authorization server and `design-system:read` as a supported scope. This establishes the authentication mechanism, not authenticated access.
- The public `https://agenticui.dev/llms.txt` describes a React and TypeScript design system and points to its component contracts. No component payload has been retrieved or incorporated.
- Cloudflare's current documentation supports TanStack Start on Workers and native email sending, including an email-login-link example. Email Service requires Cloudflare DNS and sender-domain setup. The user's account configuration has not been inspected.
- Cloudflare's email pricing page says arbitrary recipients require Workers Paid. Sending to verified destination addresses is free on all plans. Personal-only versus public access therefore affects email setup.

Technical sources:

- [TanStack Start on Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/).
- [Send emails](https://developers.cloudflare.com/email-service/get-started/send-emails/).
- [Email a login link](https://developers.cloudflare.com/email-service/examples/email-sending/magic-link/).
- [Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/).
- [Agentic UI OAuth resource metadata](https://mcp.agenticui.dev/.well-known/oauth-protected-resource/mcp).
- [Agentic UI agent documentation](https://agenticui.dev/llms.txt).

## Interview round 1, answered in part

1. The user starts at Week 0 and wants all required work completed.
2. The user delegated timetable design and requested a college schedule with SKS. Specific availability was subsequently accepted in round 2.
3. The user selected 17 November as the start date. Finish-date changes were subsequently accepted as proposals for review in round 2.

## Interview round 2, accepted

1. Timetable is Monday through Friday, 09:00 to 13:30 with a 30-minute break, plus Saturday 09:00 to 11:30 for catch-up and Sunday off. The user accepted the after-gym interpretation. This is 22.5 hours of weekly capacity, including reserved catch-up time.
2. Recovery uses catch-up capacity first, then presents a revised plan and finish date for the user to accept.
3. First-release access is private, restricted to the user's email address. There is no public registration.

## SKS terminology

Use SKS only as a study-time budgeting reference. Do not claim CS50 Track grants university credit or that Harvard assigns this SKS value.

Permendiktisaintek 39/2025, Article 15 paragraph 6, defines one SKS as 45 hours per semester. The proposed 225-hour ten-week budget equals five such units of study time. The calculation is `5 * 45 / 10 = 22.5` hours per week. This budget is a recommendation, not a measured estimate of the user's CS50 completion time.

Source is the [official ministry publication](https://lldikti3.kemdiktisaintek.go.id/wp-content/uploads/2025/09/4768-Penyampaian-Salinan-Permendiktisaintek-No-39-Tahun-2025.pdf).

The ten-week calendar starting 17 November 2026 ends on 25 January 2027, inclusive. Completion timing remains a target. The accepted recovery policy presents larger changes for review.

## Historical shared-understanding checkpoint

- A complete first-release proposal is recorded across the workflow specs. The remaining proposed product defaults are manual progress entry, a resumable study timer, in-app weekly reviews, rule-based guidance, Asia/Jakarta as the initial timezone, and the screen layout described in `workflows/daily-study.md`.
- These defaults need the learner's shared-understanding confirmation under loop-me before implementation. The confirmation should cover the complete package, without creating another open-ended interview round.
- The requested swarm needs an available worker-model choice. The original Grok default remains unavailable. Recommend the current Codex model.
- Agentic UI still needs authenticated access. Cloudflare owner-email, sender-domain, and deployment credentials are operational setup inputs. Request credentials through the private secret tool when needed. Do not request secrets in chat.

The timetable, recovery policy, access model, start date, and completion goal are accepted. The full workflow package awaits the shared-understanding checkpoint. No app implementation has started.

## Accepted build and verified implementation, 16 November 2026

The user accepted the complete brief and authorized the swarm to use the current Codex model. The five workflow specs are accepted. The earlier waiting and tool-authentication notes above describe the interview state and are superseded by this section.

The three implementation workers delivered the course catalog/progress rules, scheduling/session rules, and Cloudflare authentication/state API. Their work was integrated into a TanStack Start app with Today, Plan, Progress, and account settings. A separate integration review found schedule regeneration and task-selection defects that are now fixed.

Agentic UI authenticated catalog access succeeded. The installed package is @agentic-ui/design-system 2.3.1. Its actual Button component is used for focus and plan-review actions, with its published styles and document CSS. No credential is stored in project source. The .npmrc file reads AGENTIC_NPM_TOKEN from the installation environment.

Model the Domain shaped the saved snapshot and session state machine. Session IDs stay stable through corrections, and plan versions retain history. Prove It Works required the real login and study workflow to run in Playwright in addition to typechecks and unit tests.

Verified commands are npm run check, npm run test:e2e, and npm run deploy:check. The suite has 58 passing unit/backend tests and one passing browser scenario that covers lecture/result persistence, separate submitted/passed counts, undo, timer pause/resume/finish/switch, stale recovery, time correction, failed-save input retention, lost-successful-response retry idempotency, Saturday recovery, availability previews/history, mobile navigation and width, and sign-out. The browser scenario reports no page errors. Screenshots are kept locally in .audit/today-desktop.png and .audit/today-mobile.png.

Production access is restricted to dhiodhaha@gmail.com, explicitly selected by the user. D1 cs50track was created in APAC with ID 90e11873-1618-4289-9076-95be94be44ce. Migration 0001_initial.sql is applied remotely. Email Sending is enabled for cs50track.dhaf.in. Public DNS resolves its three bounce MX records plus SPF, DKIM, and DMARC. Sender is login@cs50track.dhaf.in. No verification or login email was sent, and no destination address is currently verified. The account's permitted recipient policy and live delivery need confirmation before release.

The production upload dry run passes using the production D1 binding, exact HTTPS origin, and production auth mode. The production helper removes copied local .dev.vars from the build artifact. workers.dev and preview URLs are disabled in production.

No app deployment, git commit, or PR was created. The user said they will deploy. README.md contains the setup and publication commands. Local development remains available at http://127.0.0.1:5173 using the isolated student@localhost.test fixture, reset to Week 0 after verification.

## Local access update, 17 November 2026

The user requested login bypass locally. Development on loopback hosts now uses the configured local owner directly. Production email-link authentication remains required. LOCAL_AUTH_BYPASS=false restores local email-link testing. Typecheck and 60 tests pass; fresh browser checks confirm direct dashboard access and refresh on localhost and 127.0.0.1.

## Learning and resources update, 17 November 2026

The user requested CS50 Manual and CS50.dev integration, bite-sized course material, and inspection of their signed-in animations.dev lesson. Shared-browser authentication initially needed the user to sign in; it then succeeded. Inspection covered the lesson reader, chapter navigation, video, code/preview exercises, hints, and completion controls without copying paid content or changing course progress.

Learn now includes 36 original lessons (three per course unit including the final project), seven concept labs, exercises/checkpoints, saved notes with recoverable local drafts, official material inventories, eleven lecture player embeds, and a searchable C reference. The manual and CS50.dev explicitly prohibit framing, so both open externally. Full notes/specifications remain on Harvard’s site. Lesson progress is independent of official submissions and results.

All 69 unit/backend tests and three isolated learning browser scenarios pass. Production upload dry run passes and removes copied local variables. The live official player loaded a lecture thumbnail; streaming playback could not be confirmed because the play-control check timed out. Video and week-page fallback links are present. The T3 restart closed the previous inspection tabs and stopped the dev server; the server was restarted after checking port 5173 was unused. Production remains undeployed.

## Native material import, 17 November 2026

The user clarified that official materials should live inside CS50Track and that YouTube uploads can play there. A bounded static HTML importer now copies the full permitted course documents rather than sending the learner out to Harvard. It imports 708 documents and 205 visible files, plus illustrations, with per-document attribution, source/date information, and CC BY-NC-SA 4.0 terms. Original lesson and lab progress stays independent of the imported content. The manual and CS50.dev remain separate tools.

The native reader has chapter search, a section table of contents, internal document links, deep-link refresh, PDF viewing, local downloads, and YouTube/CS50 player selection. Official audio/video variants stream directly. Eleven Google Slides presentations remain external alongside local PDF alternatives. Two large source ZIPs and five database files exceed the importer's 24 MiB file limit and are clearly marked source downloads.

An independent read-only review found publication validation ordering, unresolved source query links, and stale lesson/material selection. All three were fixed. Source files now normalize known download/view/highlight query parameters. Scratch and database binaries were added to the bounded download scope. The Windows Cloudflare development runtime holds a file lock on the manifest, so stop the server before rebuilding the import and restart it afterward.

Model the Domain shaped the material manifest and its document/file/stream/external delivery values. Prove It Works required validation of the shipped corpus and a real imported document in the browser. Seventy-two unit/backend/corpus tests, six importer tests, seven learning/material browser scenarios, typecheck, and the production upload dry run pass. No study data was reset and no deployment was performed.

The live C lecture's official 360p MP4 played inside the app and advanced beyond one second. The YouTube embed displayed the correct thumbnail and controls, but playback remained unverified in automation. The reader offers both provider players and indexed direct official streams. Local development is running at http://127.0.0.1:5173 after the completed import.
