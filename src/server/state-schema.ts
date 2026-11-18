import { appStateSchema } from "../lib/model";

export const persistedStateSchema = appStateSchema.superRefine(
  (state, context) => {
    const ids = new Set<string>();
    let running = 0;
    for (const [index, session] of state.sessions.entries()) {
      const invalid = (message: string) =>
        context.addIssue({
          code: "custom",
          path: ["sessions", index],
          message,
        });
      if (ids.has(session.id)) invalid("Session identifiers must be unique.");
      ids.add(session.id);
      const start = Date.parse(session.startedAt);
      const heartbeat = Date.parse(session.lastHeartbeatAt);
      const end = session.endedAt === null ? null : Date.parse(session.endedAt);
      const segment =
        session.segmentStartedAt === null
          ? null
          : Date.parse(session.segmentStartedAt);
      if (
        heartbeat < start ||
        (end !== null && (end < start || heartbeat > end))
      )
        invalid("Session timestamps must be ordered.");
      if (session.status === "running") {
        running++;
        if (
          session.manual ||
          end !== null ||
          segment === null ||
          segment < start ||
          segment > heartbeat
        )
          invalid("A running session requires a valid active segment.");
      } else if (
        segment !== null ||
        (session.status === "finished" ? end === null : end !== null)
      ) {
        invalid("The session status and timestamps must agree.");
      }
      const recordedUntil =
        session.status === "running" ? segment : (end ?? heartbeat);
      if (
        recordedUntil !== null &&
        session.elapsedSeconds > Math.max(0, (recordedUntil - start) / 1000)
      ) {
        invalid("Recorded active time cannot exceed the session duration.");
      }
      if (session.manual && session.status !== "finished")
        invalid("Manual time entries must be finished.");
    }
    if (running > 1)
      context.addIssue({
        code: "custom",
        path: ["sessions"],
        message: "Only one session may be running.",
      });
    for (const key of ["activeSessionId", "sessionRecoveryId"] as const) {
      if (state[key] !== null && !ids.has(state[key]))
        context.addIssue({
          code: "custom",
          path: [key],
          message: "The selected session must exist.",
        });
    }
  },
);
