import { describe, expect, it } from "vitest";
import { courseUnits } from "./course";
import type { AppState, Attempt, StudySession } from "./model";
import {
  badgeStatus,
  escapeXml,
  publicSummary,
  publicSummarySchema,
  renderBadge,
} from "./public";
import { addDays, createInitialState } from "./schedule";

const now = new Date("2026-11-17T05:00:00.000Z");

function fresh(overrides: Partial<AppState["settings"]> = {}): AppState {
  const base = createInitialState();
  return {
    ...base,
    settings: { ...base.settings, startDate: "2026-11-17", ...overrides },
    study: {
      answers: {},
      recall: {},
      reflections: [],
      exercises: {},
      activeDays: {},
      publicPage: { enabled: true, name: "  Ada  " },
    },
  };
}

function close(unitId: string, submittedAt: string): Attempt[] {
  return courseUnits
    .find((unit) => unit.id === unitId)!
    .groups.map((group) => ({
      id: `${group.id}-${submittedAt}`,
      assignmentId: group.assignments[0]!.id,
      submittedAt,
      kind: "passed" as const,
      score: null,
      url: "",
      note: "",
    }));
}

const closeFirstWeek = (submittedAt: string) => [
  ...close("week-0", submittedAt),
  ...close("week-1", submittedAt),
];

const session = (elapsedSeconds: number, id: string): StudySession => ({
  id,
  taskId: "",
  unitId: "week-1",
  label: "Study",
  startedAt: "2026-11-17T01:00:00.000Z",
  endedAt: "2026-11-17T04:00:00.000Z",
  elapsedSeconds,
  status: "finished",
  segmentStartedAt: null,
  lastHeartbeatAt: "2026-11-17T04:00:00.000Z",
  manual: false,
});

describe("publicSummary", () => {
  it("counts steps, active days and whole minutes, and trims the name", () => {
    const state = fresh();
    state.resources = { a: true, b: false, c: true };
    state.milestones = { m: true, n: false };
    state.study!.activeDays = { "2026-11-17": true, "2026-11-18": false };
    state.sessions = [session(150, "s1"), session(100, "s2")];
    const summary = publicSummary(state, now);
    expect(summary).toMatchObject({
      name: "Ada",
      startDate: "2026-11-17",
      timezone: "Asia/Jakarta",
      targetDate: "2027-01-25",
      today: "2026-11-17",
      stepsDone: 3,
      activeDays: 1,
      studyMinutes: 4,
    });
    expect(summary.weeks).toHaveLength(
      courseUnits.filter((unit) => unit.groups.length > 0).length,
    );
    expect(summary.weeks[0]).toMatchObject({
      status: "current",
      deadline: "2026-11-23",
      closedOn: null,
    });
  });

  it("uses the plan timezone for today", () => {
    const late = new Date("2026-11-17T20:00:00.000Z");
    expect(publicSummary(fresh(), late).today).toBe("2026-11-18");
    expect(
      publicSummary(fresh({ timezone: "America/Los_Angeles" }), late).today,
    ).toBe("2026-11-17");
  });

  it("contains none of the private strings in a state that holds them", () => {
    const state = fresh();
    state.attempts = close("week-1", "2026-11-18T05:00:00.000Z").map(
      (attempt) => ({
        ...attempt,
        note: "SECRET-NOTE stuck on pointers",
        url: "https://private.example/SECRET-URL",
      }),
    );
    state.study!.reflections = [
      {
        id: "r1",
        date: "2026-11-17",
        stepId: "week-1-lecture",
        learned: "SECRET-REFLECTION",
        unclear: "SECRET-UNCLEAR",
      },
    ];
    state.study!.exercises = { "week-1-ex": "SECRET-EXERCISE code" };
    state.blockers = { "week-1": "SECRET-BLOCKER" };
    state.sessions = [{ ...session(60, "s1"), note: "SECRET-SESSION-NOTE" }];
    const text = JSON.stringify(publicSummary(state, now));
    for (const secret of [
      "SECRET",
      "private.example",
      "pointers",
      "owner@",
      "sessions",
      "reflections",
      "exercises",
    ])
      expect(text).not.toContain(secret);
    expect(Object.keys(publicSummary(state, now)).sort()).toEqual([
      "activeDays",
      "name",
      "startDate",
      "stepsDone",
      "studyMinutes",
      "targetDate",
      "timezone",
      "today",
      "weeks",
    ]);
  });

  it("round-trips through the shared schema", () => {
    const summary = publicSummary(fresh(), now);
    expect(
      publicSummarySchema.parse(JSON.parse(JSON.stringify(summary))),
    ).toEqual(summary);
  });
});

describe("badge", () => {
  const at = (days: number) => addDays("2026-11-17", days);
  const summaryOn = (state: AppState, offsetDays: number) =>
    publicSummary(state, new Date(`${at(offsetDays)}T05:00:00.000Z`));

  it("is grey and private without a public record", () => {
    expect(badgeStatus(null)).toEqual({ text: "private", tone: "grey" });
    expect(renderBadge(null)).toContain(">private<");
  });

  it("says on track in green while nothing is overdue", () => {
    expect(badgeStatus(summaryOn(fresh(), 3))).toEqual({
      text: "week 1 of 10 · on track",
      tone: "green",
    });
  });

  it("counts a week closed after its deadline as late, in amber", () => {
    const state = fresh();
    state.attempts = closeFirstWeek(`${at(8)}T05:00:00.000Z`);
    expect(badgeStatus(summaryOn(state, 8))).toEqual({
      text: "week 2 of 10 · 2 late",
      tone: "amber",
    });
  });

  it("counts overdue unclosed weeks as missed, in red, ahead of late", () => {
    const state = fresh();
    state.attempts = closeFirstWeek(`${at(15)}T05:00:00.000Z`);
    expect(badgeStatus(summaryOn(state, 15))).toEqual({
      text: "week 3 of 10 · 1 missed",
      tone: "red",
    });
  });

  it("caps the week at ten and reports complete when every week is closed", () => {
    const state = fresh();
    state.attempts = courseUnits
      .filter((unit) => unit.groups.length > 0)
      .flatMap((unit) => close(unit.id, "2026-11-18T05:00:00.000Z"));
    expect(badgeStatus(summaryOn(state, 0))).toEqual({
      text: "complete",
      tone: "green",
    });
    expect(badgeStatus(summaryOn(fresh(), 200)).text).toMatch(
      /^week 10 of 10 · \d+ missed$/,
    );
  });

  it("renders a small SVG with the label, the value and escaped text", () => {
    const svg = renderBadge(summaryOn(fresh(), 0));
    expect(svg).toMatch(/^<svg [^>]*height="20"/);
    expect(svg).toContain(">CS50x<");
    expect(svg).toContain(">week 1 of 10 · on track<");
    expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org)/);
    expect(escapeXml(`<a href="x">&'</a>`)).toBe(
      "&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;",
    );
  });
});
