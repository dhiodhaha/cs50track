import { courseUnits } from "../lib/course";
import { stageLabels, type Stage, type Step } from "../lib/flow";
import type { Attempt, CompletionGroup } from "../lib/model";
import { latestAttempt } from "../lib/progress";
import { dateInZone } from "../lib/schedule";
import { friendlyDate } from "./format";

export function attemptResult(attempt: Attempt) {
  return attempt.kind === "passed"
    ? attempt.score === null
      ? "Passed"
      : `Passed with ${attempt.score}`
    : attempt.kind === "revision"
      ? attempt.score === null
        ? "Needs revision"
        : `Needs revision, ${attempt.score}`
      : "Submitted, waiting for a result";
}

export function attemptSummary(attempt: Attempt, timezone: string) {
  const when = friendlyDate(
    dateInZone(new Date(attempt.submittedAt), timezone),
  );
  return `${attemptResult(attempt)} · ${when}`;
}

/** The problem group a step belongs to, when it is a problem set. */
export function stepGroup(step: Step): CompletionGroup | undefined {
  if (step.stage !== "problems") return undefined;
  return courseUnits
    .find((unit) => unit.id === step.unitId)
    ?.groups.find((group) => group.id === step.groupId);
}

/** The most recent result across a group's versions, whichever version it was for. */
export function latestInGroup(
  group: CompletionGroup,
  attempts: Attempt[],
): Attempt | undefined {
  return group.assignments
    .flatMap((assignment) => latestAttempt(assignment.id, attempts) ?? [])
    .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0];
}

/** The singular word a tile shows above its number. */
export const stageCaption: Record<Stage, string> = {
  lecture: "Lecture",
  section: "Section",
  shorts: "Short",
  problems: "Problem",
  project: "Milestone",
};

/** The heading a group of steps sits under in the week sheet and the outline. */
export const stageHeading: Record<Stage, string> = {
  ...stageLabels,
  project: "Milestones",
};

/** Position of a step among the steps of its own stage, from 1. */
export function stageOrdinal(step: Step, steps: Step[]): number {
  return (
    steps
      .filter((item) => item.stage === step.stage)
      .findIndex((item) => item.id === step.id) + 1
  );
}

export type StageGroup = { stage: Stage; steps: Step[] };

/** Steps in course order, split into one run per stage. */
export function groupByStage(steps: Step[]): StageGroup[] {
  const groups: StageGroup[] = [];
  for (const step of steps) {
    const last = groups.at(-1);
    if (last?.stage === step.stage) last.steps.push(step);
    else groups.push({ stage: step.stage, steps: [step] });
  }
  return groups;
}
