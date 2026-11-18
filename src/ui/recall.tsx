import { useEffect, useState } from "react";
import type { RecallQuestion } from "../content/types";
import { dueRecall, gradeRecall } from "../lib/recall";
import type { AppState } from "../lib/model";
import { ignore, useStudy } from "./context";
import { useRecallPool } from "./data";
import { ChoiceQuestion } from "./interactions";
import { navigate } from "./route";
import { SessionBar } from "./session-bar";

export const WARMUP_QUESTIONS = 3;
export const SHORT_RECALL = 10;

/** What the learner said was still unclear the last time they finished a step. */
export function lastUnsure(study: AppState["study"]): string {
  return study?.reflections.at(-1)?.unclear.trim() ?? "";
}

export function pickDue(
  state: AppState,
  pool: ReturnType<typeof useRecallPool>,
  today: string,
  limit: number,
): RecallQuestion[] {
  return dueRecall(state.study, pool.unlocked, today, limit).flatMap((id) => {
    const question = pool.questions.get(id);
    return question ? [question] : [];
  });
}

/** Questions one at a time. Each answer is graded and rescheduled on its own. */
export function RecallRun({
  questions,
  unsure,
  finishLabel,
  onDone,
}: {
  questions: RecallQuestion[];
  unsure?: string;
  finishLabel: string;
  onDone: () => void;
}) {
  const { update, today } = useStudy();
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const question = questions[index]!;
  const last = index === questions.length - 1;
  return (
    <section className="recall" aria-label="Recall">
      {unsure && index === 0 && (
        <p className="unsure">Last time you were unsure about: {unsure}</p>
      )}
      <p className="recall-count">
        Question {index + 1} of {questions.length}
      </p>
      <ChoiceQuestion
        key={question.id}
        item={question}
        chosen={chosen}
        onChoose={(choice) => {
          setChosen(choice);
          void update((s) =>
            gradeRecall(s, question.id, choice === question.answer, today),
          ).catch(ignore);
        }}
      />
      {chosen !== null && (
        <button
          type="button"
          className="button primary"
          onClick={() => {
            if (last) return onDone();
            setIndex(index + 1);
            setChosen(null);
          }}
        >
          {last ? finishLabel : "Next question"}
        </button>
      )}
    </section>
  );
}

export function RecallScreen({ onSearch }: { onSearch: () => void }) {
  const { state, flow, today } = useStudy();
  const pool = useRecallPool(flow, state);
  const [picked, setPicked] = useState<RecallQuestion[] | null>(null);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (pool.ready && picked === null)
      setPicked(pickDue(state, pool, today, SHORT_RECALL));
  }, [pool, picked]);
  const exit = () => navigate({ name: "home" });
  return (
    <div className="focus">
      <SessionBar
        title="10-minute recall"
        timer={false}
        onExit={exit}
        onSearch={onSearch}
      />
      <main className="reading">
        {picked === null ? (
          <p className="loading-text">Choosing your questions…</p>
        ) : done || picked.length === 0 ? (
          <section className="closeout">
            <h1>{done ? "That counts for today." : "Nothing is due."}</h1>
            <p className="lead">
              {done
                ? "Each answer is scheduled to come back when it is due."
                : "Questions appear here once you finish a lecture part, section or short."}
            </p>
            <button type="button" className="button primary" onClick={exit}>
              Back to Home
            </button>
          </section>
        ) : (
          <>
            <h1>Recall</h1>
            <RecallRun
              questions={picked}
              unsure={lastUnsure(state.study)}
              finishLabel="Finish"
              onDone={() => setDone(true)}
            />
          </>
        )}
      </main>
    </div>
  );
}
