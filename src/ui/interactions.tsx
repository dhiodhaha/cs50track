import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import type {
  Blank,
  Compare,
  Demo,
  Interaction,
  Predict,
  RecallQuestion,
  Trace,
} from "../content/types";
import { displayOrder } from "../lib/shuffle";
import { ignore, patchStudy, useStudy } from "./context";
import { DemoLab } from "./lesson-demos";

const NO_ANSWERS: Record<string, number> = {};

/** Saved answers, with one state write per answer. */
export function useAnswers() {
  const { state, update } = useStudy();
  const answers = state.study?.answers ?? NO_ANSWERS;
  function answer(id: string, value: number) {
    void update((s) =>
      patchStudy(s, (study) => ({
        ...study,
        answers: { ...study.answers, [id]: value },
      })),
    ).catch(ignore);
  }
  return { answers, answer };
}

/** The interactions a learner must answer before finishing a part. */
export function isGraded(item: Interaction): boolean {
  return (
    item.kind === "predict" || item.kind === "blank" || item.kind === "compare"
  );
}

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  return (
    <pre
      className="code"
      tabIndex={0}
      aria-label="Code"
      data-language={language}
    >
      <code>{code}</code>
    </pre>
  );
}

type Verdict = "right" | "wrong" | "answer" | undefined;

