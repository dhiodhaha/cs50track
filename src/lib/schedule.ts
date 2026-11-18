import { getUnit } from "./course";
import type { AppState, RecoveryProposal, Settings, StudyBlock } from "./model";
import { unitProgress } from "./progress";
import { sessionSeconds } from "./sessions";

export const defaultSettings: Settings = {
  startDate: "2026-11-17",
  timezone: "Asia/Jakarta",
  weekdayStart: "09:00",
  weekdayMinutes: 240,
  breakStart: "11:00",
  breakMinutes: 30,
  saturdayStart: "09:00",
  saturdayMinutes: 150,
};

export function dateInZone(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) =>
    parts.find((item) => item.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function addDays(date: string, days: number): string {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== date ||
    !Number.isInteger(days)
  ) {
    throw new Error("Use a valid calendar date and a whole number of days.");
  }
  return new Date(timestamp + days * 86_400_000).toISOString().slice(0, 10);
}

export function getPlanWeek(date: string, start: string): number {
  return Math.max(
    1,
    Math.floor(
      (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
        604_800_000,
    ) + 1,
  );
}

const minutes = (time: string) =>
  Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const clock = (value: number) =>
  `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`;
const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
const order = (a: StudyBlock, b: StudyBlock) =>
  a.date.localeCompare(b.date) || a.start.localeCompare(b.start);
type Window = { start: number; minutes: number };

function windows(
  settings: Settings,
  date: string,
  includeSaturday: boolean,
): Window[] {
  const day = weekday(date);
  if (day === 0) return [];
  if (day === 6) {
    if (!includeSaturday || settings.saturdayMinutes === 0) return [];
    const start = minutes(settings.saturdayStart);
    if (start + settings.saturdayMinutes > 1440)
      throw new Error("Study availability must end within its calendar day.");
    return [{ start, minutes: settings.saturdayMinutes }];
  }
  let start = minutes(settings.weekdayStart);
  let remaining = settings.weekdayMinutes;
  const pause = minutes(settings.breakStart);
  const result: Window[] = [];
  if (start < pause && remaining > 0) {
    const size = Math.min(remaining, pause - start);
    result.push({ start, minutes: size });
    start += size;
    remaining -= size;
  }
  if (remaining > 0) {
    if (start >= pause && start < pause + settings.breakMinutes)
      start = pause + settings.breakMinutes;
    result.push({ start, minutes: remaining });
  }
  if (result.some((window) => window.start + window.minutes > 1440))
    throw new Error("Study availability must end within its calendar day.");
  return result;
}

type Allocation = {
  unitId: string;
  minutes: number;
  title?: string;
  kind?: StudyBlock["kind"];
};
const allocations: Allocation[][] = [
  [
    { unitId: "week-0", minutes: 300 },
    { unitId: "week-1", minutes: 900 },
  ],
  [{ unitId: "week-2", minutes: 1200 }],
  [{ unitId: "week-3", minutes: 1200 }],
  [{ unitId: "week-4", minutes: 1200 }],
  [{ unitId: "week-5", minutes: 1200 }],
  [{ unitId: "week-6", minutes: 1200 }],
  [
    { unitId: "week-7", minutes: 960 },
    { unitId: "project", minutes: 240, title: "Scope", kind: "project" },
  ],
  [
    { unitId: "week-8", minutes: 960 },
    { unitId: "project", minutes: 240, title: "Prototype", kind: "project" },
  ],
  [
    { unitId: "week-9", minutes: 840 },
    { unitId: "project", minutes: 360, title: "Build", kind: "project" },
  ],
  [
    { unitId: "week-10", minutes: 120 },
    {
      unitId: "project",
      minutes: 1080,
      title: "Finish, document, demonstrate, and submit",
      kind: "project",
    },
  ],
];

function segments(allocation: Allocation): Required<Allocation>[] {
  if (allocation.title)
    return [
      {
        ...allocation,
        title: allocation.title,
        kind: allocation.kind ?? "project",
      },
    ];
  const unit = getUnit(allocation.unitId);
  if (!unit) throw new Error(`Missing course unit ${allocation.unitId}`);
  let remaining = allocation.minutes;
  const result: Required<Allocation>[] = [];
  for (const resource of unit.resources) {
    const size = Math.min(
      remaining,
      Math.max(30, Math.round(resource.minutes / 30) * 30),
    );
    if (size > 0)
      result.push({
        unitId: unit.id,
        minutes: size,
        title: resource.title,
        kind: "lecture",
      });
    remaining -= size;
  }
  if (remaining > 0)
    result.push({
      unitId: unit.id,
      minutes: remaining,
      title: `${unit.title} · Assignment work`,
      kind: "practice",
    });
  return result;
}

/** Project ordered course allocations into the accepted weekday study windows. */
export function createPlan(settings: Settings): AppState["plan"] {
  const blocks: StudyBlock[] = [];
  const queue = allocations
    .flatMap((week) => week.flatMap(segments))
    .map((item) => ({ ...item }));
  let date = settings.startDate;
  let index = 0;
  while (index < queue.length) {
    for (const window of windows(settings, date, false)) {
      let available = window.minutes;
      let start = window.start;
      while (available > 0 && index < queue.length) {
        const segment = queue[index]!;
        const size = Math.min(segment.minutes, available);
        blocks.push({
          id: crypto.randomUUID(),
          date,
          start: clock(start),
          minutes: size,
          unitId: segment.unitId,
          title: segment.title,
          kind: segment.kind,
          status: "planned",
        });
        available -= size;
        start += size;
        segment.minutes -= size;
        if (segment.minutes === 0) index++;
      }
    }
    if (index < queue.length) date = addDays(date, 1);
  }
  return {
    version: 1,
    startDate: settings.startDate,
    targetDate:
      date > addDays(settings.startDate, 69)
        ? date
        : addDays(settings.startDate, 69),
    timezone: settings.timezone,
    blocks,
  };
}

export function createInitialState(): AppState {
  const settings = { ...defaultSettings };
  return {
    schemaVersion: 1,
    settings,
    resources: {},
    attempts: [],
    sessions: [],
    activeTaskId: null,
    activeSessionId: null,
    sessionRecoveryId: null,
    blockers: {},
    milestones: {},
    plan: createPlan(settings),
    planHistory: [],
    taskEstimates: {},
  };
}

export function blocksForDate(state: AppState, date: string): StudyBlock[] {
  return state.plan.blocks.filter((block) => block.date === date).sort(order);
}

function workComplete(state: AppState, block: StudyBlock): boolean {
  const unit = getUnit(block.unitId);
  if (!unit) return false;
  const resource = unit.resources.find((item) => item.title === block.title);
  if (resource) return state.resources[resource.id] === true;
  const progress = unitProgress(unit, state.attempts);
  if (progress.total > 0 && progress.passed === progress.total) return true;
  const milestone = (
    { Scope: "scope", Prototype: "prototype", Build: "build" } as Record<
      string,
      string
    >
  )[block.title];
  return !!milestone && state.milestones[milestone] === true;
}

function localMinute(now: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  return (
    Number(parts.find((part) => part.type === "hour")!.value) * 60 +
    Number(parts.find((part) => part.type === "minute")!.value)
  );
}

function revision(state: AppState): string {
  return JSON.stringify([
    state.settings,
    state.plan,
    state.resources,
    state.attempts,
    state.sessions,
    state.milestones,
    state.taskEstimates,
  ]);
}

/** Subtract occupied intervals, including completed blocks, from real availability. */
function freeWindows(
  settings: Settings,
  date: string,
  occupied: StudyBlock[],
  earliest: number,
  includeSaturday = true,
): Window[] {
  let free = windows(settings, date, includeSaturday)
    .map((window) => ({
      start: Math.max(window.start, earliest),
      minutes: window.start + window.minutes - Math.max(window.start, earliest),
    }))
    .filter((window) => window.minutes > 0);
  for (const block of occupied.filter(
    (item) => item.date === date && item.status !== "skipped",
  )) {
    const start = minutes(block.start);
    const end = start + block.minutes;
    free = free.flatMap((window) => {
      const windowEnd = window.start + window.minutes;
      if (end <= window.start || start >= windowEnd) return [window];
      return [
        ...(start > window.start
          ? [{ start: window.start, minutes: start - window.start }]
          : []),
        ...(end < windowEnd ? [{ start: end, minutes: windowEnd - end }] : []),
      ];
    });
  }
  return free;
}

export function updateAvailability(
  state: AppState,
  settings: Settings,
  now: Date,
): AppState {
  if (
    (Object.keys(settings) as (keyof Settings)[]).every(
      (key) => settings[key] === state.settings[key],
    )
  )
    return state;
  for (let day = 0; day < 7; day++)
    windows(settings, addDays(settings.startDate, day), true);
  const oldToday = dateInZone(now, state.plan.timezone);
  const oldMinute = localMinute(now, state.plan.timezone);
  const fixed = state.plan.blocks.filter(
    (block) =>
      block.status !== "planned" ||
      block.date < oldToday ||
      (block.date === oldToday && minutes(block.start) < oldMinute),
  );
  const fixedIds = new Set(fixed.map((block) => block.id));
  const remaining = state.plan.blocks
    .filter((block) => !fixedIds.has(block.id))
    .sort(order);
  const today = dateInZone(now, settings.timezone);
  const earliest = localMinute(now, settings.timezone);
  const blocks = [...fixed];
  const version = state.plan.version + 1;
  let date = settings.startDate > today ? settings.startDate : today;
  for (const source of remaining) {
    let left = source.minutes;
    let part = 0;
    const saturdayOnly =
      source.kind === "catchup" && settings.saturdayMinutes > 0;
    while (left > 0) {
      const free =
        saturdayOnly && weekday(date) !== 6
          ? []
          : freeWindows(
              settings,
              date,
              blocks,
              date === today ? earliest : 0,
              saturdayOnly,
            );
      const window = free[0];
      if (!window) {
        date = addDays(date, 1);
        continue;
      }
      const size = Math.min(left, window.minutes);
      blocks.push({
        ...source,
        id:
          part === 0
            ? source.id
            : `${source.id}:availability-${version}-${part}`,
        date,
        start: clock(window.start),
        minutes: size,
      });
      left -= size;
      part++;
    }
  }
  blocks.sort(order);
  const lastDate = blocks.at(-1)?.date ?? state.plan.targetDate;
  return {
    ...state,
    settings: { ...settings },
    plan: {
      ...state.plan,
      version,
      timezone: settings.timezone,
      startDate: settings.startDate,
      targetDate:
        lastDate > state.plan.targetDate ? lastDate : state.plan.targetDate,
      blocks,
    },
    planHistory: [...state.planHistory, state.plan].slice(-100),
  };
}

export function createRecoveryProposal(
  state: AppState,
  now: Date,
  extraMinutes = 0,
): RecoveryProposal | null {
  if (
    !Number.isInteger(extraMinutes) ||
    extraMinutes < 0 ||
    extraMinutes > 36_000
  )
    throw new Error(
      "Enter a whole, nonnegative additional minute estimate up to 600 hours.",
    );
  const today = dateInZone(now, state.plan.timezone);
  const nowMinute = localMinute(now, state.plan.timezone);
  const ended = (block: StudyBlock) =>
    block.date < today ||
    (block.date === today && minutes(block.start) + block.minutes <= nowMinute);
  const upcoming = (block: StudyBlock) =>
    block.date > today ||
    (block.date === today && minutes(block.start) >= nowMinute);
  const sorted = [...state.plan.blocks].sort(order);
  const removed = sorted.filter(
    (block) => block.status === "planned" && workComplete(state, block),
  );
  const removedIds = new Set(removed.map((block) => block.id));
  // Credit each date/unit once. Earlier historical sessions cannot erase a later accepted catch-up block.
  const recorded = new Map<string, number>();
  for (const session of state.sessions) {
    const key = `${dateInZone(new Date(session.startedAt), state.plan.timezone)}:${session.unitId}`;
    recorded.set(
      key,
      (recorded.get(key) ?? 0) + sessionSeconds(session, now) / 60,
    );
  }
  const deficit: { source: StudyBlock; minutes: number }[] = [];
  for (const block of sorted) {
    if (!ended(block) || removedIds.has(block.id) || block.status === "skipped")
      continue;
    const key = `${block.date}:${block.unitId}`;
    const credit = Math.min(block.minutes, recorded.get(key) ?? 0);
    recorded.set(key, Math.max(0, (recorded.get(key) ?? 0) - credit));
    if (block.status === "done") continue;
    const missing = Math.ceil(block.minutes - credit);
    if (missing > 0) {
      deficit.push({ source: block, minutes: missing });
      removed.push(block);
      removedIds.add(block.id);
    }
  }
  if (extraMinutes > 0) {
    const task =
      sorted.find(
        (block) => block.status === "planned" && !workComplete(state, block),
      ) ?? sorted.at(-1);
    if (task)
      deficit.push({
        source: {
          ...task,
          id: `estimate-${state.plan.version}`,
          date: today,
          title: `${task.title} · Additional estimate`,
        },
        minutes: extraMinutes,
      });
  }
  const deficitMinutes = deficit.reduce((sum, item) => sum + item.minutes, 0);
  if (deficitMinutes === 0 && removed.length === 0) return null;
  const added: StudyBlock[] = [];
  const moved: RecoveryProposal["moved"] = [];
  let accepted = sorted.filter((block) => !removedIds.has(block.id));
  let sequence = 0;
  const replacement = (
    source: StudyBlock,
    date: string,
    start: number,
    size: number,
  ): StudyBlock => ({
    ...source,
    id: `${source.id}:recovery-${state.plan.version + 1}-${sequence++}`,
    date,
    start: clock(start),
    minutes: size,
    kind: weekday(date) === 6 ? "catchup" : source.kind,
    status: "planned",
  });
  // Reserve the next actual Saturday first. A later course unit is a dependency boundary.
  let saturday = today < state.plan.startDate ? state.plan.startDate : today;
  while (weekday(saturday) !== 6) saturday = addDays(saturday, 1);
  if (
    saturday === today &&
    nowMinute >=
      minutes(state.settings.saturdayStart) + state.settings.saturdayMinutes
  )
    saturday = addDays(saturday, 7);
  for (const item of deficit) {
    const index = getUnit(item.source.unitId)?.index ?? 99;
    const dependent = accepted.find(
      (block) =>
        block.status === "planned" &&
        upcoming(block) &&
        (getUnit(block.unitId)?.index ?? 99) > index,
    );
    const beforeDependency =
      !dependent ||
      saturday < dependent.date ||
      (saturday === dependent.date &&
        minutes(state.settings.saturdayStart) < minutes(dependent.start));
    if (!beforeDependency || saturday > state.plan.targetDate) break;
    for (const window of freeWindows(
      state.settings,
      saturday,
      [...accepted, ...added],
      saturday === today ? nowMinute : 0,
    )) {
      const size = Math.min(item.minutes, window.minutes);
      if (size <= 0) continue;
      added.push(replacement(item.source, saturday, window.start, size));
      item.minutes -= size;
    }
    if (item.minutes > 0) break;
  }
  const overflow = deficit.filter((item) => item.minutes > 0);
  if (overflow.length > 0) {
    // Move only unfinished future segments. Historical and completed blocks remain fixed.
    const future = accepted.filter(
      (block) =>
        block.status === "planned" &&
        block.kind !== "catchup" &&
        upcoming(block),
    );
    const futureIds = new Set(future.map((block) => block.id));
    accepted = accepted.filter((block) => !futureIds.has(block.id));
    const queue = [
      ...overflow,
      ...future.map((source) => ({ source, minutes: source.minutes })),
    ];
    let date =
      today < state.settings.startDate ? state.settings.startDate : today;
    for (const item of queue) {
      let first = true;
      while (item.minutes > 0) {
        const free = freeWindows(
          state.settings,
          date,
          [...accepted, ...added],
          date === today ? nowMinute : 0,
        );
        if (free.length === 0) {
          date = addDays(date, 1);
          continue;
        }
        const window = free[0]!;
        const size = Math.min(item.minutes, window.minutes);
        const block = replacement(item.source, date, window.start, size);
        if (futureIds.has(item.source.id) && first) {
          block.id = item.source.id;
          if (
            block.date !== item.source.date ||
            block.start !== item.source.start ||
            block.minutes !== item.source.minutes ||
            block.kind !== item.source.kind
          )
            moved.push({ before: item.source, after: block });
          accepted.push(block);
        } else added.push(block);
        first = false;
        item.minutes -= size;
      }
    }
  }
  const blocks = [...accepted, ...added].sort(order);
  const lastDate = blocks.at(-1)?.date ?? state.plan.targetDate;
  const targetDate =
    lastDate > state.plan.targetDate ? lastDate : state.plan.targetDate;
  return {
    baseVersion: state.plan.version,
    baseRevision: revision(state),
    plan: {
      ...state.plan,
      version: state.plan.version + 1,
      targetDate,
      blocks,
    },
    added,
    moved,
    removed,
    deficitMinutes,
    reason: `${deficitMinutes} minutes of missed study or additional estimated work. Use available Saturday reserve first; review any moves and the target date before applying.`,
  };
}

export function applyRecovery(
  state: AppState,
  proposal: RecoveryProposal,
): AppState {
  if (
    state.plan.version === proposal.plan.version &&
    JSON.stringify(state.plan) === JSON.stringify(proposal.plan)
  )
    return state;
  if (
    state.plan.version !== proposal.baseVersion ||
    revision(state) !== proposal.baseRevision
  )
    throw new Error(
      "This proposal is stale. Recompute it using the latest progress and availability.",
    );
  return {
    ...state,
    planHistory: [...state.planHistory, state.plan].slice(-100),
    plan: proposal.plan,
  };
}
