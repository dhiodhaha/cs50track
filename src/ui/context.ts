import { createContext, useContext } from "react";
import type { CourseFlow } from "../lib/flow";
import { emptyStudy } from "../lib/flow";
import type { AppState } from "../lib/model";
import type { Update } from "./forms";

export type Study = NonNullable<AppState["study"]>;

export type StudyContext = {
  state: AppState;
  update: Update;
  flow: CourseFlow;
  today: string;
};

export const StudyCtx = createContext<StudyContext | null>(null);

export function useStudy(): StudyContext {
  const value = useContext(StudyCtx);
  if (!value) throw new Error("useStudy needs a StudyCtx provider.");
  return value;
}

/** Applies a change to `state.study`, creating it on first use. */
export function patchStudy(
  state: AppState,
  change: (study: Study) => Study,
): AppState {
  return { ...state, study: change(state.study ?? emptyStudy()) };
}

export const ignore = () => undefined;
