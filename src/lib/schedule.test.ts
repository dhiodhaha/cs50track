import { describe, expect, it } from "vitest";
import { appStateSchema } from "./model";
import type { AppState, StudyBlock } from "./model";
import {
  addDays,
  applyRecovery,
  blocksForDate,
  createInitialState,
  createPlan,
  createRecoveryProposal,
  dateInZone,
  defaultSettings,
  getPlanWeek,
  updateAvailability,
} from "./schedule";

const sum = (blocks: StudyBlock[]) =>
  blocks.reduce((total, block) => total + block.minutes, 0);
const block = (
  id: string,
  date = "2026-11-20",
  start = "09:00",
  size = 120,
  unitId = "week-1",
): StudyBlock => ({
  id,
  date,
  start,
  minutes: size,
  unitId,
  title: "Assignment work",
  kind: "practice",
  status: "planned",
});
function stateWith(blocks: StudyBlock[]): AppState {
  const state = createInitialState();
  return { ...state, plan: { ...state.plan, blocks } };
}
const fridayReview = new Date("2026-11-20T07:00:00Z"); // 14:00 Jakarta

describe("accepted initial plan", () => {
  it("has ten Tuesday–Monday periods, 200 study hours, 32 project hours, and the exact original target", () => {
    const state = createInitialState();
    expect(appStateSchema.safeParse(state).success).toBe(true);
    expect(state.plan.startDate).toBe("2026-11-17");
    expect(state.plan.targetDate).toBe("2027-01-25");
    expect(state.plan.timezone).toBe("Asia/Jakarta");
    expect(sum(state.plan.blocks)).toBe(12_000);
    expect(
      sum(state.plan.blocks.filter((item) => item.unitId === "project")),
    ).toBe(1920);
    for (let week = 1; week <= 10; week++) {
      const blocks = state.plan.blocks.filter(
        (item) => getPlanWeek(item.date, state.plan.startDate) === week,
      );
      expect(sum(blocks)).toBe(1200);
    }
    const firstWeek = state.plan.blocks.filter(
      (item) => getPlanWeek(item.date, state.plan.startDate) === 1,
    );
    expect(sum(firstWeek.filter((item) => item.unitId === "week-0"))).toBe(300);
    expect(sum(firstWeek.filter((item) => item.unitId === "week-1"))).toBe(900);
    expect(
      firstWeek.findIndex((item) => item.unitId === "week-1"),
    ).toBeGreaterThan(
      firstWeek.map((item) => item.unitId).lastIndexOf("week-0"),
    );
    let saturdayCount = 0;
    for (
      let day = state.plan.startDate;
      day <= state.plan.targetDate;
      day = addDays(day, 1)
    ) {
      if (new Date(`${day}T00:00:00Z`).getUTCDay() === 6) saturdayCount++;
    }
    expect(saturdayCount * state.settings.saturdayMinutes).toBe(1500);
  });

  it("splits at the break and unit boundary, reserving every Saturday and Sunday", () => {
    const state = createInitialState();
    expect(sum(blocksForDate(state, "2026-11-17"))).toBe(240);
    expect(blocksForDate(state, "2026-11-21")).toEqual([]);
    expect(blocksForDate(state, "2026-11-22")).toEqual([]);
    for (const item of state.plan.blocks) {
      const start =
        Number(item.start.slice(0, 2)) * 60 + Number(item.start.slice(3));
      expect(start + item.minutes <= 660 || start >= 690).toBe(true);
      expect(start).toBeGreaterThanOrEqual(540);
      expect(start + item.minutes).toBeLessThanOrEqual(810);
      expect([0, 6]).not.toContain(
        new Date(`${item.date}T00:00:00Z`).getUTCDay(),
      );
    }
    const wednesday = blocksForDate(state, "2026-11-18");
    expect(
      wednesday
        .filter((item) => item.unitId === "week-0")
        .reduce((total, item) => total + item.minutes, 0),
    ).toBe(60);
    expect(wednesday.find((item) => item.unitId === "week-1")?.start).toBe(
      "10:00",
    );
  });

  it("keeps the complete workload and extends when availability is reduced", () => {
    const plan = createPlan({ ...defaultSettings, weekdayMinutes: 120 });
    expect(sum(plan.blocks)).toBe(12_000);
    expect(plan.targetDate).toBe("2027-04-05");
  });

  it("uses calendar arithmetic across the year and the saved timezone", () => {
    expect(dateInZone(new Date("2026-11-16T17:01:00Z"), "Asia/Jakarta")).toBe(
      "2026-11-17",
    );
    expect(
      dateInZone(new Date("2026-11-16T17:01:00Z"), "America/New_York"),
    ).toBe("2026-11-16");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-01-01", -1)).toBe("2026-12-31");
    expect(getPlanWeek("2026-11-23", "2026-11-17")).toBe(1);
    expect(getPlanWeek("2026-11-24", "2026-11-17")).toBe(2);
    expect(getPlanWeek("2026-11-01", "2026-11-17")).toBe(1);
    expect(() => addDays("2026-02-30", 1)).toThrow();
  });
});

