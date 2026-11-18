# Run a daily study session

Status is accepted. The user approved the complete workflow package on 16 November 2026.

## Goal

Let the learner open the platform after gym, see today's course work, study with a timer, and record an honest result without losing their session.

## Trigger

The learner opens Today or chooses a scheduled block in Plan. Sessions start only when the learner presses Start. Opening a page or an external course link does not start a timer.

## Today's brief

Show the date, current calendar week of the plan, course unit, next task, official course link, expected study window, and any overdue work. The primary action starts the selected task. The learner can choose a different task without changing its completion state.

Default task order is the earliest unfinished course unit, then its lecture, optional supporting material if selected, and required assignments. A selected assignment can be studied even if its lecture checkbox is incomplete. A completed or skipped optional resource must not prevent access to required work.

## Timer

Use an elapsed-time timer with Start, Pause, Resume, and Finish. It measures active recorded study time. It does not infer attention or a focus-quality percentage. The planned block's end time remains visible, and the learner can continue past it intentionally. Extra study time never silently expands future availability.

Only one session can be running for the owner. Starting another task first pauses the existing session and asks the learner to finish or resume it. A task can have many sessions.

Save start, pause, resume, and finish events on the server. Track elapsed time from timestamps, not render ticks. Refresh and navigation restore the saved session. Send a heartbeat every 30 seconds while a running session is open. If a running session has no heartbeat for two minutes, cap its automatically recorded segment at the last heartbeat and show a recovery prompt when the learner returns. Offer Resume, Finish at the recorded time, or Correct time. Do not count an overnight browser closure as study.

Corrections accept a nonnegative duration, a date, the associated task, and an optional note. They replace the mistaken segment rather than adding a duplicate. Retried writes use the same operation identifier and cannot double-count a session. Do not permit overlapping active segments to count twice.

## Finish brief

Show recorded duration and ask what changed. The learner can record learning-resource completion, open the assignment result form, note a blocker, or finish with no progress change. Finishing a timer never marks an assignment submitted or passed.

If the learner studies without the timer, offer Log study time. Manual entries use the same date, task, duration, and note fields and carry a manual-entry label.

## Blockers and guidance

The learner can mark a task blocked and add a short note. Offer the linked section, shorts if available, official problem specification, CS50.ai, and course communities as appropriate. The platform tracks and plans study. It does not generate assignment solutions.

Guidance has a short reason based on recorded facts. Examples include a missed block, a submission awaiting a result, an unfinished required group, or project work approaching its planned date. Do not invent focus scores, predicted mastery, or recommendations attributed to unseen behavior.

## Accepted screen layout

Use a light interface inspired by the supplied references and the authenticated Agentic UI component contracts. Primary navigation has Today, Plan, Progress, and Settings.

On desktop, Today has a compact course checklist at left, the day's schedule and active session in the main column, and a short plan-status and guidance panel at right. Keep the next-task action prominent. Plan shows the week timetable and task details. Progress shows required work, resources, sessions, and final-project milestones as separate sections. Settings holds timezone, availability, plan history, and account controls.

On narrow screens, use one column with today's task and timer first, followed by the schedule, checklist, and guidance. The schedule also has an agenda view so the learner does not need to operate a compressed desktop grid. Every action must work with keyboard controls and accessible labels.

The user accepted this layout in the final build brief. Agentic UI tokens and component details must come from its authenticated catalog. Do not claim those components have been used before obtaining their payloads.

## Accepted reminder policy

Show due and overdue work when the learner opens the app. The first release sends email for login only. No calendar connection, scheduled reminder email, browser notification permission, or paid model is required for the study loop.

## Acceptance examples

- Pausing a session for lunch adds no lunch time to study totals.
- Refresh restores the active task and saved timer state.
- Returning the next day prompts recovery instead of claiming overnight study.
- Finishing a session without submitting work leaves the assignment unfinished.
- Retrying a successful finish request does not duplicate logged time.
- Recording work on a phone appears when the learner next opens the desktop app.
- A failed save keeps the learner's input visible and offers Retry.

## Package confirmation

Manual recording, timer recovery, in-app guidance, reminder policy, initial Asia/Jakarta timezone, and the proposed screen layout were accepted together on 16 November 2026. The accepted timetable and recovery policy remain unchanged.