function Options({
  options,
  chosen,
  answer,
  onChoose,
  labels,
  seed,
}: {
  /** When set, options show in a fixed shuffled order. Indexes passed around stay the authored ones. */
  seed?: string;
  options: string[];
  chosen: number | null;
  answer: number;
  onChoose: (index: number) => void;
  labels?: string[];
}) {
  const locked = chosen !== null;
  return (
    <div className="ix-options" role="group" aria-label="Choices">
      {(seed
        ? displayOrder(seed, options.length)
        : options.map((_, index) => index)
      ).map((index, position) => {
        const option = options[index]!;
        const verdict: Verdict = !locked
          ? undefined
          : index === chosen
            ? index === answer
              ? "right"
              : "wrong"
            : index === answer
              ? "answer"
              : undefined;
        return (
          <button
            key={option}
            type="button"
            className="ix-option"
            data-verdict={verdict}
            aria-pressed={chosen === index}
            aria-disabled={locked}
            onClick={() => !locked && onChoose(index)}
          >
            <span className="ix-mark" aria-hidden>
              {verdict === "right" || verdict === "answer" ? (
                <Check size={14} />
              ) : verdict === "wrong" ? (
                <X size={14} />
              ) : (
                (labels?.[index] ?? String.fromCharCode(65 + position))
              )}
            </span>
            <span>{option}</span>
            {verdict && (
              <span className="sr-only">
                {verdict === "right"
                  ? " Correct."
                  : verdict === "wrong"
                    ? " Not correct."
                    : " This is the right answer."}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Reveal({
  show,
  right,
  children,
}: {
  show: boolean;
  right: boolean;
  children: string;
}) {
  return (
    <div className="ix-reveal" role="status" data-right={right}>
      {show && (
        <p>
          <strong>{right ? "Right. " : "Not quite. "}</strong>
          {children}
        </p>
      )}
    </div>
  );
}

/** A saved choice, or the one just made while the write is in flight. */
function useChoice(id: string) {
  const { answers, answer } = useAnswers();
  const [local, setLocal] = useState<number | null>(null);
  const chosen = answers[id] ?? local;
  return {
    chosen,
    choose(index: number) {
      setLocal(index);
      answer(id, index);
    },
  };
}

type Choice = Pick<
  Predict | RecallQuestion,
  "prompt" | "code" | "options" | "answer" | "explanation"
>;

/** A question with options. Predict, recall and "check yourself" all render through it. */
export function ChoiceQuestion({
  item,
  chosen,
  onChoose,
  language,
}: {
  item: Choice;
  chosen: number | null;
  onChoose: (index: number) => void;
  language?: string;
}) {
  return (
    <figure className="ix">
      <figcaption className="ix-prompt">{item.prompt}</figcaption>
      {item.code && <CodeBlock code={item.code} language={language} />}
      <Options
        options={item.options}
        seed={item.prompt}
        chosen={chosen}
        answer={item.answer}
        onChoose={onChoose}
      />
      <Reveal show={chosen !== null} right={chosen === item.answer}>
        {item.explanation}
      </Reveal>
    </figure>
  );
}

export function PredictView({
  item,
}: {
  item: Predict | (RecallQuestion & { language?: string });
}) {
  const { chosen, choose } = useChoice(item.id);
  return (
    <ChoiceQuestion
      item={item}
      chosen={chosen}
      onChoose={choose}
      language={"language" in item ? item.language : undefined}
    />
  );
}

export function BlankView({ item }: { item: Blank }) {
  const { chosen, choose } = useChoice(item.id);
  const [before, ...rest] = item.code.split("____");
  const after = rest.join("____");
  const filled = chosen !== null ? item.options[item.answer] : null;
  return (
    <figure className="ix">
      <figcaption className="ix-prompt">{item.prompt}</figcaption>
      <pre className="code" tabIndex={0} aria-label="Code with a blank">
        <code>
          {before}
          <span
            className="gap"
            data-filled={filled !== null}
            data-right={chosen === item.answer}
          >
            {filled ?? "      "}
          </span>
          {after}
        </code>
      </pre>
      <Options
        options={item.options}
        seed={item.prompt}
        chosen={chosen}
        answer={item.answer}
        onChoose={choose}
      />
      <Reveal show={chosen !== null} right={chosen === item.answer}>
        {item.explanation}
      </Reveal>
    </figure>
  );
}

export function CompareView({ item }: { item: Compare }) {
  const { chosen, choose } = useChoice(item.id);
  const correct = item.answer === "a" ? 0 : 1;
  const locked = chosen !== null;
  return (
    <figure className="ix">
      <figcaption className="ix-prompt">{item.prompt}</figcaption>
      <div className="compare">
        {[item.a, item.b].map((version, index) => (
          <div
            key={version.label}
            className="compare-version"
            data-verdict={locked && index === correct ? "answer" : undefined}
          >
            <p className="compare-label">
              <span>{index === 0 ? "A" : "B"}</span> {version.label}
            </p>
            <CodeBlock code={version.code} language={item.language} />
          </div>
        ))}
      </div>
      <div
        className="ix-options compare-buttons"
        role="group"
        aria-label="Choices"
      >
        {["A is better", "B is better"].map((text, index) => (
          <button
            key={text}
            type="button"
            className="ix-option"
            aria-pressed={chosen === index}
            aria-disabled={locked}
            data-verdict={
              !locked
                ? undefined
                : index === chosen
                  ? index === correct
                    ? "right"
                    : "wrong"
                  : undefined
            }
            onClick={() => !locked && choose(index)}
          >
            <span className="ix-mark" aria-hidden>
              {locked && index === chosen ? (
                index === correct ? (
                  <Check size={14} />
                ) : (
                  <X size={14} />
                )
              ) : index === 0 ? (
                "A"
              ) : (
                "B"
              )}
            </span>
            {text}
            {locked && index === chosen && (
              <span className="sr-only">
                {index === correct ? " Correct." : " Not correct."}
              </span>
            )}
          </button>
        ))}
      </div>
      <Reveal show={locked} right={chosen === correct}>
        {item.explanation}
      </Reveal>
    </figure>
  );
}

export function TraceView({ item }: { item: Trace }) {
  const [index, setIndex] = useState(-1);
  const total = item.steps.length;
  const current = index >= 0 ? item.steps[index]! : null;
  const previous = index > 0 ? item.steps[index - 1]! : null;
  const lines = item.code.split("\n");
  let output = "";
  for (let i = 0; i <= index; i++) output = item.steps[i]!.output ?? output;
  const vars = Object.entries(current?.vars ?? {});
  return (
    <figure className="ix trace">
      <figcaption className="ix-prompt">{item.caption}</figcaption>
      <ol
        className="trace-code"
        aria-label="Code"
        data-language={item.language}
      >
        {lines.map((line, i) => (
          <li
            key={i}
            data-current={current?.line === i + 1}
            aria-current={current?.line === i + 1 ? "step" : undefined}
          >
            <code>{line || " "}</code>
          </li>
        ))}
      </ol>
      <div className="trace-controls">
        <button
          type="button"
          className="button secondary small"
          disabled={index < 0}
          onClick={() => setIndex(index - 1)}
        >
          Back
        </button>
        <button
          type="button"
          className="button primary small"
          disabled={index >= total - 1}
          onClick={() => setIndex(index + 1)}
        >
          Next
        </button>
        <button
          type="button"
          className="button secondary small"
          disabled={index < 0}
          onClick={() => setIndex(-1)}
        >
          <RotateCcw size={13} aria-hidden /> Reset
        </button>
        <span className="trace-count">
          Step {index + 1} of {total}
        </span>
      </div>
      <div className="trace-state" aria-live="polite">
        <table className="trace-vars">
          <caption>Variables</caption>
          <tbody>
            {vars.length === 0 && (
              <tr>
                <td colSpan={2} className="trace-empty">
                  {current ? "None yet" : "Press Next to run the first line."}
                </td>
              </tr>
            )}
            {vars.map(([name, value]) => (
              <tr
                key={`${name}:${index}`}
                data-changed={previous?.vars[name] !== value}
              >
                <th scope="row">{name}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="trace-output">
          <p className="trace-label">Output so far</p>
          <pre aria-label="Output so far">{output || " "}</pre>
        </div>
        {current?.note && <p className="trace-note">{current.note}</p>}
      </div>
    </figure>
  );
}

export function DemoView({ item }: { item: Demo }) {
  return (
    <figure className="ix concept-lab">
      <DemoLab demo={item.demo} />
      <figcaption className="ix-caption">{item.caption}</figcaption>
    </figure>
  );
}

export function InteractionView({ item }: { item: Interaction }) {
  switch (item.kind) {
    case "predict":
      return <PredictView item={item} />;
    case "blank":
      return <BlankView item={item} />;
    case "compare":
      return <CompareView item={item} />;
    case "trace":
      return <TraceView item={item} />;
    case "demo":
      return <DemoView item={item} />;
  }
}
