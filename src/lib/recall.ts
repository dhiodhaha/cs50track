import { emptyStudy } from "./flow";
import type { AppState } from "./model";
import { addDays } from "./schedule";

const INTERVAL_DAYS = [1, 3, 7, 14, 30];
export const RECALL_PER_SESSION = 3;

type Study = NonNullable<AppState["study"]>;

/** Questions to ask now: overdue ones first, then unlocked ones never asked. */
export function dueRecall(
  study: Study | undefined,
  unlockedIds: string[],
  today: string,
  limit = RECALL_PER_SESSION,
): string[] {
  const recall = study?.recall ?? {};
  const due = unlockedIds
    .filter((id) => recall[id] && recall[id].due <= today)
    .sort((a, b) => recall[a]!.due.localeCompare(recall[b]!.due));
  const fresh = unlockedIds.filter((id) => !recall[id]);
  return [...due, ...fresh].slice(0, limit);
}

/** A right answer pushes the question further out. A wrong answer brings it back tomorrow. */
export function gradeRecall(
  state: AppState,
  questionId: string,
  correct: boolean,
  today: string,
): AppState {
  const study = state.study ?? emptyStudy();
  const previous = study.recall[questionId];
  const level = correct
    ? Math.min(INTERVAL_DAYS.length - 1, (previous?.level ?? -1) + 1)
    : 0;
  return {
    ...state,
    study: {
      ...study,
      activeDays: { ...study.activeDays, [today]: true },
      recall: {
        ...study.recall,
        [questionId]: {
          level,
          due: addDays(today, correct ? INTERVAL_DAYS[level]! : 1),
        },
      },
    },
  };
}
