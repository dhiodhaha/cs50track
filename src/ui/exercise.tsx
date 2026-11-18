import { ExternalLink, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Exercise } from "../content/types";
import { ignore, patchStudy, useStudy } from "./context";
import { readLocal, writeLocal } from "./storage";

const SAVE_DELAY_MS = 1500;
const draftKey = (id: string) => `cs50track.exercise.${id}`;
const RUNNABLE = new Set(["c", "python"]);

type SaveState = "saved" | "pending" | "failed";

export function ExerciseView({
  id,
  exercise,
}: {
  id: string;
  exercise: Exercise;
}) {
  const { state, update } = useStudy();
  const saved = state.study?.exercises[id];
  const [code, setCode] = useState(
    () => readLocal(draftKey(id)) ?? saved ?? exercise.starter,
  );
  const [save, setSave] = useState<SaveState>("saved");
  const [hints, setHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const latest = useRef(code);
  const persisted = useRef(saved ?? exercise.starter);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function persist(value: string) {
    clearTimeout(timer.current);
    setSave("pending");
    update((s) =>
      patchStudy(s, (study) => ({
        ...study,
        exercises: { ...study.exercises, [id]: value },
      })),
    )
      .then(() => {
        persisted.current = value;
        if (latest.current === value) setSave("saved");
      })
      .catch(() => setSave("failed"));
  }
  function change(value: string) {
    latest.current = value;
    setCode(value);
    writeLocal(draftKey(id), value);
    setSave("pending");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => persist(value), SAVE_DELAY_MS);
  }
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      if (latest.current !== persisted.current)
        void update((s) =>
          patchStudy(s, (study) => ({
            ...study,
            exercises: { ...study.exercises, [id]: latest.current },
          })),
        ).catch(ignore);
    },
    [id],
  );

  return (
    <section className="exercise" aria-labelledby={`${id}-exercise`}>
      <h2 id={`${id}-exercise`}>Try it</h2>
      <p className="exercise-prompt">{exercise.prompt}</p>
      <label className="sr-only" htmlFor={`${id}-code`}>
        Your code
      </label>
      <textarea
        id={`${id}-code`}
        className="editor"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={Math.min(24, Math.max(8, code.split("\n").length + 1))}
        maxLength={20000}
        value={code}
        onChange={(event) => change(event.target.value)}
        onBlur={() => save === "pending" && persist(latest.current)}
      />
      <div className="exercise-actions">
        <span className="save-note" role="status">
          {save === "saved"
            ? "Saved"
            : save === "pending"
              ? "Saving…"
              : "Not saved yet. Your code is kept in this browser."}
        </span>
        <button
          type="button"
          className="button secondary small"
          onClick={() => {
            change(exercise.starter);
            persist(exercise.starter);
          }}
        >
          <RotateCcw size={13} aria-hidden /> Reset code
        </button>
        {RUNNABLE.has(exercise.language.toLowerCase()) && (
          <a
            className="button secondary small"
            href="https://cs50.dev/"
            target="_blank"
            rel="noreferrer"
          >
            Run it in cs50.dev <ExternalLink size={13} aria-hidden />
          </a>
        )}
      </div>

      {hints > 0 && (
        <ol className="hints" aria-label="Hints">
          {exercise.hints.slice(0, hints).map((hint, index) => (
            <li key={index}>{hint}</li>
          ))}
        </ol>
      )}
      <div className="exercise-actions">
        {hints < exercise.hints.length && (
          <button
            type="button"
            className="button secondary small"
            onClick={() => setHints(hints + 1)}
          >
            Show hint
            {exercise.hints.length > 1
              ? ` (${hints + 1} of ${exercise.hints.length})`
              : ""}
          </button>
        )}
        <button
          type="button"
          className="button secondary small"
          aria-expanded={showSolution}
          onClick={() => setShowSolution(!showSolution)}
        >
          {showSolution ? "Hide solution" : "View solution"}
        </button>
      </div>
      {showSolution && (
        <pre className="code" tabIndex={0} aria-label="Solution">
          <code>{exercise.solution}</code>
        </pre>
      )}
    </section>
  );
}
