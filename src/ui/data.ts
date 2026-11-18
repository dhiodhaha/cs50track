import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  allSteps,
  flowSchema,
  FLOW_URL,
  stepDone,
  type CourseFlow,
} from "../lib/flow";
import {
  MATERIAL_MANIFEST_URL,
  courseDocumentSchema,
  materialManifestSchema,
  type CourseDocument,
} from "../lib/materials";
import type { AppState } from "../lib/model";
import { loadWeekContent, recallByStep } from "../content";
import type { RecallQuestion, WeekContent } from "../content/types";

async function getJson(url: string, signal?: AbortSignal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("This course file could not be loaded.");
  return response.json();
}

export function useFlow() {
  return useQuery({
    queryKey: ["flow"],
    queryFn: async ({ signal }) =>
      flowSchema.parse(await getJson(FLOW_URL, signal)),
    staleTime: Infinity,
  });
}

export function useManifest(enabled = true) {
  return useQuery({
    queryKey: ["manifest"],
    enabled,
    queryFn: async ({ signal }) =>
      materialManifestSchema.parse(
        await getJson(MATERIAL_MANIFEST_URL, signal),
      ),
    staleTime: Infinity,
  });
}

export const documentUrl = (id: string) => `/course/2026/documents/${id}.json`;

export function useCourseDocument(url: string | null) {
  return useQuery<CourseDocument>({
    queryKey: ["course-document", url],
    enabled: url !== null,
    queryFn: async ({ signal }) =>
      courseDocumentSchema.parse(await getJson(url!, signal)),
    staleTime: Infinity,
  });
}

export function useWeekContent(unitId: string) {
  return useQuery({
    queryKey: ["week-content", unitId],
    queryFn: () => loadWeekContent(unitId),
    staleTime: Infinity,
  });
}

export type RecallPool = {
  ready: boolean;
  /** Question ids of every finished step, in course order. */
  unlocked: string[];
  questions: Map<string, RecallQuestion>;
};

/** Recall questions unlock when their step is finished. Content loads per unit. */
export function useRecallPool(flow: CourseFlow, state: AppState): RecallPool {
  const finished = useMemo(
    () => allSteps(flow).filter((step) => stepDone(step, state)),
    [flow, state],
  );
  const unitIds = useMemo(
    () => [...new Set(finished.map((step) => step.unitId))],
    [finished],
  );
  const contents = useQuery({
    queryKey: ["recall-content", unitIds.join(",")],
    queryFn: async () => {
      const loaded = await Promise.all(
        unitIds.map(
          async (id) =>
            [id, await loadWeekContent(id).catch(() => null)] as const,
        ),
      );
      return new Map<string, WeekContent | null>(loaded);
    },
    staleTime: Infinity,
  });
  return useMemo(() => {
    const questions = new Map<string, RecallQuestion>();
    const unlocked: string[] = [];
    if (!contents.data) return { ready: false, unlocked, questions };
    const byUnit = new Map(
      [...contents.data].map(([id, content]) => [
        id,
        content ? recallByStep(content) : {},
      ]),
    );
    for (const step of finished)
      for (const question of byUnit.get(step.unitId)?.[step.id] ?? []) {
        questions.set(question.id, question);
        unlocked.push(question.id);
      }
    return { ready: true, unlocked, questions };
  }, [contents.data, finished]);
}
