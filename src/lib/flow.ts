import { z } from "zod";
import { courseUnits, projectMilestones } from "./course";
import type { AppState, CourseUnit } from "./model";
import { groupPassed } from "./progress";

const mediaShape = {
  youtubeId: z.string().nullable(),
  mp4: z.string().url().nullable(),
  captions: z.string().nullable(),
  durationSeconds: z.number().nonnegative(),
  /** CS50's own chapter list for the video, empty when it publishes none. */
  chapters: z
    .array(z.object({ start: z.number().nonnegative(), title: z.string() }))
    .default([]),
};
const clipSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceUrl: z.string().url(),
  documentId: z.string(),
  ...mediaShape,
});
const partSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.number().nonnegative(),
  end: z.number().nonnegative(),
  headings: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      words: z.number(),
      start: z.number(),
      /** True when the time is a CS50 chapter of the same name, false when matched from subtitles. */
      exact: z.boolean().default(false),
    }),
  ),
});
export const flowSchema = z.object({
  version: z.literal(1),
  edition: z.literal(2026),
  units: z.record(
    z.string(),
    z.object({
      lecture: z.object({
        title: z.string(),
        notesDocumentId: z.string(),
        notesSourceUrl: z.string().url(),
        ...mediaShape,
        parts: z.array(partSchema),
      }),
      section: clipSchema.nullable(),
      shorts: z.array(clipSchema),
    }),
  ),
});
export type CourseFlow = z.infer<typeof flowSchema>;
export type LecturePart = z.infer<typeof partSchema>;
export type Clip = z.infer<typeof clipSchema>;
export const FLOW_URL = "/course/2026/flow.json";

export const STAGES = [
  "lecture",
  "section",
  "shorts",
  "problems",
  "project",
] as const;
export type Stage = (typeof STAGES)[number];
export const stageLabels: Record<Stage, string> = {
  lecture: "Lecture",
  section: "Section",
  shorts: "Shorts",
  problems: "Problem set",
  project: "Final project",
};

type StepBase = { id: string; unitId: string; title: string; minutes: number };
export type Step =
  | (StepBase & { stage: "lecture"; part: LecturePart; index: number })
  | (StepBase & { stage: "section"; clip: Clip })
  | (StepBase & { stage: "shorts"; clip: Clip })
  | (StepBase & { stage: "problems"; groupId: string })
  | (StepBase & { stage: "project"; milestoneId: string });

const PROBLEM_MINUTES: Record<string, number> = {
  "week-0": 150,
  "week-5-speller": 360,
  "week-9-finance": 420,
  project: 240,
};
const READING_FACTOR = 1.25;

/** The ordered work for one unit: CS50's lecture, section, shorts, then problems. */
export function unitSteps(flow: CourseFlow, unit: CourseUnit): Step[] {
  if (unit.id === "project")
    return projectMilestones.map((milestone) => ({
      id: `project-${milestone.id}`,
      unitId: unit.id,
      stage: "project",
      title: milestone.title,
      minutes: PROBLEM_MINUTES.project!,
      milestoneId: milestone.id,
    }));
  const entry = flow.units[unit.id];
  const steps: Step[] = [];
  if (entry) {
    entry.lecture.parts.forEach((part, index) =>
      steps.push({
        id: part.id,
        unitId: unit.id,
        stage: "lecture",
        title: part.title,
        minutes: Math.ceil(((part.end - part.start) / 60) * READING_FACTOR),
        part,
        index,
      }),
    );
    if (entry.section)
      steps.push({
        id: entry.section.id,
        unitId: unit.id,
        stage: "section",
        title: entry.section.title,
        minutes: Math.ceil(entry.section.durationSeconds / 60),
        clip: entry.section,
      });
    for (const clip of entry.shorts)
      steps.push({
        id: clip.id,
        unitId: unit.id,
        stage: "shorts",
        title: clip.title,
        minutes: Math.ceil(clip.durationSeconds / 60) + 5,
        clip,
      });
  }
  for (const group of unit.groups)
    steps.push({
      id: group.id,
      unitId: unit.id,
      stage: "problems",
      title: group.title,
      minutes: PROBLEM_MINUTES[group.id] ?? PROBLEM_MINUTES[unit.id] ?? 180,
      groupId: group.id,
    });
  return steps;
}

export function allSteps(flow: CourseFlow): Step[] {
  return courseUnits.flatMap((unit) => unitSteps(flow, unit));
}

export function stepDone(step: Step, state: AppState): boolean {
  switch (step.stage) {
    case "problems": {
      const group = courseUnits
        .find((unit) => unit.id === step.unitId)
        ?.groups.find((item) => item.id === step.groupId);
      return group ? groupPassed(group, state.attempts) : false;
    }
    case "project":
      return state.milestones[step.milestoneId] === true;
    case "lecture":
      return (
        state.resources[step.id] === true ||
        state.resources[`${step.unitId}-lecture`] === true
      );
    default:
      return state.resources[step.id] === true;
  }
}

/** The single next piece of work, following course order. */
export function nextStep(flow: CourseFlow, state: AppState): Step | null {
  return allSteps(flow).find((step) => !stepDone(step, state)) ?? null;
}

export function emptyStudy(): NonNullable<AppState["study"]> {
  return {
    answers: {},
    recall: {},
    reflections: [],
    exercises: {},
    activeDays: {},
    publicPage: { enabled: false, name: "" },
  };
}

/** Mark a watch-and-learn step finished. Problems finish through recorded attempts instead. */
export function completeStep(
  flow: CourseFlow,
  state: AppState,
  step: Step,
  today: string,
): AppState {
  const study = state.study ?? emptyStudy();
  const activeDays = { ...study.activeDays, [today]: true };
  if (step.stage === "problems") return state;
  if (step.stage === "project")
    return {
      ...state,
      milestones: { ...state.milestones, [step.milestoneId]: true },
      study: { ...study, activeDays },
    };
  const resources = { ...state.resources, [step.id]: true };
  if (step.stage === "lecture") {
    const parts = flow.units[step.unitId]?.lecture.parts ?? [];
    if (parts.every((part) => resources[part.id]))
      resources[`${step.unitId}-lecture`] = true;
  }
  return { ...state, resources, study: { ...study, activeDays } };
}

export type StageSummary = {
  stage: Stage;
  label: string;
  done: number;
  total: number;
};

export function unitStages(
  flow: CourseFlow,
  unit: CourseUnit,
  state: AppState,
): StageSummary[] {
  const steps = unitSteps(flow, unit);
  return STAGES.flatMap((stage) => {
    const mine = steps.filter((step) => step.stage === stage);
    if (mine.length === 0) return [];
    return [
      {
        stage,
        label: stageLabels[stage],
        done: mine.filter((step) => stepDone(step, state)).length,
        total: mine.length,
      },
    ];
  });
}
