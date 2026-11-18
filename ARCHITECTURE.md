# CS50 Track implementation

The accepted workflow specs in `workflows/` define the product.

## Shape

TanStack Start renders the React application. A Cloudflare Worker handles the private auth and state API before forwarding page requests to TanStack Start. Cloudflare D1 stores token digests, sessions, limits, and the owner's versioned study state. Native email delivers login links.

The UI calls a small authenticated state API. The state is a schema-validated snapshot containing a course checklist, appendable assignment attempts, session records, and a versioned plan. A revision check rejects stale writes across devices. Catalog definitions remain static and separate from saved progress.

An event-log architecture would make all corrections replayable but add projection and migration machinery. A versioned owner snapshot makes this private application easier to inspect and recover. Assignment attempts and plan history retain the history the workflows need. Sessions keep explicit timestamps and states.

## Learning workspace

The app has one course page and a full-screen session. Hash routes select the screen: `#home`, `#home/unit/<unitId>`, `#session/<stepId>` and `#recall`. The old `#track` address lands on `#home`. `src/lib/flow.ts` turns `public/course/2026/flow.json` into one ordered list of `Step` values (lecture parts, section, shorts, problems, project milestones) and names the next unfinished one. `src/lib/pace.ts` and `src/lib/recall.ts` hold the pace, weekly record and spaced-recall rules.

The course page (`src/ui/home.tsx`) holds, top to bottom, the Now block (week, deadline, pace, Start button, countdown, and the next unit's sticker card), a stat row (finish date, study time, steps done), "This week" (the steps of the unit that holds the next step, as cards that link to their sessions) and "The course" (twelve unit cards in `course-grid.tsx`). It sits in a container of up to 1144px. Grids hold three columns until a card would be narrower than about 260px, using container queries on `.page`. The header has the brand and plain text actions: Search, Public page (`public-page.tsx`, a dialog) and the menu.

A unit card opens the week sheet (`week-sheet.tsx`) over the page, so the learner never leaves it. `src/ui/sheet.tsx` is the shared modal panel: a native `<dialog>` that slides in from the side, or up from the bottom on a phone, with Tab trapped inside, Escape and a click on the dimmed page closing it, and focus returning to the opener. The sheet's address is `#home/unit/<unitId>`, so Back closes it and a reload reopens it. `route.ts` models it as `{ name: "home"; unitId?: string }`, and `closeUnitSheet` steps back in history when the sheet was opened from the page. The sheet shows the unit's status, stage counts, one Start button for its next unfinished step and every step grouped by stage, and it records problem results and the project result through `ResultForm`.

A session at 1240px and wider adds a left sidebar (`outline.tsx`) listing the current unit's steps by stage, with a control to browse other units and a button to hide it; the choice is kept in localStorage. Below that width the session bar has an Outline button that opens the same list in a sheet from the left. Choosing a step from either goes through the same hash navigation as any other step change, so `enterStep` finishes the running session and starts the next.

A session renders one `Step`. `src/ui/session.tsx` is a small state machine with one `Phase` value (`warmup`, `work`, `closeout`, `next`) and one component per stage: `lecture.tsx` for lecture parts, section and shorts, and `problems.tsx` for problem sets and project milestones. `interactions.tsx` has one view per `Interaction` kind. Week content lives in `src/content/week-N.ts` and is optional: without it a part is video and CS50's notes. Notes are CS50's imported HTML, split at each `<h2>` by `src/ui/notes.ts`. Answers, exercise drafts, reflections and recall schedules live in `state.study`, and every write goes through one `update` call. The session timer reuses `src/lib/sessions.ts` with the step id as the task id. The old `learning` snapshot field stays in the schema so saved states still parse, and `src/lib/schedule.ts` still produces the plan the schema requires, but no screen shows either.

`scripts/build-flow.mjs` (`npm run course:flow`) writes `flow.json` from the imported manifest. It cuts each lecture into parts of about 30 minutes by matching the notes sections to the subtitles, and it lists the section and shorts for each week. Rerun it after a course refresh, then run `npm test`: `src/content/content.test.ts` fails if a lecture part, heading or short no longer has matching content.

`scripts/import-course.mjs` imports the public CS50x 2026 corpus into `public/course/2026`. The manifest records each material's unit, format, delivery method, source, content hash, and fetch date. Documents contain sanitized HTML and section headings. Media streams remain remote, while documents and bounded files ship as static assets. `src/lib/materials.ts` validates the imported JSON at the fetch boundary. `src/ui/search.tsx` is the only way into the full archive: a title search over the manifest that opens a result in the material viewer from `src/ui/materials.tsx`. Attribution identifies Harvard's authors, the source, the license, and presentation changes.

The manual and coding environment prohibit cross-origin framing, so the app links to them. Harvard retains the authoritative assignment specifications and grading, and the learner records the checker result in the app.

## Ownership during the swarm

- `src/lib/model.ts` owns shared schemas and types. The coordinator maintains this contract.
- The course worker owns `src/lib/course.ts`, `src/lib/progress.ts`, and their tests.
- The schedule worker owns `src/lib/schedule.ts`, `src/lib/sessions.ts`, and their tests.
- The Cloudflare worker owns `src/server/`, `migrations/`, and backend tests.
- The coordinator owns package and framework configuration, UI, state synchronization, and integration checks.

Workers may read every spec but write only their assigned paths. They must not modify the shared model, package configuration, or another worker's files.

## Verification and throughput checkpoint

The first runnable unit is a real TanStack route, backed by the local Cloudflare runtime. Domain tests must prove alternative counting, session recovery, and catch-up behavior. Auth checks must cover single-use links and failed access. Integration checks must prove that saved progress survives refresh and reauthentication. Production completion also requires real email delivery and the custom domain.

The baseline repository has no app or test harness. Work is partitioned across three independent modules while the coordinator integrates one interface. If integration blocks progress, consolidate the failing boundary rather than adding another abstraction.
