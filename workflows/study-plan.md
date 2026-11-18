# Create and maintain the CS50 study plan

Status is accepted. The user approved the complete workflow package on 16 November 2026.

## Goal

Give the learner a college-style timetable that connects each study block to CS50 work and shows whether their remaining workload fits the ten-week target.

## Confirmed inputs

- Course is Harvard CS50x.
- Starting progress is Week 0 with no completed required work declared.
- Start date is 17 November 2026.
- Duration target is ten calendar weeks.
- Finishing means completing all required assignments and the final project.
- The learner accepted study after gym at 09:00, a college-style timetable, and an SKS workload reference.
- The first release is private to the learner's configured email address.

## Accepted timetable

The accepted initial timezone is Asia/Jakarta. Store the study timezone with the plan. A device in another timezone must not silently shift its timetable.

| Day       | First block                        | Break          | Second block                                 | Study time |
| --------- | ---------------------------------- | -------------- | -------------------------------------------- | ---------- |
| Monday    | 09:00 to 11:00, current assignment | 11:00 to 11:30 | 11:30 to 13:30, assignment and weekly review | 4 hours    |
| Tuesday   | 09:00 to 11:00, lecture            | 11:00 to 11:30 | 11:30 to 13:30, lecture and notes            | 4 hours    |
| Wednesday | 09:00 to 11:00, section and shorts | 11:00 to 11:30 | 11:30 to 13:30, coding lab                   | 4 hours    |
| Thursday  | 09:00 to 11:00, coding lab         | 11:00 to 11:30 | 11:30 to 13:30, coding lab                   | 4 hours    |
| Friday    | 09:00 to 11:00, coding lab         | 11:00 to 11:30 | 11:30 to 13:30, testing and submission       | 4 hours    |
| Saturday  | 09:00 to 11:30, catch-up           | None           | None                                         | 2.5 hours  |
| Sunday    | Rest                               | None           | None                                         | 0 hours    |

The accepted timetable has 20 hours of scheduled study and 2.5 hours of reserved catch-up capacity each week. Breaks do not count as study time. Unused catch-up time does not count as completed study.

The first week starts on Tuesday, 17 November. Ten consecutive seven-day planning periods end on Monday, 25 January 2027. Course week numbers remain separate from calendar week numbers. The app must not imply that eleven course weeks map one-to-one to ten calendar weeks.

Block labels describe the intended activity. The app must adapt task assignments to the current course unit, available resources, remaining assignments, and project milestones. It must not create a section or problem set for a unit that lacks one. Lectures can span multiple blocks. Friday submission is a planning target, not a claim of completion.

## Workload reference

The proposed budget is 225 hours across ten weeks. It equals a five-SKS study-time budget using 45 hours per SKS. This is a planning reference and does not award academic credit.

The app must distinguish planned time, actual logged study time, completed learning resources, submitted assignments, and passing assignments. Spending the time does not establish assignment completion.

## Triggers

- Create the initial plan after onboarding has enough confirmed availability and progress information.
- Recalculate a proposed plan after the learner changes availability or reports work that changes the remaining workload.
- Prepare a weekly review using recorded progress and the next planning period.

Prepare plans when the learner opens the app or changes relevant data. Background jobs and reminder emails are not needed for this first-release proposal. Version proposed plans so a stale proposal cannot overwrite later progress or schedule changes.

## Accepted recovery brief

Use unused catch-up capacity first. If the remaining work still exceeds the accepted schedule, present the missed work, suggested new blocks, affected milestones, and a revised target date. Apply changes after the learner accepts them. Preserve a record of the previous plan so the learner can understand what changed.

For the proposed first release, filling a reserved Saturday block appears as a catch-up suggestion that the learner can apply. The accepted larger-change checkpoint applies when the proposal moves other planned work or extends the target date. The recovery workflow specifies the details.

## Accepted initial course allocation

The initial allocation below uses the accepted 20 scheduled hours each week. Every week additionally reserves 2.5 Saturday hours for recovery. Budgets include the unit's lecture, supporting resources, and assignment work. They are editable starting estimates, not measured completion predictions.

| Plan week | Dates                    | Scheduled course work           | Final-project work                                  |
| --------- | ------------------------ | ------------------------------- | --------------------------------------------------- |
| 1         | 17 to 23 November        | Scratch, 5 hours; C, 15 hours   | None                                                |
| 2         | 24 to 30 November        | Arrays, 20 hours                | None                                                |
| 3         | 1 to 7 December          | Algorithms, 20 hours            | None                                                |
| 4         | 8 to 14 December         | Memory, 20 hours                | None                                                |
| 5         | 15 to 21 December        | Data structures, 20 hours       | None                                                |
| 6         | 22 to 28 December        | Python, 20 hours                | None                                                |
| 7         | 29 December to 4 January | SQL, 16 hours                   | Scope, 4 hours                                      |
| 8         | 5 to 11 January          | HTML, CSS, JavaScript, 16 hours | Prototype, 4 hours                                  |
| 9         | 12 to 18 January         | Flask, 14 hours                 | Build, 6 hours                                      |
| 10        | 19 to 25 January         | The End, 2 hours                | Finish, document, demonstrate, and submit, 18 hours |

November and December dates are in 2026. January dates are in 2027. Total capacity is 168 hours of numbered course-unit work, 32 hours of project work, and 25 reserved catch-up hours. Final-project milestones remain planning tasks; the project's passing result is one required completion group.

Assign each unit's scheduled segments in course order. Lecture and supporting-resource activities occupy the first segments. Assignment activities occupy the remainder. Keep task selection editable so the learner can split a lecture across sessions or start an assignment when ready. Do not mark individual resources complete from the allocation alone.

A difficult assignment can exceed its starter allocation. Show remaining-work estimates and the recovery proposal rather than hiding unfinished work.

Preserve official course order. For the initial plan, schedule Scratch before C within the first week. Treat the day labels in the timetable as preferences for lecture, practice, and submission, not rigid constraints that prevent a task from continuing in the next block. Project scope and prototype work can run alongside later units. Recommend less-comfortable alternatives initially, while allowing the learner to choose either valid alternative.

Divide each weekday's four study hours into task segments on either side of the accepted break. If a unit boundary falls inside a block, split the task segment at that boundary. Reserve Saturday for recovery. A unit with all required work passed can release its unused assignment allocation for later work through a proposed plan change.

## Accepted product defaults

- Initial timezone is Asia/Jakarta and can be changed in settings.
- Course results are recorded manually, with source labels and optional scores and links, as specified in the progress workflow.
- Sessions use a pauseable timer and manual time corrections, as specified in the daily-study workflow.
- Guidance uses recorded progress and capacity rules. No external model, external calendar, or reminder email is needed for the first release.
- The initial allocation above can be revised through the accepted recovery policy. The start date and original target remain available in plan history.

## Required evidence before approval

- The learner's answers resolve the open product decisions.
- The course catalog identifies every required assignment and valid alternative without double-counting optional work.
- The schedule includes final-project work and preserves required course work when compressing the course into ten calendar weeks.
- The capacity calculation counts study time correctly and excludes breaks.
- A missed-session example demonstrates the chosen recovery behavior.

## Sources

- [CS50 course workflow](https://cs50.harvard.edu/x/#how-to-take-this-course).
- [CS50 FAQ](https://cs50.harvard.edu/x/faqs/).
- [SKS study-time definition, Article 15 paragraph 6](https://lldikti3.kemdiktisaintek.go.id/wp-content/uploads/2025/09/4768-Penyampaian-Salinan-Permendiktisaintek-No-39-Tahun-2025.pdf).
