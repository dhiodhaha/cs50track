import {
  completeStep,
  emptyStudy,
  type CourseFlow,
  type Step,
} from "../lib/flow";
import type { AppState } from "../lib/model";
import { finishSession, resumeSession, startSession } from "../lib/sessions";

/**
 * Entering a step resumes its open timer, or finishes whatever else was
 * running and starts a new one. Safe to call again after a reload.
 */
export function enterStep(
  state: AppState,
  step: Pick<Step, "id" | "unitId" | "title">,
  now: Date,
): AppState {
  const active = state.sessions.find(
    (session) => session.id === state.activeSessionId,
  );
  if (active && active.status !== "finished" && active.taskId === step.id)
    return resumeSession(state, active.id, now);
  return startSession(finishSession(state, now), step, now);
}

export type Reflection = { learned: string; unclear: string };

/**
 * Everything that happens when a learner finishes a step, as one state change:
 * mark it done, keep their reflection, and stop the timer.
 */
export function closeStep(
  flow: CourseFlow,
  state: AppState,
  step: Step,
  reflection: Reflection,
  context: { today: string; now: Date; id: string },
): AppState {
  const done = completeStep(flow, state, step, context.today);
  const learned = reflection.learned.trim();
  const unclear = reflection.unclear.trim();
  const study = done.study ?? emptyStudy();
  const withReflection: AppState =
    learned || unclear
      ? {
          ...done,
          study: {
            ...study,
            reflections: [
              ...study.reflections,
              {
                id: context.id,
                date: context.today,
                stepId: step.id,
                learned,
                unclear,
              },
            ],
          },
        }
      : done;
  return finishSession(withReflection, context.now);
}
