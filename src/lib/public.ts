import { z } from "zod";
import type { AppState } from "./model";
import { PLAN_WEEKS, currentWeek, targetDate, weekRecord } from "./pace";
import { dateInZone } from "./schedule";

export const publicWeekSchema = z.object({
  unitId: z.string(),
  title: z.string(),
  topic: z.string(),
  deadline: z.iso.date(),
  status: z.enum(["on-time", "late", "missed", "current", "upcoming"]),
  closedOn: z.iso.date().nullable(),
  passed: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

/** Everything the public page may show. Parsing through this schema drops any other field. */
export const publicSummarySchema = z.object({
  name: z.string(),
  startDate: z.iso.date(),
  timezone: z.string(),
  targetDate: z.iso.date(),
  today: z.iso.date(),
  weeks: z.array(publicWeekSchema),
  stepsDone: z.number().int().nonnegative(),
  activeDays: z.number().int().nonnegative(),
  studyMinutes: z.number().int().nonnegative(),
});
export type PublicSummary = z.infer<typeof publicSummarySchema>;

const countTrue = (record: Record<string, boolean> | undefined) =>
  Object.values(record ?? {}).filter((value) => value === true).length;

export function isPublic(
  state: AppState | null | undefined,
): state is AppState {
  return state?.study?.publicPage.enabled === true;
}

export function publicSummary(state: AppState, now: Date): PublicSummary {
  const today = dateInZone(now, state.settings.timezone);
  const seconds = state.sessions.reduce(
    (total, session) => total + session.elapsedSeconds,
    0,
  );
  return publicSummarySchema.parse({
    name: state.study?.publicPage.name.trim() ?? "",
    startDate: state.settings.startDate,
    timezone: state.settings.timezone,
    targetDate: targetDate(state.settings.startDate),
    today,
    weeks: weekRecord(state, today),
    stepsDone: countTrue(state.resources) + countTrue(state.milestones),
    activeDays: countTrue(state.study?.activeDays),
    studyMinutes: Math.floor(seconds / 60),
  });
}

export type BadgeTone = "green" | "amber" | "red" | "grey";

/** The right half of the badge, derived from the same record the page shows. */
export function badgeStatus(summary: PublicSummary | null): {
  text: string;
  tone: BadgeTone;
} {
  if (!summary) return { text: "private", tone: "grey" };
  const count = (status: PublicSummary["weeks"][number]["status"]) =>
    summary.weeks.filter((week) => week.status === status).length;
  if (summary.weeks.every((week) => week.closedOn !== null))
    return { text: "complete", tone: "green" };
  const week = Math.min(
    PLAN_WEEKS,
    currentWeek(summary.today, summary.startDate),
  );
  const head = `week ${week} of ${PLAN_WEEKS}`;
  const missed = count("missed");
  if (missed > 0) return { text: `${head} · ${missed} missed`, tone: "red" };
  const late = count("late");
  if (late > 0) return { text: `${head} · ${late} late`, tone: "amber" };
  return { text: `${head} · on track`, tone: "green" };
}

const tones: Record<BadgeTone, string> = {
  green: "#2f7d4a",
  amber: "#a16207",
  red: "#b42318",
  grey: "#6b7280",
};

export function escapeXml(text: string): string {
  return text.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );
}

const LABEL = "CS50x";
const PAD = 7;
const CHAR_WIDTH = 6.6;
const textWidth = (text: string) => Math.ceil(text.length * CHAR_WIDTH);

export function renderBadge(summary: PublicSummary | null): string {
  const { text, tone } = badgeStatus(summary);
  const left = textWidth(LABEL) + PAD * 2;
  const right = textWidth(text) + PAD * 2;
  const total = left + right;
  const title = escapeXml(`${LABEL}: ${text}`);
  const part = (value: string, x: number, width: number) =>
    `<text x="${x + width / 2}" y="14" textLength="${width - PAD * 2}" lengthAdjust="spacing">${escapeXml(value)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="20" role="img" aria-label="${title}"><title>${title}</title><clipPath id="r"><rect width="${total}" height="20" rx="3"/></clipPath><g clip-path="url(#r)"><rect width="${left}" height="20" fill="#3f4640"/><rect x="${left}" width="${right}" height="20" fill="${tones[tone]}"/></g><g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">${part(LABEL, 0, left)}${part(text, left, right)}</g></svg>`;
}
