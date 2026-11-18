import { describe, expect, it } from "vitest";
import {
  allResources,
  courseUnits,
  getUnit,
  projectMilestones,
} from "./course";
import {
  getProgress,
  groupPassed,
  latestAttempt,
  nextTask,
  unitProgress,
} from "./progress";
import type { AppState, Attempt, StudySession } from "./model";

function state(): AppState {
  return {
    schemaVersion: 1,
    settings: {
      startDate: "2026-11-17",
      timezone: "Asia/Jakarta",
      weekdayStart: "09:00",
      weekdayMinutes: 240,
      breakStart: "11:00",
      breakMinutes: 30,
      saturdayStart: "09:00",
      saturdayMinutes: 150,
    },
    resources: {},
    attempts: [],
    sessions: [],
    activeTaskId: null,
    activeSessionId: null,
    sessionRecoveryId: null,
    blockers: {},
    milestones: {},
    plan: {
      version: 0,
      startDate: "2026-11-17",
      targetDate: "2027-01-25",
      timezone: "Asia/Jakarta",
      blocks: [],
    },
    planHistory: [],
    taskEstimates: {},
  };
}

function attempt(
  assignmentId: string,
  score: number | null = 70,
  day = 17,
  kind: Attempt["kind"] = "passed",
): Attempt {
  return {
    id: `${assignmentId}-${day}`,
    assignmentId,
    submittedAt: `2026-11-${day}T03:00:00.000Z`,
    kind: score === null ? kind : score >= 70 ? "passed" : "revision",
    score,
    url: "",
    note: "",
  };
}

function session(
  taskId: string,
  unitId: string,
  elapsedSeconds: number,
): StudySession {
  return {
    id: taskId,
    taskId,
    unitId,
    label: "Study",
    startedAt: "2026-11-17T02:00:00.000Z",
    endedAt: "2026-11-17T03:00:00.000Z",
    elapsedSeconds,
    status: "finished",
    segmentStartedAt: null,
    lastHeartbeatAt: "2026-11-17T03:00:00.000Z",
    manual: false,
  };
}

function passProblemSets(s: AppState) {
  s.attempts = courseUnits
    .filter((unit) => unit.id !== "project")
    .flatMap((unit) =>
      unit.groups.map((group) => attempt(group.assignments[0]!.id)),
    );
}

