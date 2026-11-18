import { useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import type { DemoId } from "../content/types";

/** One of the small interactive labs, picked by the id a lesson names. */
export function DemoLab({ demo }: { demo: DemoId }) {
  switch (demo) {
    case "binary":
      return <BinaryLab />;
    case "loops":
      return <LoopLab />;
    case "search":
      return <SearchLab />;
    case "memory":
      return <MemoryLab />;
    case "stack":
      return <StackLab />;
    case "sql":
      return <SqlLab />;
    case "http":
      return <HttpLab />;
  }
}

export type SearchStep = {
  low: number;
  high: number;
  middle: number;
  found: boolean;
};
export function binarySearchSteps(
  values: number[],
  target: number,
): SearchStep[] {
  const steps: SearchStep[] = [];
  let low = 0;
  let high = values.length - 1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    steps.push({ low, high, middle, found: values[middle] === target });
    if (values[middle] === target) break;
    if (values[middle] < target) low = middle + 1;
    else high = middle - 1;
  }
  return steps;
}

function Reset({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="text-link" onClick={onClick}>
      <RotateCcw size={16} /> Reset lab
    </button>
  );
}
function BinaryLab() {
  const [value, setValue] = useState(5);
  return (
    <>
      <p>
        Flip a bit. Each position contributes its weight only when it is on.
      </p>
      <div className="bit-grid">
        {[128, 64, 32, 16, 8, 4, 2, 1].map((weight) => (
          <div key={weight}>
            <span>{weight}</span>
            <button
              type="button"
              aria-label={`Bit ${weight}`}
              aria-pressed={Boolean(value & weight)}
              onClick={() => setValue(value ^ weight)}
            >
              {value & weight ? "1" : "0"}
            </button>
          </div>
        ))}
      </div>
      <output aria-live="polite" className="lab-output">
        {value.toString(2).padStart(8, "0")}₂ <ArrowRight size={16} /> {value}{" "}
        in decimal
      </output>
      <Reset onClick={() => setValue(5)} />
    </>
  );
}
function LoopLab() {
  const [limit, setLimit] = useState(4);
  const [step, setStep] = useState(0);
  return (
    <>
      <p>
        Trace the loop one iteration at a time. The condition is tested before
        the body runs.
      </p>
      <label className="lab-field">
        Loop limit: {limit}
        <input
          name="loop-limit"
          type="range"
          min="1"
          max="8"
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setStep(0);
          }}
        />
      </label>
      <pre>
        <code>{`for (int i = 0; i < ${limit}; i++)\n{\n    printf("%i ", i);\n}`}</code>
      </pre>
      <div className="trace-cells">
        {Array.from({ length: limit }, (_, i) => (
          <span key={i} data-active={i < step}>
            {i < step ? i : "·"}
          </span>
        ))}
      </div>
      <output aria-live="polite" className="lab-output">
        {step < limit
          ? `i = ${step}: ${step} < ${limit} is true. The next step prints ${step}.`
          : `i = ${limit}: ${limit} < ${limit} is false. Loop finished after ${limit} iterations.`}
      </output>
      <div className="lab-actions">
        <button
          className="button secondary"
          type="button"
          disabled={step === limit}
          onClick={() => setStep(step + 1)}
        >
          Step iteration
        </button>
        <Reset onClick={() => setStep(0)} />
      </div>
    </>
  );
}
function SearchLab() {
  const values = [3, 7, 12, 18, 24, 31, 46, 59];
  const [target, setTarget] = useState(46);
  const [index, setIndex] = useState(-1);
  const steps = binarySearchSteps(values, target);
  const step = steps[index];
  const done = index === steps.length - 1;
  return (
    <>
      <p>
        Binary search needs sorted input. Compare the middle value and discard
        the half that cannot contain the target.
      </p>
      <label className="lab-field">
        Find a value
        <select
          name="search-target"
          value={target}
          onChange={(e) => {
            setTarget(Number(e.target.value));
            setIndex(-1);
          }}
        >
          {[...values, 99].map((v) => (
            <option key={v} value={v}>
              {v}
              {v === 99 ? " (absent)" : ""}
            </option>
          ))}
        </select>
      </label>
      <div className="trace-cells search-cells">
        {values.map((v, i) => (
          <span
            key={v}
            data-active={step?.middle === i}
            data-discarded={step && (i < step.low || i > step.high)}
          >
            {v}
          </span>
        ))}
      </div>
      <output aria-live="polite" className="lab-output">
        {!step
          ? "Start with all eight values."
          : step.found
            ? `Found ${target} at index ${step.middle} in ${index + 1} comparisons.`
            : done
              ? `${target} is absent. After comparing ${values[step.middle]}, the remaining range is empty.`
              : `Compare ${target} with ${values[step.middle]} at index ${step.middle}. Keep the ${target < values[step.middle] ? "left" : "right"} half.`}
      </output>
      <div className="lab-actions">
        <button
          type="button"
          className="button secondary"
          disabled={done}
          onClick={() => setIndex(index + 1)}
        >
          Next comparison
        </button>
        <Reset onClick={() => setIndex(-1)} />
      </div>
    </>
  );
}
function MemoryLab() {
  const [cells, setCells] = useState([10, 20, 30]);
  const [pointer, setPointer] = useState(0);
  return (
    <>
      <p>
        A pointer stores an address. Choose a cell, then change the value
        through the pointer. These are illustrative addresses.
      </p>
      <div className="memory-cells">
        {cells.map((value, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={pointer === i}
            onClick={() => setPointer(i)}
          >
            <span>0x{(100 + i * 4).toString(16)}</span>
            <strong>{value}</strong>
            <span>{pointer === i ? "↑ p points here" : `items[${i}]`}</span>
          </button>
        ))}
      </div>
      <pre>
        <code>{`int *p = &items[${pointer}];\n*p = *p + 1;`}</code>
      </pre>
      <output className="lab-output" aria-live="polite">
        p = 0x{(100 + pointer * 4).toString(16)} · *p = {cells[pointer]}
      </output>
      <div className="lab-actions">
        <button
          className="button secondary"
          type="button"
          onClick={() =>
            setCells(cells.map((v, i) => (i === pointer ? v + 1 : v)))
          }
        >
          Increment *p
        </button>
        <Reset
          onClick={() => {
            setCells([10, 20, 30]);
            setPointer(0);
          }}
        />
      </div>
    </>
  );
}
function StackLab() {
  const [values, setValues] = useState([1, 2]);
  const [next, setNext] = useState(3);
  const [message, setMessage] = useState("The most recent value leaves first.");
  return (
    <>
      <p>
        A stack is last in, first out. A queue would remove the oldest item
        instead.
      </p>
      <div className="trace-cells">
        {values.length ? (
          values.map((value, i) => (
            <span key={value} data-active={i === values.length - 1}>
              {value}
            </span>
          ))
        ) : (
          <p>Empty stack</p>
        )}
      </div>
      <output className="lab-output" aria-live="polite">
        {message}{" "}
        {values.length ? `Top: ${values.at(-1)}.` : "There is no top value."}
      </output>
      <div className="lab-actions">
        <button
          className="button secondary"
          type="button"
          disabled={values.length >= 6}
          onClick={() => {
            setValues([...values, next]);
            setMessage(`Pushed ${next}.`);
            setNext(next + 1);
          }}
        >
          Push {next}
        </button>
        <button
          className="button secondary"
          type="button"
          disabled={!values.length}
          onClick={() => {
            setMessage(`Popped ${values.at(-1)}.`);
            setValues(values.slice(0, -1));
          }}
        >
          Pop top
        </button>
        <Reset
          onClick={() => {
            setValues([1, 2]);
            setNext(3);
            setMessage("The most recent value leaves first.");
          }}
        />
      </div>
    </>
  );
}
const students = [
  { name: "Ari", hours: 3 },
  { name: "Bima", hours: 7 },
  { name: "Citra", hours: 5 },
  { name: "Dewi", hours: 9 },
];
function SqlLab() {
  const [minimum, setMinimum] = useState(5);
  const [descending, setDescending] = useState(false);
  const result = students
    .filter((s) => s.hours >= minimum)
    .sort((a, b) => (descending ? b.hours - a.hours : a.hours - b.hours));
  return (
    <>
      <p>
        Change the filter and sort order. This small local model demonstrates
        SELECT, WHERE, and ORDER BY; it is not a SQL server.
      </p>
      <div className="lab-controls">
        <label className="lab-field">
          Minimum hours
          <select
            name="sql-minimum"
            value={minimum}
            onChange={(e) => setMinimum(Number(e.target.value))}
          >
            {[0, 5, 8, 10].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="task-check">
          <input
            name="sql-descending"
            type="checkbox"
            checked={descending}
            onChange={(e) => setDescending(e.target.checked)}
          />
          Highest first
        </label>
      </div>
      <pre>
        <code>{`SELECT name, hours FROM students\nWHERE hours >= ${minimum}\nORDER BY hours ${descending ? "DESC" : "ASC"};`}</code>
      </pre>
      <div className="sql-tables">
        <table>
          <caption>students · source</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.hours}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <caption>Result · {result.length} rows</caption>
          <thead>
            <tr>
              <th>Name</th>
              <th>Hours</th>
            </tr>
          </thead>
          <tbody>
            {result.map((s) => (
              <tr key={s.name}>
                <td>{s.name}</td>
                <td>{s.hours}</td>
              </tr>
            ))}
            {!result.length && (
              <tr>
                <td colSpan={2}>No matching rows</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
function HttpLab() {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/hello");
  const [response, setResponse] = useState("");
  const send = () =>
    setResponse(
      path !== "/hello"
        ? "404 Not Found\nNo route matches this path."
        : method === "POST"
          ? "405 Method Not Allowed\nThe /hello route only accepts GET."
          : "200 OK\nContent-Type: text/html\n\n<h1>Hello from the server</h1>",
    );
  return (
    <>
      <p>
        Send a simulated request to a Flask-style route. /hello accepts GET;
        /missing has no route. No network request is made.
      </p>
      <div className="lab-controls">
        <label className="lab-field">
          Method
          <select
            name="http-method"
            aria-label="Method"
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setResponse("");
            }}
          >
            <option>GET</option>
            <option>POST</option>
          </select>
        </label>
        <label className="lab-field">
          Path
          <select
            name="http-path"
            aria-label="Path"
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              setResponse("");
            }}
          >
            <option>/hello</option>
            <option>/missing</option>
          </select>
        </label>
        <button type="button" className="button secondary" onClick={send}>
          Send request
        </button>
      </div>
      <pre>
        <code>
          {
            '@app.route("/hello")\ndef hello():\n    return "<h1>Hello from the server</h1>"'
          }
        </code>
      </pre>
      <pre className="http-response" aria-live="polite">
        <code>{response || "Response will appear here."}</code>
      </pre>
    </>
  );
}