describe("reviewed recovery", () => {
  it("moves a missed two-hour block into the actual next Saturday and leaves 30 minutes reserved", () => {
    const state = stateWith([block("missed")]);
    const original = structuredClone(state);
    const proposal = createRecoveryProposal(state, fridayReview)!;
    expect(state).toEqual(original);
    expect(proposal.deficitMinutes).toBe(120);
    expect(proposal.added).toMatchObject([
      { date: "2026-11-21", start: "09:00", minutes: 120, kind: "catchup" },
    ]);
    expect(defaultSettings.saturdayMinutes - sum(proposal.added)).toBe(30);
    expect(proposal.plan.targetDate).toBe("2027-01-25");
    expect(createRecoveryProposal(state, fridayReview)).toEqual(proposal);
  });

  it("fills 150 minutes for a four-hour deficit and previews later moves for the remaining 90", () => {
    const completed = {
      ...block("done", "2026-11-19"),
      status: "done" as const,
    };
    const state = stateWith([
      completed,
      block("missed-a"),
      block("missed-b", "2026-11-20", "11:30"),
      block("later", "2026-11-23"),
      block("arrays", "2026-11-24", "09:00", 120, "week-2"),
    ]);
    const proposal = createRecoveryProposal(state, fridayReview)!;
    expect(proposal.deficitMinutes).toBe(240);
    expect(
      sum(proposal.added.filter((item) => item.date === "2026-11-21")),
    ).toBe(150);
    expect(proposal.moved.length).toBeGreaterThan(0);
    expect(proposal.plan.blocks.find((item) => item.id === "done")).toEqual(
      completed,
    );
    expect(sum(proposal.plan.blocks)).toBe(sum(state.plan.blocks));
    expect(
      proposal.plan.blocks.every(
        (item) => new Date(`${item.date}T00:00:00Z`).getUTCDay() !== 0,
      ),
    ).toBe(true);
  });

  it("subtracts already accepted Saturday capacity and never schedules a past Saturday", () => {
    const reserved = {
      ...block("reserved", "2026-11-21", "09:00", 90),
      kind: "catchup" as const,
    };
    const proposal = createRecoveryProposal(
      stateWith([block("missed"), reserved]),
      fridayReview,
    )!;
    expect(
      proposal.added.filter((item) => item.date === "2026-11-21"),
    ).toMatchObject([{ start: "10:30", minutes: 60 }]);
    expect(
      sum(proposal.plan.blocks.filter((item) => item.date === "2026-11-21")),
    ).toBe(150);
    const later = createRecoveryProposal(
      stateWith([block("missed")]),
      new Date("2026-11-21T06:00:00Z"),
    )!;
    expect(later.added[0]?.date).toBe("2026-11-28");
  });

  it("shifts work when the next Saturday would come after a dependent course unit", () => {
    const state = stateWith([
      block("missed", "2026-11-17", "09:00", 120, "week-0"),
      block("dependent", "2026-11-18", "09:00", 120, "week-1"),
    ]);
    const proposal = createRecoveryProposal(
      state,
      new Date("2026-11-17T07:00:00Z"),
    )!;
    const chronological = proposal.plan.blocks;
    expect(chronological[0]?.unitId).toBe("week-0");
    expect(chronological[1]?.unitId).toBe("week-1");
    expect(proposal.moved.map((item) => item.before.id)).toContain("dependent");
  });

  it("keeps an earlier backlog ahead of later units when both need recovery", () => {
    const state = stateWith([
      block("scratch-missed", "2026-11-17", "09:00", 240, "week-0"),
      block("c-missed", "2026-11-18", "09:00", 120, "week-1"),
      block("c-next", "2026-11-23", "09:00", 120, "week-1"),
    ]);
    const proposal = createRecoveryProposal(state, fridayReview)!;
    const units = proposal.plan.blocks.map((item) => item.unitId);
    expect(units.indexOf("week-1")).toBeGreaterThan(
      units.lastIndexOf("week-0"),
    );
  });

  it("releases a completed resource after its segment has become Saturday catch-up", () => {
    const state = createInitialState();
    const resourceBlock = state.plan.blocks.find(
      (item) => item.unitId === "week-0" && item.kind === "lecture",
    )!;
    state.plan.blocks = [
      { ...resourceBlock, date: "2026-11-21", start: "09:00", kind: "catchup" },
    ];
    state.resources["week-0-lecture"] = true;
    const proposal = createRecoveryProposal(
      state,
      new Date("2026-11-21T06:00:00Z"),
    )!;
    expect(proposal.deficitMinutes).toBe(0);
    expect(proposal.plan.blocks).toEqual([]);
  });

  it("preserves passed results, removes their unfinished practice allocation, and does not equate time with passing", () => {
    const state = stateWith([
      block("scratch", "2026-11-20", "09:00", 120, "week-0"),
    ]);
    state.attempts.push({
      id: "result",
      assignmentId: "week-0-scratch",
      kind: "passed",
      score: 90,
      submittedAt: "2026-11-20T06:00:00Z",
      note: "",
      url: "",
    });
    const proposal = createRecoveryProposal(state, fridayReview)!;
    expect(proposal.deficitMinutes).toBe(0);
    expect(proposal.removed.map((item) => item.id)).toContain("scratch");
    expect(applyRecovery(state, proposal).attempts).toEqual(state.attempts);
  });

  it("applies atomically, retains history, rejects changed progress, and is idempotent after application", () => {
    const state = stateWith([block("missed")]);
    const proposal = createRecoveryProposal(state, fridayReview)!;
    const accepted = applyRecovery(state, proposal);
    expect(accepted.planHistory).toEqual([state.plan]);
    expect(accepted.plan.version).toBe(state.plan.version + 1);
    expect(applyRecovery(accepted, proposal)).toBe(accepted);
    expect(createRecoveryProposal(accepted, fridayReview)).toBeNull();
    expect(() =>
      applyRecovery({ ...state, resources: { lecture: true } }, proposal),
    ).toThrow(/stale/);
    expect(() =>
      applyRecovery(
        { ...state, plan: { ...state.plan, version: 10 } },
        proposal,
      ),
    ).toThrow(/stale/);
    expect(() =>
      applyRecovery(
        { ...state, settings: { ...state.settings, saturdayMinutes: 60 } },
        proposal,
      ),
    ).toThrow(/stale/);
  });

  it("does not credit a previous date session again against an accepted catch-up block", () => {
    const state = stateWith([block("missed")]);
    state.sessions.push({
      id: "session",
      taskId: "hello",
      unitId: "week-1",
      label: "C",
      status: "finished",
      startedAt: "2026-11-20T02:00:00Z",
      endedAt: "2026-11-20T03:00:00Z",
      segmentStartedAt: null,
      lastHeartbeatAt: "2026-11-20T03:00:00Z",
      elapsedSeconds: 3600,
      manual: true,
    });
    const first = createRecoveryProposal(state, fridayReview)!;
    expect(first.deficitMinutes).toBe(60);
    const accepted = applyRecovery(state, first);
    expect(
      createRecoveryProposal(accepted, new Date("2026-11-21T06:00:00Z"))
        ?.deficitMinutes,
    ).toBe(60);
  });

  it("shows extensions and explicit extra estimates without changing required progress", () => {
    const state = stateWith([block("missed")]);
    state.plan.targetDate = "2026-11-20";
    const proposal = createRecoveryProposal(state, fridayReview, 120)!;
    expect(proposal.deficitMinutes).toBe(240);
    expect(proposal.plan.targetDate > state.plan.targetDate).toBe(true);
    expect(state.attempts).toEqual([]);
    expect(() => createRecoveryProposal(state, fridayReview, -1)).toThrow();
  });

  it("keeps later reviewed plans saveable when the history reaches its storage limit", () => {
    const state = stateWith([block("missed")]);
    state.planHistory = Array.from({ length: 100 }, (_, index) => ({
      ...state.plan,
      version: index,
    }));
    const accepted = applyRecovery(
      state,
      createRecoveryProposal(state, fridayReview)!,
    );
    expect(accepted.planHistory).toHaveLength(100);
    expect(accepted.planHistory[0]?.version).toBe(1);
    expect(accepted.planHistory.at(-1)).toEqual(state.plan);
    expect(appStateSchema.safeParse(accepted).success).toBe(true);
  });
});

