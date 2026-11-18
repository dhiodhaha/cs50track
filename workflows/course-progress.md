# Record CS50 learning and assignment progress

Status is accepted. The user approved the complete workflow package on 16 November 2026.

## Goal

Show the learner what remains to complete CS50x without counting optional alternatives twice or treating watched lectures as passed assignments.

## Verified course requirements

Checked against the official CS50x website on 16 November 2026. Store this as the 2026 course edition. Do not silently replace an existing learner's catalog when the unversioned course URL changes.

Each semicolon-separated item in the table is one required completion group. A choice within a group needs one passing alternative. A single assignment is its own group.

| Course unit                   | Required completion groups                                  | Source                                                            |
| ----------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| Week 0, Scratch               | Starting from Scratch                                       | [Problem set 0](https://cs50.harvard.edu/x/psets/0/)              |
| Week 1, C                     | Hello, It's Me; Mario less or more; Cash or Credit          | [Problem set 1](https://cs50.harvard.edu/x/psets/1/)              |
| Week 2, Arrays                | Scrabble; Readability; Caesar or Substitution               | [Problem set 2](https://cs50.harvard.edu/x/psets/2/)              |
| Week 3, Algorithms            | Sort; Plurality; Runoff or Tideman                          | [Problem set 3](https://cs50.harvard.edu/x/psets/3/)              |
| Week 4, Memory                | Volume; Filter less or more; Recover                        | [Problem set 4](https://cs50.harvard.edu/x/psets/4/)              |
| Week 5, Data structures       | Inheritance; Speller                                        | [Problem set 5](https://cs50.harvard.edu/x/psets/5/)              |
| Week 6, Python                | Hello; Mario less or more; Cash or Credit; Readability; DNA | [Problem set 6](https://cs50.harvard.edu/x/psets/6/)              |
| Week 7, SQL                   | Songs; Movies; Fiftyville                                   | [Problem set 7](https://cs50.harvard.edu/x/psets/7/)              |
| Week 8, HTML, CSS, JavaScript | Trivia; Homepage                                            | [Problem set 8](https://cs50.harvard.edu/x/psets/8/)              |
| Week 9, Flask                 | Birthdays; Finance                                          | [Problem set 9](https://cs50.harvard.edu/x/psets/9/)              |
| Week 10, The End              | No separate problem set                                     | [Week 10](https://cs50.harvard.edu/x/weeks/10/)                   |
| Final project                 | Final project                                               | [Final project requirements](https://cs50.harvard.edu/x/project/) |

This catalog has 27 problem-set completion groups and one final-project group. The denominator for required-work progress is 28 groups. Alternative assignments, project milestones, videos, and setup tasks do not increase that denominator.

Hello, World in the C problem set is preparation. Hello, It's Me is the submitted assignment. The tracker must distinguish them. The C and Python versions of Hello, Mario, Cash, Credit, and Readability are separate assignments in separate units.

## Learning resources

Track lecture progress independently from assignment results. Sections and shorts are recommended learning resources. They do not substitute for passing assignments and must not block assignment completion.

Offer links to the official course pages. The existence and URLs of individual lecture, section, and short resources still need a complete inventory. Additional practice and seminars are separate from required assignment progress.

## Proposed recording workflow

Use manual recording for the first release. Opening an official resource does not mark it complete. Each lecture, available section, and short has its own completed toggle. Each assignment has an initial not-started state, an in-progress state, and a submission history. Keep the learner's state when they switch screens or sign in on another device.

The workflow distinguishes these facts:

- The learner has started working on an assignment.
- The learner reports a submission.
- A result for that submission is known or still pending.
- A known result passes or needs revision.
- The result is self-reported or verified through an authenticated source.

Do not label self-reported results as independently verified. A submission with no score or passing result does not count as passed. Passing requires at least 70%, as described in the [course FAQ](https://cs50.harvard.edu/x/faqs/).

Record attempts separately. The FAQ says the latest submission determines an assignment's result. For a choice group, evaluate the latest result of each alternative. The group passes if any alternative's latest result passes. Passing both alternatives still completes only one group.

Do not assume CS50 offers a public results API or that GitHub sign-in grants access to the learner's gradebook. No gradebook integration has been verified.

The assignment form offers submitted, passed, or needs-revision status, an optional numeric score from 0 to 100, an optional HTTPS result link, and an optional note. A pending submission can omit the score. A passed result without a score requires the learner to confirm that the gradebook reports a passing result. If a numeric score is provided, derive passed or needs-revision from that score and reject a conflicting status. Label all first-release results self-reported.

Add a submission attempt without overwriting earlier attempts. Let the learner edit or delete a mistaken attempt through an explicit correction action. Save the correction and recalculate the latest effective result and group totals. Offer undo immediately after deletion. Persist changes only after the server succeeds, and show a retryable error if saving fails.

Show standard alternatives initially and offer a visible choice of the challenge alternative. Choosing an alternative does not erase the other one's history. Preserve the course-derived group counting rules regardless of the chosen default.

Required-work progress is passed groups divided by 28. Display the count alongside its percentage. Show learning-resource completion and study hours separately. These metrics must have distinct labels and explanations. Do not combine them into an unexplained readiness score.

## Final project milestones

The tracker needs to make the final project's submission steps visible. The project specification requires a demonstration video of no more than three minutes, submission of its form, a detailed README with the video URL, code and README submission, and a gradebook visit to check completion.

Use project milestones to support planning. Completing the milestone checklist does not independently prove a passing grade or official course completion. Record the project result separately. Link to the official project specification for the exact video, documentation, and submission instructions rather than freezing those details in interface copy.

The learner's own final-project topic is not decided. The CS50 tracker is a tool for taking the course. It must not be assumed to be the learner's final-project submission.

## Progress brief

After the learner records progress, show the updated assignment group, remaining required work, and the next suggested task. A weekly summary can show lecture progress, required groups passed, recorded study time, and upcoming project milestones separately.

Recalculate this brief after a successful progress save and when the learner opens the dashboard. Guidance follows fixed rules based on pending work and the accepted plan. No reminder delivery, calendar integration, external model, or automatic gradebook polling is included in the first-release proposal.

## Acceptance examples

These examples define the course-derived counting rules. They do not settle the recording interface.

1. Passing either C Mario alternative completes one group. Passing the other alternative leaves the completed-group count unchanged.
2. Passing C Mario does not complete the Python Mario group.
3. Finishing all lectures with no passing assignments leaves required-work progress at zero of 28.
4. Recording a submission with a pending result leaves its group incomplete.
5. A latest score of 69% does not pass. A latest score of 70% passes.
6. Replacing an assignment's passing result with a newer failing result makes that assignment incomplete. Its choice group can remain complete if another alternative still has a passing latest result.
7. Completing all problem sets leaves 27 of 28 groups passed until the final project passes.
8. Completing a project checklist without a passing result does not complete the final-project group.
9. Recording all 28 groups as passed can show the tracker's recorded requirements as complete. Official course completion still comes from the learner's CS50 gradebook status.

## Package confirmation

The learner accepted manual recording, correction behavior, alternative defaults, and separate progress metrics with the complete build brief on 16 November 2026.

## Evidence required before approval

- The recording method and correction behavior are settled in the interview.
- An implementer can map every group and alternative to a stable identifier and an official resource URL.
- Required-work counts satisfy the examples above.
- Final-project work has time in the study plan.
- The learner confirms the completed workflow spec before implementation, as required by the invoked grilling skill.
