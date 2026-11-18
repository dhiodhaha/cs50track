import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allSteps, flowSchema, nextStep, stepDone } from "../lib/flow";
import { createInitialState } from "../lib/schedule";
import { pauseSession } from "../lib/sessions";
import { closeStep, enterStep } from "./session-clock";

const a = { id: "week-1-lecture-p1", unitId: "week-1", title: "A" };
const b = { id: "week-1-lecture-p2", unitId: "week-1", title: "B" };
const t0 = new Date("2026-11-17T01:00:00Z");
const at = (seconds: number) => new Date(t0.getTime() + seconds * 1000);

describe("enterStep", () => {
  it("starts one running timer for the step", () => {
    const state = enterStep(createInitialState(), a, t0);
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0]).toMatchObject({
      taskId: a.id,
      unitId: "week-1",
      status: "running",
    });
  });

  it("resumes the same timer after a pause or reload instead of adding one", () => {
    let state = enterStep(createInitialState(), a, t0);
    state = pauseSession(state, at(60));
    state = enterStep(state, a, at(120));
    expect(state.sessions).toHaveLength(1);
    expect(state.sessions[0]).toMatchObject({
      status: "running",
      elapsedSeconds: 60,
    });
  });

  it("finishes the previous step's timer when the learner moves on", () => {
    let state = enterStep(createInitialState(), a, t0);
    state = enterStep(state, b, at(300));
    expect(state.sessions.map((s) => [s.taskId, s.status])).toEqual([
      [a.id, "finished"],
      [b.id, "running"],
    ]);
    expect(state.activeSessionId).toBe(state.sessions[1]!.id);
  });
});

describe("closeStep", () => {
  const flow = flowSchema.parse(
    JSON.parse(readFileSync("public/course/2026/flow.json", "utf8")),
  );
  const steps = allSteps(flow);
  const first = steps[0]!;
  const context = { today: "2026-11-17", now: at(100), id: "r1" };

  it("completes the step, keeps the reflection and stops the timer in one change", () => {
    const started = enterStep(createInitialState(), first, t0);
    const closed = closeStep(
      flow,
      started,
      first,
      { learned: " Loops repeat. ", unclear: "" },
      context,
    );
    expect(stepDone(first, closed)).toBe(true);
    expect(nextStep(flow, closed)?.id).toBe(steps[1]!.id);
    expect(closed.study?.reflections).toEqual([
      {
        id: "r1",
        date: "2026-11-17",
        stepId: first.id,
        learned: "Loops repeat.",
        unclear: "",
      },
    ]);
    expect(closed.study?.activeDays["2026-11-17"]).toBe(true);
    expect(closed.sessions[0]).toMatchObject({
      status: "finished",
      elapsedSeconds: 100,
    });
  });

  it("stores no reflection when both fields are empty", () => {
    const closed = closeStep(
      flow,
      createInitialState(),
      first,
      { learned: " ", unclear: "" },
      context,
    );
    expect(closed.study?.reflections).toEqual([]);
  });
});
