import type { AppState, StudySession } from "./model";

const staleAfterMs = 120_000;

function isStale(session: StudySession, now: Date): boolean {
  return (
    session.status === "running" &&
    now.getTime() - Date.parse(session.lastHeartbeatAt) > staleAfterMs
  );
}

/** Active seconds only. A lost browser is capped at its last saved heartbeat. */
export function sessionSeconds(session: StudySession, now: Date): number {
  if (session.status !== "running" || !session.segmentStartedAt)
    return session.elapsedSeconds;
  const end = isStale(session, now)
    ? Date.parse(session.lastHeartbeatAt)
    : Math.max(now.getTime(), Date.parse(session.lastHeartbeatAt));
  return (
    session.elapsedSeconds +
    Math.max(0, Math.floor((end - Date.parse(session.segmentStartedAt)) / 1000))
  );
}

export function needsSessionRecovery(
  state: AppState,
  now = new Date(),
): boolean {
  return (
    state.sessionRecoveryId !== null ||
    state.sessions.some((session) => isStale(session, now))
  );
}

export function recoverSession(state: AppState, now: Date): AppState {
  let recoveryId = state.sessionRecoveryId;
  let changed = false;
  const sessions = state.sessions.map((session) => {
    if (!isStale(session, now)) return session;
    changed = true;
    recoveryId = session.id;
    return {
      ...session,
      elapsedSeconds: sessionSeconds(session, now),
      status: "paused" as const,
      segmentStartedAt: null,
    };
  });
  return changed
    ? { ...state, sessions, sessionRecoveryId: recoveryId }
    : state;
}

export function pauseSession(state: AppState, now: Date): AppState {
  const recovered = recoverSession(state, now);
  let changed = false;
  const sessions = recovered.sessions.map((session) => {
    if (session.status !== "running") return session;
    changed = true;
    return {
      ...session,
      elapsedSeconds: sessionSeconds(session, now),
      status: "paused" as const,
      segmentStartedAt: null,
      lastHeartbeatAt: new Date(
        Math.max(now.getTime(), Date.parse(session.lastHeartbeatAt)),
      ).toISOString(),
    };
  });
  return changed ? { ...recovered, sessions } : recovered;
}

export function startSession(
  state: AppState,
  task: { id: string; unitId: string; title: string },
  now: Date,
): AppState {
  const paused = pauseSession(state, now);
  const timestamp = now.toISOString();
  const session: StudySession = {
    id: crypto.randomUUID(),
    taskId: task.id,
    unitId: task.unitId,
    label: task.title,
    startedAt: timestamp,
    endedAt: null,
    elapsedSeconds: 0,
    status: "running",
    segmentStartedAt: timestamp,
    lastHeartbeatAt: timestamp,
    manual: false,
  };
  return {
    ...paused,
    sessions: [...paused.sessions, session],
    activeTaskId: task.id,
    activeSessionId: session.id,
  };
}

export function resumeSession(
  state: AppState,
  sessionId: string,
  now: Date,
): AppState {
  const selected = state.sessions.find((session) => session.id === sessionId);
  if (!selected || selected.status === "finished") return state;
  const recovered = recoverSession(state, now);
  const current = recovered.sessions.find(
    (session) => session.id === sessionId,
  )!;
  if (current.status === "running") return recovered;
  const paused = pauseSession(recovered, now);
  const timestamp = new Date(
    Math.max(now.getTime(), Date.parse(current.lastHeartbeatAt)),
  ).toISOString();
  return {
    ...paused,
    activeSessionId: sessionId,
    activeTaskId: current.taskId,
    sessionRecoveryId:
      paused.sessionRecoveryId === sessionId ? null : paused.sessionRecoveryId,
    sessions: paused.sessions.map((session) =>
      session.id === sessionId
        ? {
            ...session,
            status: "running",
            segmentStartedAt: timestamp,
            lastHeartbeatAt: timestamp,
          }
        : session,
    ),
  };
}

export function heartbeatSession(state: AppState, now: Date): AppState {
  const recovered = recoverSession(state, now);
  let changed = false;
  const sessions = recovered.sessions.map((session) => {
    if (
      session.status !== "running" ||
      now.getTime() <= Date.parse(session.lastHeartbeatAt)
    )
      return session;
    changed = true;
    return { ...session, lastHeartbeatAt: now.toISOString() };
  });
  return changed ? { ...recovered, sessions } : recovered;
}

export function finishSession(state: AppState, now: Date): AppState {
  const paused = pauseSession(state, now);
  const selected = paused.sessions.find(
    (session) => session.id === paused.activeSessionId,
  );
  if (!selected || selected.status === "finished") return paused;
  return {
    ...paused,
    sessionRecoveryId:
      paused.sessionRecoveryId === selected.id
        ? null
        : paused.sessionRecoveryId,
    sessions: paused.sessions.map((session) =>
      session.id === selected.id
        ? {
            ...session,
            status: "finished",
            endedAt: new Date(
              Math.max(now.getTime(), Date.parse(session.lastHeartbeatAt)),
            ).toISOString(),
          }
        : session,
    ),
  };
}

export function manualSessionStart(date: string, timezone: string): Date {
  const desired = Date.parse(date + "T00:00:00Z");
  if (
    !Number.isFinite(desired) ||
    new Date(desired).toISOString().slice(0, 10) !== date
  )
    throw new Error("Choose a valid study date.");
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  let timestamp = desired;
  for (let i = 0; i < 4; i++) {
    const parts = formatter.formatToParts(new Date(timestamp));
    const value = (name: string) => parts.find((p) => p.type === name)!.value;
    const local = Date.parse(
      value("year") +
        "-" +
        value("month") +
        "-" +
        value("day") +
        "T" +
        value("hour") +
        ":" +
        value("minute") +
        ":" +
        value("second") +
        "Z",
    );
    timestamp += desired - local;
  }
  return new Date(timestamp);
}
