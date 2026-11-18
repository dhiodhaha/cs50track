import { manualSessionStart } from "../lib/sessions";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { X, ArrowUpRight, Check, Undo2 } from "lucide-react";
import type { AppState, Assignment, Attempt, StudySession } from "../lib/model";
import { courseUnits } from "../lib/course";
import { latestAttempt } from "../lib/progress";
import { updateAvailability, dateInZone } from "../lib/schedule";
import type { useStudyStore } from "./store";
export type Update = ReturnType<typeof useStudyStore>["update"];

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const el = ref.current;
    const opener = document.activeElement as HTMLElement | null;
    el?.showModal();
    return () => {
      el?.close();
      if (opener?.isConnected && opener !== document.body)
        opener.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "modal-wide" : ""}`}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="modal-header">
        <h2 id={titleId}>{title}</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function ResultForm({
  assignment,
  state,
  update,
  onClose,
  editing,
}: {
  assignment: Assignment;
  state: AppState;
  update: Update;
  onClose: () => void;
  editing?: Attempt;
}) {
  const previous = editing ?? latestAttempt(assignment.id, state.attempts);
  const [kind, setKind] = useState<Attempt["kind"]>(
    previous?.kind ?? "pending",
  );
  const [score, setScore] = useState(editing?.score?.toString() ?? "");
  const [url, setUrl] = useState(editing?.url ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal
      title={editing ? "Correct this result" : "Record your result"}
      onClose={onClose}
    >
      <div className="form-intro">
        <span className="eyebrow">
          {courseUnits.find((u) => u.id === assignment.unitId)?.title}
        </span>
        <h3>{assignment.title}</h3>
        <a
          href={assignment.url}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Open assignment <ArrowUpRight size={14} />
        </a>
      </div>
      <form
        className="stack-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const numeric = score.trim() === "" ? null : Number(score);
            const effectiveKind =
              numeric === null ? kind : numeric >= 70 ? "passed" : "revision";
            if (effectiveKind === "passed" && numeric === null && !confirmed)
              throw new Error("Confirm the passing result in your gradebook.");
            if (url && new URL(url).protocol !== "https:")
              throw new Error("Result links must start with https://.");
            const attempt: Attempt = {
              id: editing?.id ?? crypto.randomUUID(),
              assignmentId: assignment.id,
              submittedAt: editing?.submittedAt ?? new Date().toISOString(),
              kind: effectiveKind,
              score: numeric,
              url,
              note,
            };
            await update((s) => ({
              ...s,
              attempts: editing
                ? s.attempts.map((a) => (a.id === editing.id ? attempt : a))
                : [...s.attempts, attempt],
            }));
            onClose();
          } catch (failure) {
            setError(
              failure instanceof Error
                ? failure.message
                : "Could not save this result.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset>
          <legend>What does your gradebook show?</legend>
          <div className="result-options">
            {(
              [
                {
                  kind: "pending",
                  text: "Submitted",
                  hint: "Waiting for a result",
                },
                { kind: "passed", text: "Passed", hint: "70% or higher" },
                {
                  kind: "revision",
                  text: "Needs revision",
                  hint: "Another attempt",
                },
              ] satisfies {
                kind: Attempt["kind"];
                text: string;
                hint: string;
              }[]
            ).map((option) => (
              <label key={option.kind} className="radio-option">
                <input
                  name="result"
                  type="radio"
                  checked={kind === option.kind}
                  onChange={() => setKind(option.kind)}
                />
                <strong>{option.text}</strong>
                <span>{option.hint}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field-row">
          <label>
            Score, optional
            <input
              name="score"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 92"
            />
          </label>
          <label>
            Result link, optional
            <input
              name="resultUrl"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://submit.cs50.io/…"
            />
          </label>
        </div>
        {kind === "passed" && !score && (
          <label className="check-label">
            <input
              name="confirmed"
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            I checked my gradebook and this assignment passed.
          </label>
        )}
        <label>
          Notes, optional
          <textarea
            name="note"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What clicked? What needs another look?"
          />
        </label>
        <p className="form-note">
          Self-reported progress. Your official CS50 gradebook confirms course
          completion.
        </p>
        {error && (
          <p role="alert" className="notice danger">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={busy}>
            {busy ? "Saving…" : "Save result"}
            <Check size={14} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
export type TimeTask = { id: string; unitId: string; title: string };

export function TimeForm({
  state,
  tasks: offered,
  taskId,
  update,
  onClose,
  editing,
}: {
  state: AppState;
  tasks: TimeTask[];
  taskId: string;
  update: Update;
  onClose: () => void;
  editing?: StudySession;
}) {
  const [selected, setSelected] = useState(editing?.taskId ?? taskId);
  const [date, setDate] = useState(
    editing
      ? dateInZone(new Date(editing.startedAt), state.settings.timezone)
      : dateInZone(new Date(), state.settings.timezone),
  );
  const [note, setNote] = useState(editing?.note ?? "");
  const [minutes, setMinutes] = useState(
    editing ? String(Math.round(editing.elapsedSeconds / 60)) : "60",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const tasks =
    editing && !offered.some((task) => task.id === editing.taskId)
      ? [
          ...offered,
          { id: editing.taskId, unitId: editing.unitId, title: editing.label },
        ]
      : offered;
  return (
    <Modal
      title={editing ? "Correct study time" : "Log study time"}
      onClose={onClose}
    >
      <p className="muted">Studied without the timer? It still counts.</p>
      <form
        className="stack-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const task = tasks.find((t) => t.id === selected);
            if (!task) throw new Error("Choose a course task.");
            const duration = Number(minutes) * 60;
            if (!Number.isFinite(duration) || duration < 0 || duration > 86400)
              throw new Error("Enter a duration between 0 and 1,440 minutes.");
            const start = manualSessionStart(date, state.settings.timezone);
            const end = new Date(start.getTime() + duration * 1000);
            const session: StudySession = {
              id: editing?.id ?? crypto.randomUUID(),
              taskId: task.id,
              unitId: task.unitId,
              label: task.title,
              startedAt: start.toISOString(),
              endedAt: end.toISOString(),
              elapsedSeconds: duration,
              status: "finished",
              segmentStartedAt: null,
              lastHeartbeatAt: end.toISOString(),
              manual: true,
              note,
            };
            await update((s) => ({
              ...s,
              sessionRecoveryId:
                s.sessionRecoveryId === editing?.id
                  ? null
                  : s.sessionRecoveryId,
              sessions: editing
                ? s.sessions.map((x) => (x.id === editing.id ? session : x))
                : [...s.sessions, session],
            }));
            onClose();
          } catch (failure) {
            setError(
              failure instanceof Error ? failure.message : "Could not save.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Course task
          <select
            name="task"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {tasks.map((task) => (
              <option value={task.id} key={task.id}>
                {courseUnits.find((u) => u.id === task.unitId)?.topic} ·{" "}
                {task.title}
              </option>
            ))}
          </select>
        </label>
        <div className="field-row">
          <label>
            Date
            <input
              name="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <label>
            Study minutes
            <input
              name="minutes"
              type="number"
              required
              min="0"
              max="1440"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </label>
        </div>
        <label>
          Notes, optional
          <textarea
            name="timeNote"
            rows={3}
            maxLength={5000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        {error && (
          <p className="notice danger" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save study time"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
const TIMEZONES = [
  "Asia/Jakarta",
  "Asia/Makassar",
  "Asia/Jayapura",
  "Asia/Singapore",
  "Europe/London",
  "America/New_York",
  "UTC",
];

function download(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function SettingsModal({
  state,
  update,
  onClose,
  onLogout,
}: {
  state: AppState;
  update: Update;
  onClose: () => void;
  onLogout: () => void;
}) {
  const [startDate, setStartDate] = useState(state.settings.startDate);
  const [timezone, setTimezone] = useState(state.settings.timezone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const zones = TIMEZONES.includes(timezone)
    ? TIMEZONES
    : [timezone, ...TIMEZONES];
  return (
    <Modal title="Settings" onClose={onClose}>
      <form
        className="stack-form"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            await update((s) =>
              updateAvailability(
                s,
                { ...s.settings, startDate, timezone },
                new Date(),
              ),
            );
            onClose();
          } catch (failure) {
            setError(
              failure instanceof Error ? failure.message : "Could not save.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Start date
          <input
            name="startDate"
            type="date"
            required
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <span className="form-note">
            Changing the start date moves every weekly deadline and the finish
            date.
          </span>
        </label>
        <label>
          Time zone
          <select
            name="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          >
            {zones.map((zone) => (
              <option key={zone}>{zone}</option>
            ))}
          </select>
        </label>
        {error && (
          <p className="notice danger" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={busy}>
            {busy ? "Saving…" : "Save settings"}
          </button>
        </div>
      </form>
      <div className="account-actions">
        <button
          type="button"
          className="text-link"
          onClick={() => download("cs50track-progress.json", state)}
        >
          Download your progress <ArrowUpRight size={14} />
        </button>
        <button type="button" className="text-link" onClick={onLogout}>
          Sign out <Undo2 size={14} />
        </button>
      </div>
    </Modal>
  );
}