describe("required-work progress", () => {
  it("starts at zero of 28 independently from learning resources and study time", () => {
    expect(getProgress(state())).toEqual({
      passed: 0,
      total: 28,
      percent: 0,
      submitted: 0,
      resourcesCompleted: 0,
      resourcesTotal: 65,
      studySeconds: 0,
    });
    const s = state();
    s.resources = Object.fromEntries(
      allResources
        .filter((resource) => resource.kind === "lecture")
        .map((resource) => [resource.id, true]),
    );
    s.sessions = [session("week-0-lecture", "week-0", 7200)];
    expect(getProgress(s)).toEqual({
      passed: 0,
      total: 28,
      percent: 0,
      submitted: 0,
      resourcesCompleted: 11,
      resourcesTotal: 65,
      studySeconds: 7200,
    });
  });

  it("counts either or both C Mario alternatives once, and Python Mario separately", () => {
    const s = state();
    s.attempts = [attempt("week-1-mario-more")];
    expect(getProgress(s).passed).toBe(1);
    s.attempts.push(attempt("week-1-mario-less"));
    expect(getProgress(s).passed).toBe(1);
    expect(getProgress(s).submitted).toBe(1);
    expect(unitProgress(getUnit("week-6")!, s.attempts)).toEqual({
      passed: 0,
      total: 5,
    });
    s.attempts.push(attempt("week-6-mario-less"));
    expect(getProgress(s).passed).toBe(2);
    expect(unitProgress(getUnit("week-1")!, s.attempts)).toEqual({
      passed: 1,
      total: 3,
    });
  });

  it("records pending submissions without passing the group", () => {
    const s = state();
    s.attempts = [attempt("week-0-scratch", null, 17, "pending")];
    expect(getProgress(s)).toMatchObject({
      submitted: 1,
      passed: 0,
      percent: 0,
    });
  });

  it("uses 70 as the inclusive score threshold", () => {
    const s = state();
    s.attempts = [attempt("week-0-scratch", 69)];
    expect(getProgress(s).passed).toBe(0);
    s.attempts.push(attempt("week-0-scratch", 70, 18));
    expect(getProgress(s).passed).toBe(1);
    expect(getProgress(s).percent).toBeCloseTo(3.5714285714);
  });

  it("supports explicitly self-reported passing results without a numeric score", () => {
    const s = state();
    s.attempts = [attempt("week-0-scratch", null)];
    expect(getProgress(s).passed).toBe(1);
    s.attempts = [attempt("week-0-scratch", null, 17, "revision")];
    expect(getProgress(s).passed).toBe(0);
  });

  it("uses the latest timestamp rather than array order and preserves both alternative histories", () => {
    const passing = attempt("week-1-mario-less", 90, 17);
    const failing = attempt("week-1-mario-less", 69, 19);
    const challenge = attempt("week-1-mario-more", 70, 18);
    const attempts = [failing, passing, challenge];
    expect(latestAttempt("week-1-mario-less", attempts)).toBe(failing);
    expect(groupPassed(getUnit("week-1")!.groups[1]!, [passing, failing])).toBe(
      false,
    );
    expect(groupPassed(getUnit("week-1")!.groups[1]!, attempts)).toBe(true);
    expect(attempts).toEqual([failing, passing, challenge]);
    expect(
      groupPassed(getUnit("week-1")!.groups[1]!, [
        ...attempts,
        attempt("week-1-mario-more", null, 20, "pending"),
      ]),
    ).toBe(false);
  });

  it("recalculates after editing or deleting the effective latest attempt", () => {
    const s = state();
    s.attempts = [
      attempt("week-0-scratch", 95),
      attempt("week-0-scratch", 40, 18),
    ];
    expect(getProgress(s).passed).toBe(0);
    s.attempts.pop();
    expect(getProgress(s).passed).toBe(1);
    s.attempts[0] = attempt("week-0-scratch", 20);
    expect(getProgress(s).passed).toBe(0);
  });

  it("resolves equal timestamps to the last recorded attempt consistently", () => {
    const earlier = attempt("week-0-scratch", 95);
    const later = attempt("week-0-scratch", 20);
    expect(latestAttempt("week-0-scratch", [earlier, later])).toBe(later);
  });

  it("leaves 27 of 28 complete until the project result passes", () => {
    const s = state();
    passProblemSets(s);
    s.milestones = Object.fromEntries(
      projectMilestones.map((milestone) => [milestone.id, true]),
    );
    expect(getProgress(s)).toMatchObject({
      passed: 27,
      total: 28,
      submitted: 27,
    });
    s.attempts.push(attempt("project", null, 17, "pending"));
    expect(getProgress(s)).toMatchObject({ passed: 27, submitted: 28 });
    s.attempts.push(attempt("project", 70, 18));
    expect(getProgress(s)).toMatchObject({
      passed: 28,
      total: 28,
      submitted: 28,
      percent: 100,
    });
  });

  it("ignores unknown IDs and mismatched session tasks", () => {
    const s = state();
    s.resources = { unknown: true, "week-0-lecture": false };
    s.attempts = [attempt("unknown")];
    s.sessions = [
      session("unknown", "week-0", 300),
      session("week-0-lecture", "unknown", 400),
      session("week-0-lecture", "week-1", 500),
      session("scope", "project", 600),
    ];
    expect(latestAttempt("unknown", s.attempts)).toBeUndefined();
    expect(getProgress(s)).toEqual({
      passed: 0,
      total: 28,
      percent: 0,
      submitted: 0,
      resourcesCompleted: 0,
      resourcesTotal: 65,
      studySeconds: 600,
    });
  });
});

describe("next suggested task", () => {
  it("offers the first lecture, then the first assignment without changing completion", () => {
    const s = state();
    expect(nextTask(s)).toEqual({
      id: "week-0-lecture",
      unitId: "week-0",
      title: "Scratch lecture",
      url: "https://cs50.harvard.edu/x/2026/weeks/0/",
      kind: "lecture",
    });
    s.resources["week-0-lecture"] = true;
    expect(nextTask(s)?.id).toBe("week-0-scratch");
    expect(getProgress(s).passed).toBe(0);
    s.attempts.push(attempt("week-0-scratch"));
    expect(nextTask(s)?.id).toBe("week-1-lecture");
  });

  it("keeps supporting sections and shorts optional when suggesting required assignments", () => {
    const s = state();
    s.attempts = [attempt("week-0-scratch")];
    s.resources["week-1-lecture"] = true;
    expect(nextTask(s)).toMatchObject({
      id: "week-1-hello",
      kind: "assignment",
    });
    expect(s.resources["week-1-section"]).toBeUndefined();
    expect(s.resources["week-1-short-data-types"]).toBeUndefined();
  });

  it("defaults to standard Mario and continues an attempted challenge without clearing history", () => {
    const s = state();
    s.resources = Object.fromEntries(
      allResources.map((resource) => [resource.id, true]),
    );
    s.attempts = [attempt("week-0-scratch"), attempt("week-1-hello")];
    expect(nextTask(s)?.id).toBe("week-1-mario-less");
    s.attempts.push(attempt("week-1-mario-more", 50, 18));
    expect(nextTask(s)?.id).toBe("week-1-mario-more");
    expect(s.attempts).toHaveLength(3);
  });

  it("skips optional resources for a passed unit and keeps week 10 lecture separate from the project", () => {
    const s = state();
    passProblemSets(s);
    expect(nextTask(s)?.id).toBe("week-10-lecture");
    s.resources["week-10-lecture"] = true;
    expect(nextTask(s)).toMatchObject({
      id: "project",
      unitId: "project",
      kind: "project",
    });
    s.attempts.push(attempt("project"));
    expect(nextTask(s)).toBeNull();
  });
});
