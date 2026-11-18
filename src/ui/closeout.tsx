import { useState } from "react";
import { nextStep, type Step } from "../lib/flow";
import { useStudy } from "./context";
import { navigate } from "./route";
import { closeStep } from "./session-clock";

const MAX = 2000;

export function Closeout({
  step,
  onSaved,
  onBack,
}: {
  step: Step;
  onSaved: (next: Step | null) => void;
  onBack: () => void;
}) {
  const { flow, update, today } = useStudy();
  const [learned, setLearned] = useState("");
  const [unclear, setUnclear] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <form
      className="closeout"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setFailed(false);
        try {
          const saved = await update((s) =>
            closeStep(
              flow,
              s,
              step,
              { learned, unclear },
              { today, now: new Date(), id: crypto.randomUUID() },
            ),
          );
          onSaved(nextStep(flow, saved));
        } catch {
          setFailed(true);
          setBusy(false);
        }
      }}
    >
      <h1>Before you go</h1>
      <p className="lead">Two lines is enough. Both are optional.</p>
      <label>
        What did you learn?
        <textarea
          name="learned"
          rows={4}
          maxLength={MAX}
          value={learned}
          onChange={(event) => setLearned(event.target.value)}
        />
      </label>
      <label>
        What is still unclear?
        <textarea
          name="unclear"
          rows={4}
          maxLength={MAX}
          value={unclear}
          onChange={(event) => setUnclear(event.target.value)}
        />
        <span className="field-hint">
          It comes back at the start of your next session.
        </span>
      </label>
      {failed && (
        <p className="notice danger" role="alert">
          This could not be saved. Your text is still here. Try again.
        </p>
      )}
      <div className="closeout-actions">
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? "Saving…" : "Save and finish"}
        </button>
        <button type="button" className="text-link" onClick={onBack}>
          Back to the page
        </button>
      </div>
    </form>
  );
}

export function NextUp({ next }: { next: Step | null }) {
  return (
    <section className="closeout" aria-labelledby="next-title">
      {next ? (
        <>
          <h1 id="next-title">
            Next: {next.title} · {next.minutes} min
          </h1>
          <div className="closeout-actions">
            <button
              type="button"
              className="button primary large"
              onClick={() => navigate({ name: "session", stepId: next.id })}
            >
              Continue
            </button>
            <button
              type="button"
              className="button secondary large"
              onClick={() => navigate({ name: "home" })}
            >
              Done for today
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 id="next-title">Every step is done</h1>
          <p className="lead">Your record is on the public page.</p>
          <div className="closeout-actions">
            <button
              type="button"
              className="button primary large"
              onClick={() => navigate({ name: "home" })}
            >
              Done for today
            </button>
          </div>
        </>
      )}
    </section>
  );
}
