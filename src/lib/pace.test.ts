import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { courseUnits } from "./course";
import {
  allSteps,
  completeStep,
  flowSchema,
  nextStep,
  stepDone,
  unitStages,
  unitSteps,
} from "./flow";
import type { AppState, Attempt } from "./model";
import { getPace, paceLabel, targetDate, weekRecord } from "./pace";
import { dueRecall, gradeRecall } from "./recall";
import { createInitialState } from "./schedule";

const flow = flowSchema.parse(
  JSON.parse(readFileSync("public/course/2026/flow.json", "utf8")),
);
const fresh = (): AppState => ({
  ...createInitialState(),
  settings: { ...createInitialState().settings, startDate: "2026-11-17" },
});
const pass = (assignmentId: string, date: string): Attempt => ({
  id: `${assignmentId}-${date}`,
  assignmentId,
  submittedAt: `${date}T05:00:00.000Z`,
  kind: "passed",
  score: null,
  url: "",
  note: "",
});
const week1 = courseUnits.find((unit) => unit.id === "week-1")!;

describe("week flow", () => {
  it("orders a week as lecture, section, shorts, then problems", () => {
    const stages = unitSteps(flow, week1).map((step) => step.stage);
    expect([...new Set(stages)]).toEqual([
      "lecture",
      "section",
      "shorts",
      "problems",
    ]);
    expect(stages.filter((stage) => stage === "shorts")).toHaveLength(6);
    expect(stages.filter((stage) => stage === "problems")).toHaveLength(3);
  });

  it("covers the whole lecture with contiguous parts and every notes heading once", () => {
    for (const unit of Object.values(flow.units)) {
      const parts = unit.lecture.parts;
      expect(parts[0]!.start).toBe(0);
      expect(parts.at(-1)!.end).toBe(unit.lecture.durationSeconds);
      for (let i = 1; i < parts.length; i++)
        expect(parts[i]!.start).toBe(parts[i - 1]!.end);
      const ids = parts.flatMap((part) => part.headings.map((h) => h.id));
      expect(new Set(ids).size).toBe(ids.length);
    }
    expect(
      Object.values(flow.units).reduce(
        (sum, unit) =>
          sum + unit.lecture.parts.reduce((n, p) => n + p.headings.length, 0),
        0,
      ),
    ).toBe(157);
  });

  it("starts at the first lecture part and advances as steps finish", () => {
    let state = fresh();
    const first = nextStep(flow, state)!;
    expect(first.id).toBe("week-0-lecture-p1");
    state = completeStep(flow, state, first, "2026-11-17");
    expect(stepDone(first, state)).toBe(true);
    expect(nextStep(flow, state)!.id).toBe("week-0-lecture-p2");
    expect(state.study!.activeDays["2026-11-17"]).toBe(true);
  });

  it("marks the whole lecture watched once its last part is done", () => {
    let state = fresh();
    for (const step of unitSteps(flow, week1).filter(
      (item) => item.stage === "lecture",
    ))
      state = completeStep(flow, state, step, "2026-11-18");
    expect(state.resources["week-1-lecture"]).toBe(true);
  });

  it("treats a lecture ticked in the old tracker as every part done", () => {
    const state = { ...fresh(), resources: { "week-1-lecture": true } };
    const stages = unitStages(flow, week1, state);
    expect(stages[0]).toMatchObject({ stage: "lecture", done: 5, total: 5 });
  });

  it("finishes a problem step only through a passing attempt", () => {
    let state = fresh();
    const problem = unitSteps(flow, week1).find(
      (step) => step.stage === "problems",
    )!;
    state = completeStep(flow, state, problem, "2026-11-18");
    expect(stepDone(problem, state)).toBe(false);
    state = { ...state, attempts: [pass("week-1-hello", "2026-11-19")] };
    expect(stepDone(problem, state)).toBe(true);
  });
});

describe("pace", () => {
  it("ends ten weeks after the start", () => {
    expect(targetDate("2026-11-17")).toBe("2027-01-25");
  });

  it("is on pace on day one with nothing done", () => {
    const pace = getPace(flow, fresh(), "2026-11-17");
    expect(pace.status).toBe("on-pace");
    expect(pace.week).toBe(1);
    expect(pace.deadline).toBe("2026-11-23");
    expect(paceLabel(pace)).toBe("On pace");
  });

  it("falls behind when days pass with nothing done, and says by how much", () => {
    const pace = getPace(flow, fresh(), "2026-11-21");
    expect(pace.status).toBe("behind");
    expect(pace.behindMinutes).toBeGreaterThan(300);
    expect(pace.perDayMinutes).toBe(
      Math.ceil(pace.dueThisWeekMinutes / pace.daysLeftInWeek),
    );
  });

  it("counts finished steps toward the pace", () => {
    let state = fresh();
    for (const step of allSteps(flow).slice(0, 6))
      state = completeStep(flow, state, step, "2026-11-17");
    expect(getPace(flow, state, "2026-11-18").status).not.toBe("behind");
  });
});

describe("weekly record", () => {
  const closeWeek1 = (date: string) => ({
    ...fresh(),
    attempts: ["week-1-hello", "week-1-mario-less", "week-1-cash"].map((id) =>
      pass(id, date),
    ),
  });

  it("records a week closed by its deadline as on time", () => {
    const record = weekRecord(closeWeek1("2026-11-22"), "2026-12-01");
    expect(record.find((row) => row.unitId === "week-1")).toMatchObject({
      status: "on-time",
      closedOn: "2026-11-22",
      deadline: "2026-11-23",
    });
  });

  it("records a week closed after its deadline as late", () => {
    const record = weekRecord(closeWeek1("2026-11-26"), "2026-12-01");
    expect(record.find((row) => row.unitId === "week-1")!.status).toBe("late");
  });

  it("records an open week past its deadline as missed and keeps later weeks upcoming", () => {
    const record = weekRecord(fresh(), "2026-11-25");
    expect(record.find((row) => row.unitId === "week-1")!.status).toBe(
      "missed",
    );
    expect(record.find((row) => row.unitId === "week-2")!.status).toBe(
      "current",
    );
    expect(record.find((row) => row.unitId === "week-3")!.status).toBe(
      "upcoming",
    );
  });
});

describe("recall", () => {
  it("asks new questions first, then spaces them out when answered right", () => {
    let state = fresh();
    expect(dueRecall(state.study, ["a", "b", "c", "d"], "2026-11-17")).toEqual([
      "a",
      "b",
      "c",
    ]);
    state = gradeRecall(state, "a", true, "2026-11-17");
    expect(state.study!.recall.a).toEqual({ level: 0, due: "2026-11-18" });
    state = gradeRecall(state, "a", true, "2026-11-18");
    expect(state.study!.recall.a).toEqual({ level: 1, due: "2026-11-21" });
    expect(dueRecall(state.study, ["a"], "2026-11-20")).toEqual([]);
    expect(dueRecall(state.study, ["a"], "2026-11-21")).toEqual(["a"]);
  });

  it("brings a missed question back the next day", () => {
    let state = gradeRecall(fresh(), "a", true, "2026-11-17");
    state = gradeRecall(state, "a", true, "2026-11-18");
    state = gradeRecall(state, "a", false, "2026-11-21");
    expect(state.study!.recall.a).toEqual({ level: 0, due: "2026-11-22" });
  });
});
