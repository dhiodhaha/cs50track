import { ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { courseUnits } from "../lib/course";
import type { Step } from "../lib/flow";
import type { Assignment } from "../lib/model";
import { latestAttempt } from "../lib/progress";
import { useStudy } from "./context";
import { useCourseDocument, useManifest } from "./data";
import { ResultForm } from "./forms";
import { cleanIntro, splitAtH2 } from "./notes";
import { ProseHtml } from "./prose";
import { readLocal, writeLocal } from "./storage";

type ProblemStep = Extract<Step, { stage: "problems" }>;
type ProjectStep = Extract<Step, { stage: "project" }>;

const COLLAPSED = /^(hints?|walkthrough|how to test)$/i;
const choiceKey = (groupId: string) => `cs50track.problem.${groupId}`;

/** The imported page for one CS50 URL, split at its h2 headings. */
function useSpecification(sourceUrl: string) {
  const manifest = useManifest();
  const url =
    manifest.data?.materials.find(
      (item) => item.sourceUrl === sourceUrl && item.localUrl,
    )?.localUrl ?? null;
  const document = useCourseDocument(url);
  const parts = useMemo(
    () => (document.data ? splitAtH2(document.data.html) : null),
    [document.data],
  );
  return {
    parts,
    loading: manifest.isPending || (url !== null && document.isPending),
    missing: manifest.isSuccess && url === null,
    failed: manifest.isError || document.isError,
  };
}

function Specification({ sourceUrl }: { sourceUrl: string }) {
  const { parts, loading, missing, failed } = useSpecification(sourceUrl);
  if (loading)
    return <p className="loading-text">Loading the specification…</p>;
  if (missing || failed || !parts)
    return (
      <p className="notice">
        The specification could not be loaded here.{" "}
        <a
          className="text-link"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Read it on CS50's site
        </a>
      </p>
    );
  const intro = cleanIntro(parts.intro);
  return (
    <div className="spec">
      {intro && <ProseHtml html={intro} />}
      {parts.sections.map((section) =>
        COLLAPSED.test(section.title) ? (
          <details key={section.id} className="spec-fold">
            <summary>{section.title}</summary>
            <ProseHtml
              html={section.html.replace(/^<h2\b[^>]*>[\s\S]*?<\/h2>/, "")}
            />
          </details>
        ) : (
          <ProseHtml key={section.id} html={section.html} />
        ),
      )}
    </div>
  );
}

export function ProblemStage({ step }: { step: ProblemStep }) {
  const { state, update } = useStudy();
  const group = courseUnits
    .find((unit) => unit.id === step.unitId)
    ?.groups.find((item) => item.id === step.groupId);
  const attempted = group?.assignments
    .flatMap((assignment) => {
      const attempt = latestAttempt(assignment.id, state.attempts);
      return attempt ? [{ assignment, attempt }] : [];
    })
    .sort(
      (a, b) =>
        Date.parse(b.attempt.submittedAt) - Date.parse(a.attempt.submittedAt),
    )[0]?.assignment;
  const [picked, setPicked] = useState<string | null>(
    () => attempted?.id ?? readLocal(choiceKey(step.groupId)) ?? null,
  );
  const [recording, setRecording] = useState<Assignment | null>(null);
  if (!group)
    return <p className="notice danger">This problem set is missing.</p>;

  const chosen =
    group.assignments.length === 1
      ? group.assignments[0]
      : group.assignments.find((item) => item.id === picked);

  if (!chosen)
    return (
      <article className="part">
        <h1>{step.title}</h1>
        <p className="lead">
          CS50 gives you a choice here. Pick the one that feels right. You can
          switch later.
        </p>
        <div className="choice-list">
          {group.assignments.map((assignment) => (
            <button
              key={assignment.id}
              type="button"
              className="choice"
              onClick={() => {
                writeLocal(choiceKey(group.id), assignment.id);
                setPicked(assignment.id);
              }}
            >
              <strong>{assignment.title}</strong>
              <span>
                {assignment.difficulty === "standard"
                  ? "The standard version"
                  : "The more challenging version"}
              </span>
            </button>
          ))}
        </div>
      </article>
    );

  const latest = latestAttempt(chosen.id, state.attempts);
  return (
    <article className="part">
      <h1>{chosen.title}</h1>
      <div className="problem-actions">
        <a
          className="button secondary"
          href="https://cs50.dev/"
          target="_blank"
          rel="noreferrer"
        >
          Open cs50.dev <ExternalLink size={14} aria-hidden />
        </a>
        <a
          className="button secondary"
          href={chosen.url}
          target="_blank"
          rel="noreferrer"
        >
          Open on CS50's site <ExternalLink size={14} aria-hidden />
        </a>
        {group.assignments.length > 1 && (
          <button
            type="button"
            className="text-link"
            onClick={() => {
              writeLocal(choiceKey(group.id), null);
              setPicked(null);
            }}
          >
            Choose the other version
          </button>
        )}
      </div>
      <Specification sourceUrl={chosen.url} />
      <section className="record" aria-labelledby="record-title">
        <h2 id="record-title">Done?</h2>
        <p>
          This week closes only when CS50's checker passes your submission. Run
          it in cs50.dev, then record the result here.
          {latest && ` Latest result: ${latest.kind}.`}
        </p>
        <button
          type="button"
          className="button primary large"
          onClick={() => setRecording(chosen)}
        >
          Record result
        </button>
      </section>
      {recording && (
        <ResultForm
          state={state}
          assignment={recording}
          update={update}
          onClose={() => setRecording(null)}
        />
      )}
    </article>
  );
}

const MILESTONE_NOTES: Record<string, string> = {
  scope:
    "Decide what you will build and what you will leave out. Write it in a few sentences and check it against CS50's requirements.",
  prototype:
    "Make the smallest version that proves the idea works. It can be ugly. It should run.",
  build:
    "Build the real thing in small steps. Commit often and keep it running after each step.",
  documentation:
    "Write the README a stranger could follow: what it is, how to run it, and why you made the choices you did.",
  demo: "Record the short video CS50 asks for. Show it working, then say what is inside.",
  submit:
    "Submit the project through CS50's submission page and keep the confirmation.",
  gradebook:
    "Open your CS50 gradebook and check that the project shows as submitted and passing.",
};
const PROJECT_URL = "https://cs50.harvard.edu/x/2026/project/";

export function ProjectStage({
  step,
  onFinish,
}: {
  step: ProjectStep;
  onFinish: () => void;
}) {
  return (
    <article className="part">
      <h1>{step.title}</h1>
      <p className="lead">{MILESTONE_NOTES[step.milestoneId]}</p>
      <p>
        <a
          className="button secondary"
          href={PROJECT_URL}
          target="_blank"
          rel="noreferrer"
        >
          CS50's final project page <ExternalLink size={14} aria-hidden />
        </a>
      </p>
      <details className="spec-fold">
        <summary>Read the project page here</summary>
        <Specification sourceUrl={PROJECT_URL} />
      </details>
      <div className="finish">
        <button
          type="button"
          className="button primary large"
          onClick={onFinish}
        >
          Mark this milestone done
        </button>
      </div>
    </article>
  );
}
