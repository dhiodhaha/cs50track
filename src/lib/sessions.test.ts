import { describe, expect, it } from "vitest";
import { createInitialState } from "./schedule";
import {
  manualSessionStart,
  needsSessionRecovery,
  finishSession,
  heartbeatSession,
  pauseSession,
  recoverSession,
  resumeSession,
  sessionSeconds,
  startSession,
} from "./sessions";

const task = {
  id: "week-0-lecture",
  unitId: "week-0",
  title: "Scratch lecture",
};
const at = (seconds: number) =>
  new Date(Date.parse("2026-11-17T02:00:00Z") + seconds * 1000);

describe("active study sessions", () => {
  it("counts active segments, excludes lunch, and finishing never changes assignment progress", () => {
    let state = startSession(createInitialState(), task, at(0));
    const id = state.activeSessionId!;
    state = heartbeatSession(state, at(30));
    state = pauseSession(state, at(90));
    expect(sessionSeconds(state.sessions[0]!, at(3600))).toBe(90);
    state = resumeSession(state, id, at(3600));
    state = finishSession(state, at(3660));
    expect(state.sessions[0]?.elapsedSeconds).toBe(150);
    expect(state.sessions[0]?.status).toBe("finished");
    expect(state.sessions[0]?.segmentStartedAt).toBeNull();
    expect(state.attempts).toEqual([]);
    expect(state.resources).toEqual({});
    expect(finishSession(state, at(4000))).toBe(state);
  });

  it("pauses an old task when starting a new one, and repeated finish does not finish the older paused task", () => {
    let state = startSession(createInitialState(), task, at(0));
    const oldId = state.activeSessionId!;
    state = startSession(
      state,
      { ...task, id: "scratch", title: "Scratch assignment" },
      at(60),
    );
    expect(
      state.sessions.filter((session) => session.status === "running"),
    ).toHaveLength(1);
    expect(state.sessions[0]?.elapsedSeconds).toBe(60);
    state = finishSession(state, at(90));
    expect(finishSession(state, at(100))).toBe(state);
    expect(state.sessions.find((session) => session.id === oldId)?.status).toBe(
      "paused",
    );
    state = resumeSession(state, oldId, at(200));
    expect(state.activeSessionId).toBe(oldId);
    expect(state.activeTaskId).toBe(task.id);
  });

  it("restores saved timestamps after refresh and caps an overnight closure at the last heartbeat", () => {
    let state = startSession(createInitialState(), task, at(0));
    state = heartbeatSession(state, at(30));
    state = heartbeatSession(state, at(60));
    state = JSON.parse(JSON.stringify(state));
    expect(sessionSeconds(state.sessions[0]!, at(90))).toBe(90);
    expect(sessionSeconds(state.sessions[0]!, at(86400))).toBe(60);
    state = recoverSession(state, at(86400));
    expect(state.sessions[0]?.elapsedSeconds).toBe(60);
    expect(state.sessions[0]?.status).toBe("paused");
    expect(state.sessionRecoveryId).toBe(state.activeSessionId);
    expect(recoverSession(state, at(90000))).toBe(state);
    expect(heartbeatSession(state, at(90000))).toBe(state);
    state = resumeSession(state, state.activeSessionId!, at(90000));
    expect(state.sessionRecoveryId).toBeNull();
    state = finishSession(state, at(90030));
    expect(state.sessions[0]?.elapsedSeconds).toBe(90);
  });

  it("does not revive stale timers via heartbeat or count time after the last heartbeat when finishing", () => {
    let state = startSession(createInitialState(), task, at(0));
    state = heartbeatSession(state, at(30));
    state = heartbeatSession(state, at(151));
    expect(state.sessions[0]?.status).toBe("paused");
    expect(state.sessions[0]?.elapsedSeconds).toBe(30);
    state = finishSession(state, at(1000));
    expect(state.sessions[0]?.elapsedSeconds).toBe(30);
    expect(state.sessions[0]?.status).toBe("finished");
  });

  it("does not treat exactly two minutes as stale and ignores backwards heartbeat clocks", () => {
    let state = startSession(createInitialState(), task, at(0));
    expect(sessionSeconds(state.sessions[0]!, at(120))).toBe(120);
    state = heartbeatSession(state, at(120));
    expect(state.sessions[0]?.lastHeartbeatAt).toBe(at(120).toISOString());
    expect(heartbeatSession(state, at(90))).toBe(state);
    expect(resumeSession(state, "missing", at(121))).toBe(state);
    state = pauseSession(state, at(90));
    expect(state.sessions[0]?.elapsedSeconds).toBe(120);
    expect(state.sessions[0]?.lastHeartbeatAt).toBe(at(120).toISOString());
  });
});

it("detects a stale running session before any heartbeat arrives", () => {
  const state = startSession(createInitialState(), task, at(0));
  expect(needsSessionRecovery(state, at(90))).toBe(false);
  expect(needsSessionRecovery(state, at(86400))).toBe(true);
});
it("keeps manual study dates in Jakarta and timezones on both sides of UTC", () => {
  expect(manualSessionStart("2026-11-17", "Asia/Jakarta").toISOString()).toBe(
    "2026-11-16T17:00:00.000Z",
  );
  expect(
    manualSessionStart("2026-11-17", "America/New_York").toISOString(),
  ).toBe("2026-11-17T05:00:00.000Z");
  expect(() => manualSessionStart("2026-02-30", "Asia/Jakarta")).toThrow();
});
