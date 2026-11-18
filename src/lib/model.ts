import { z } from "zod";

export const attemptSchema = z
  .object({
    id: z.string().min(1),
    assignmentId: z.string().min(1),
    submittedAt: z.iso.datetime(),
    kind: z.enum(["pending", "passed", "revision"]),
    score: z.number().min(0).max(100).nullable(),
    url: z.string().max(2000),
    note: z.string().max(5000),
  })
  .refine(
    (a) =>
      a.score === null || a.kind === (a.score >= 70 ? "passed" : "revision"),
    "The score and result must agree.",
  );
export type Attempt = z.infer<typeof attemptSchema>;

export const sessionSchema = z.object({
  id: z.string().min(1),
  taskId: z.string(),
  unitId: z.string(),
  label: z.string().max(300),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime().nullable(),
  elapsedSeconds: z.number().nonnegative().max(604800),
  status: z.enum(["running", "paused", "finished"]),
  segmentStartedAt: z.iso.datetime().nullable(),
  lastHeartbeatAt: z.iso.datetime(),
  manual: z.boolean(),
  note: z.string().max(5000).optional(),
});
export type StudySession = z.infer<typeof sessionSchema>;

export const blockSchema = z.object({
  id: z.string(),
  date: z.iso.date(),
  start: z.string().regex(/^\d{2}:\d{2}$/),
  minutes: z.number().int().positive().max(600),
  unitId: z.string(),
  title: z.string(),
  kind: z.enum(["lecture", "practice", "project", "catchup"]),
  status: z.enum(["planned", "done", "skipped"]),
});
export type StudyBlock = z.infer<typeof blockSchema>;
export const planSchema = z.object({
  version: z.number().int().nonnegative(),
  startDate: z.iso.date(),
  targetDate: z.iso.date(),
  timezone: z.string(),
  blocks: z.array(blockSchema).max(2000),
});
export type StudyPlan = z.infer<typeof planSchema>;

export const settingsSchema = z.object({
  startDate: z.iso.date(),
  timezone: z.string().refine((value) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: value });
      return true;
    } catch {
      return false;
    }
  }, "Choose a valid timezone."),
  weekdayStart: z.string().regex(/^\d{2}:\d{2}$/),
  weekdayMinutes: z.number().int().min(60).max(480),
  breakStart: z.string().regex(/^\d{2}:\d{2}$/),
  breakMinutes: z.number().int().min(0).max(120),
  saturdayStart: z.string().regex(/^\d{2}:\d{2}$/),
  saturdayMinutes: z.number().int().min(0).max(300),
});
export type Settings = z.infer<typeof settingsSchema>;
export const appStateSchema = z.object({
  schemaVersion: z.literal(1),
  settings: settingsSchema,
  resources: z.record(z.string(), z.boolean()),
  attempts: z.array(attemptSchema).max(10000),
  sessions: z.array(sessionSchema).max(20000),
  activeTaskId: z.string().nullable(),
  activeSessionId: z.string().nullable(),
  sessionRecoveryId: z.string().nullable(),
  blockers: z.record(z.string(), z.string().max(5000)),
  milestones: z.record(z.string(), z.boolean()),
  plan: planSchema,
  planHistory: z.array(planSchema).max(100),
  taskEstimates: z.record(z.string(), z.number().nonnegative()),
  learning: z
    .object({
      lastLessonId: z.string().nullable(),
      lessons: z.record(
        z.string(),
        z.object({
          answer: z.number().int().nonnegative().nullable(),
          exerciseDone: z.boolean(),
          completed: z.boolean(),
          notes: z.string().max(5000),
        }),
      ),
    })
    .optional(),
  study: z
    .object({
      answers: z.record(z.string(), z.number().int().nonnegative()),
      recall: z.record(
        z.string(),
        z.object({
          due: z.iso.date(),
          level: z.number().int().min(0).max(10),
        }),
      ),
      reflections: z
        .array(
          z.object({
            id: z.string().min(1),
            date: z.iso.date(),
            stepId: z.string(),
            learned: z.string().max(2000),
            unclear: z.string().max(2000),
          }),
        )
        .max(5000),
      exercises: z.record(z.string(), z.string().max(20000)),
      activeDays: z.record(z.string(), z.boolean()),
      publicPage: z.object({
        enabled: z.boolean(),
        name: z.string().max(80),
      }),
    })
    .optional(),
});
export type AppState = z.infer<typeof appStateSchema>;

export type Resource = {
  id: string;
  unitId: string;
  title: string;
  kind: "lecture" | "section" | "short";
  url: string;
  minutes: number;
};
export type Assignment = {
  id: string;
  groupId: string;
  unitId: string;
  title: string;
  url: string;
  difficulty: "standard" | "challenge";
};
export type CompletionGroup = {
  id: string;
  title: string;
  assignments: Assignment[];
};
export type CourseUnit = {
  id: string;
  index: number;
  title: string;
  topic: string;
  description: string;
  color: string;
  url: string;
  resources: Resource[];
  groups: CompletionGroup[];
};
export type RecoveryProposal = {
  baseVersion: number;
  baseRevision: string;
  plan: StudyPlan;
  added: StudyBlock[];
  moved: { before: StudyBlock; after: StudyBlock }[];
  removed: StudyBlock[];
  deficitMinutes: number;
  reason: string;
};
