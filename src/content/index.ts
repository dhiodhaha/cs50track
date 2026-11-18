import type { RecallQuestion, WeekContent } from "./types";

const modules = import.meta.glob<{ default: WeekContent }>("./week-*.ts");

export function hasWeekContent(unitId: string): boolean {
  return `./${unitId}.ts` in modules;
}

export async function loadWeekContent(
  unitId: string,
): Promise<WeekContent | null> {
  const load = modules[`./${unitId}.ts`];
  return load ? (await load()).default : null;
}

/** Recall questions grouped by the step that unlocks them. */
export function recallByStep(
  content: WeekContent,
): Record<string, RecallQuestion[]> {
  const result: Record<string, RecallQuestion[]> = {};
  for (const [id, part] of Object.entries(content.parts))
    result[id] = part.recall;
  for (const [id, clip] of Object.entries(content.shorts))
    result[id] = clip.recall;
  if (content.section)
    result[`${content.unitId}-section`] = content.section.recall;
  return result;
}
