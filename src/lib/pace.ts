import { courseUnits } from "./course";
import { allSteps, stepDone, type CourseFlow } from "./flow";
import type { AppState, CourseUnit } from "./model";
import { groupPassed, latestAttempt } from "./progress";
import { addDays, dateInZone } from "./schedule";

export const PLAN_WEEKS = 10;

/** Which of the ten calendar weeks each unit belongs to. Week 0 shares the first; the project shares the last. */
export function calendarWeek(unitId: string): number {
  if (unitId === "project") return PLAN_WEEKS;
  const index = Number(unitId.replace("week-", ""));
  return Math.min(PLAN_WEEKS, Math.max(1, index));
}

export function weekDeadline(week: number, startDate: string): string {
  return addDays(startDate, week * 7 - 1);
}

export function unitDeadline(unitId: string, startDate: string): string {
  return weekDeadline(calendarWeek(unitId), startDate);
}

export function targetDate(startDate: string): string {
  return weekDeadline(PLAN_WEEKS, startDate);
}

const daysBetween = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );

/** The calendar week containing a date, from 1. Dates after the plan report PLAN_WEEKS + 1. */
export function currentWeek(today: string, startDate: string): number {
  return Math.min(
    PLAN_WEEKS + 1,
    Math.max(1, Math.floor(daysBetween(startDate, today) / 7) + 1),
  );
}

export type WeekStatus = "on-time" | "late" | "missed" | "current" | "upcoming";
export type WeekRecord = {
  unitId: string;
  title: string;
  topic: string;
  deadline: string;
  status: WeekStatus;
  closedOn: string | null;
  passed: number;
  total: number;
};

function closedOn(unit: CourseUnit, state: AppState): string | null {
  let last = "";
  for (const group of unit.groups) {
    if (!groupPassed(group, state.attempts)) return null;
    const passing = group.assignments
      .map((assignment) => latestAttempt(assignment.id, state.attempts))
      .filter((attempt) => attempt !== undefined)
      .filter((attempt) =>
        attempt.score === null ? attempt.kind === "passed" : attempt.score >= 70,
      )
      .map((attempt) =>
        dateInZone(new Date(attempt.submittedAt), state.settings.timezone),
      )
      .sort()[0]!;
    if (passing > last) last = passing;
  }
  return last || null;
}

/** The permanent weekly record: each graded unit against its own deadline. */
export function weekRecord(state: AppState, today: string): WeekRecord[] {
  const start = state.settings.startDate;
  const week = currentWeek(today, start);
  return courseUnits
    .filter((unit) => unit.groups.length > 0)
    .map((unit) => {
      const deadline = unitDeadline(unit.id, start);
      const closed = closedOn(unit, state);
      const status: WeekStatus = closed
        ? closed <= deadline
          ? "on-time"
          : "late"
        : today > deadline
          ? "missed"
          : calendarWeek(unit.id) === week
            ? "current"
            : "upcoming";
      return {
        unitId: unit.id,
        title: unit.title,
        topic: unit.topic,
        deadline,
        status,
        closedOn: closed,
        passed: unit.groups.filter((group) => groupPassed(group, state.attempts))
          .length,
        total: unit.groups.length,
      };
    });
}

export type Pace = {
  week: number;
  deadline: string;
  daysLeftInWeek: number;
  daysLeftInPlan: number;
  targetDate: string;
  doneMinutes: number;
  totalMinutes: number;
  /** Positive when behind the even pace, negative when ahead. */
  behindMinutes: number;
  /** Unfinished work due by the end of this calendar week. */
  dueThisWeekMinutes: number;
  perDayMinutes: number;
  status: "ahead" | "on-pace" | "behind" | "finished";
};

const ON_PACE_SLACK_MINUTES = 45;

export function getPace(
  flow: CourseFlow,
  state: AppState,
  today: string,
): Pace {
  const start = state.settings.startDate;
  const week = currentWeek(today, start);
  const boundedWeek = Math.min(week, PLAN_WEEKS);
  const deadline = weekDeadline(boundedWeek, start);
  const dayInWeek = Math.min(7, Math.max(0, daysBetween(start, today) % 7));
  const steps = allSteps(flow);
  let doneMinutes = 0;
  let totalMinutes = 0;
  let expected = 0;
  let dueThisWeekMinutes = 0;
  for (const step of steps) {
    const stepWeek = calendarWeek(step.unitId);
    const done = stepDone(step, state);
    totalMinutes += step.minutes;
    if (done) doneMinutes += step.minutes;
    if (stepWeek < week) expected += step.minutes;
    else if (stepWeek === week) expected += (step.minutes * dayInWeek) / 7;
    if (!done && stepWeek <= boundedWeek) dueThisWeekMinutes += step.minutes;
  }
  const behindMinutes = Math.round(expected - doneMinutes);
  const daysLeftInWeek = Math.max(1, daysBetween(today, deadline) + 1);
  return {
    week: boundedWeek,
    deadline,
    daysLeftInWeek,
    daysLeftInPlan: Math.max(0, daysBetween(today, targetDate(start))),
    targetDate: targetDate(start),
    doneMinutes,
    totalMinutes,
    behindMinutes,
    dueThisWeekMinutes,
    perDayMinutes: Math.ceil(dueThisWeekMinutes / daysLeftInWeek),
    status:
      doneMinutes >= totalMinutes
        ? "finished"
        : behindMinutes > ON_PACE_SLACK_MINUTES
          ? "behind"
          : behindMinutes < -ON_PACE_SLACK_MINUTES
            ? "ahead"
            : "on-pace",
  };
}

export function formatMinutes(minutes: number): string {
  const rounded = Math.max(0, Math.round(minutes));
  if (rounded < 60) return `${rounded} min`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function paceLabel(pace: Pace): string {
  if (pace.status === "finished") return "Course complete";
  if (pace.status === "behind")
    return `${formatMinutes(pace.behindMinutes)} behind`;
  if (pace.status === "ahead")
    return `${formatMinutes(-pace.behindMinutes)} ahead`;
  return "On pace";
}