describe("availability changes to an existing plan", () => {
  it("does not replace a plan when unchanged settings are saved", () => {
    const original = stateWith([block("missed")]);
    const state = applyRecovery(
      original,
      createRecoveryProposal(original, fridayReview)!,
    );
    expect(updateAvailability(state, { ...state.settings }, fridayReview)).toBe(
      state,
    );
  });

  it("preserves historical, started, done, and skipped blocks and only moves future planned work", () => {
    const historical = block("historical", "2026-11-19");
    const started = block("started", "2026-11-20");
    const done = { ...block("done", "2026-11-24"), status: "done" as const };
    const skipped = {
      ...block("skipped", "2026-11-25"),
      status: "skipped" as const,
    };
    const state = stateWith([
      historical,
      started,
      block("future", "2026-11-23"),
      done,
      skipped,
    ]);
    const changed = updateAvailability(
      state,
      { ...state.settings, weekdayStart: "10:00" },
      new Date("2026-11-20T03:00:00Z"),
    );
    for (const fixed of [historical, started, done, skipped])
      expect(changed.plan.blocks.find((item) => item.id === fixed.id)).toEqual(
        fixed,
      );
    expect(
      changed.plan.blocks.filter((item) => item.id === "future"),
    ).toMatchObject([{ date: "2026-11-20", start: "11:30", minutes: 120 }]);
    expect(sum(changed.plan.blocks)).toBe(600);
    expect(changed.planHistory).toEqual([state.plan]);
    expect(changed.plan.version).toBe(2);
    expect(state.plan.blocks.find((item) => item.id === "future")?.date).toBe(
      "2026-11-23",
    );
  });

  it("retains accepted catch-up and extra work instead of recreating the original workload", () => {
    const state = stateWith([block("missed")]);
    const proposal = createRecoveryProposal(state, fridayReview, 120)!;
    const accepted = applyRecovery(state, proposal);
    const changed = updateAvailability(
      accepted,
      { ...accepted.settings, saturdayMinutes: 60 },
      fridayReview,
    );
    expect(sum(changed.plan.blocks)).toBe(240);
    expect(
      sum(changed.plan.blocks.filter((item) => item.kind === "catchup")),
    ).toBe(150);
    expect(
      changed.plan.blocks
        .filter((item) => item.kind === "catchup")
        .every((item) => new Date(`${item.date}T00:00:00Z`).getUTCDay() === 6),
    ).toBe(true);
    for (const date of new Set(
      changed.plan.blocks
        .filter((item) => item.kind === "catchup")
        .map((item) => item.date),
    )) {
      expect(
        sum(
          changed.plan.blocks.filter(
            (item) => item.date === date && item.kind === "catchup",
          ),
        ),
      ).toBeLessThanOrEqual(60);
    }
    expect(changed.planHistory).toEqual([state.plan, accepted.plan]);
  });

  it("extends the finish for reduced capacity without restarting completed course allocations", () => {
    const state = createInitialState();
    const oldBlocks = state.plan.blocks.filter(
      (item) => item.date < "2026-12-01",
    );
    const changed = updateAvailability(
      state,
      { ...state.settings, weekdayMinutes: 120 },
      new Date("2026-12-01T01:00:00Z"),
    );
    expect(sum(changed.plan.blocks)).toBe(12_000);
    expect(changed.plan.targetDate).toBe("2027-03-22");
    expect(
      changed.plan.blocks.filter((item) => item.date < "2026-12-01"),
    ).toEqual(oldBlocks);
    for (const date of new Set(
      changed.plan.blocks
        .filter((item) => item.date >= "2026-12-01")
        .map((item) => item.date),
    )) {
      expect(
        sum(changed.plan.blocks.filter((item) => item.date === date)),
      ).toBeLessThanOrEqual(120);
    }
  });

  it("moves accepted catch-up to weekday availability when Saturday capacity is removed", () => {
    const state = stateWith([
      { ...block("catchup", "2026-11-21"), kind: "catchup" },
    ]);
    const changed = updateAvailability(
      state,
      { ...state.settings, saturdayMinutes: 0 },
      fridayReview,
    );
    expect(changed.plan.blocks).toMatchObject([
      { id: "catchup", date: "2026-11-23", start: "09:00", minutes: 120 },
    ]);
  });

  it("rejects availability crossing midnight even before a catch-up block exists", () => {
    const state = createInitialState();
    expect(() =>
      updateAvailability(
        state,
        { ...state.settings, saturdayStart: "23:00" },
        fridayReview,
      ),
    ).toThrow(/calendar day/);
    expect(() =>
      updateAvailability(
        state,
        { ...state.settings, weekdayStart: "23:00" },
        fridayReview,
      ),
    ).toThrow(/calendar day/);
  });
});
