import { useEffect, useMemo, useRef, useState } from "react";
import type { RecallQuestion, WeekContent } from "../content/types";
import { allSteps, nextStep, stepDone, type Step } from "../lib/flow";
import { finishSession } from "../lib/sessions";
import { Closeout, NextUp } from "./closeout";
import { ignore, useStudy } from "./context";
import { useRecallPool, useWeekContent } from "./data";
import {
  ClipStage,
  LectureStage,
  lectureOutline,
  stagePosition,
} from "./lecture";
import { ProblemStage, ProjectStage } from "./problems";
import { useOutlineNav } from "./outline";
import { RecallRun, WARMUP_QUESTIONS, lastUnsure, pickDue } from "./recall";
import { clearWarmup, navigate, wantsWarmup } from "./route";
import { SessionBar, scrollToId, useActiveSection } from "./session-bar";
import { enterStep } from "./session-clock";

/** One value says where the learner is in a session. */
type Phase =
  | { at: "warmup"; questions: RecallQuestion[] }
  | { at: "work" }
  | { at: "closeout" }
  | { at: "next"; next: Step | null };

export function SessionScreen({
  stepId,
  onSearch,
}: {
  stepId: string;
  onSearch: () => void;
}) {
  const { flow } = useStudy();
  const step = useMemo(
    () => allSteps(flow).find((item) => item.id === stepId),
    [flow, stepId],
  );
  if (!step)
    return (
      <main className="reading">
        <h1>This step does not exist</h1>
        <p>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate({ name: "home" })}
          >
            Back to Home
          </button>
        </p>
      </main>
    );
  return <SessionLoader key={step.id} step={step} onSearch={onSearch} />;
}

/** Waits for week content and the recall pool, then decides on a warm-up once. */
function SessionLoader({
  step,
  onSearch,
}: {
  step: Step;
  onSearch: () => void;
}) {
  const { state, flow, today } = useStudy();
  const content = useWeekContent(step.unitId);
  const pool = useRecallPool(flow, state);
  const nav = useOutlineNav(step);
  const [wanted] = useState(() => wantsWarmup(step.id));
  const [warmup, setWarmup] = useState<RecallQuestion[] | null>(null);
  useEffect(() => {
    if (warmup !== null || !pool.ready || content.isPending) return;
    setWarmup(wanted ? pickDue(state, pool, today, WARMUP_QUESTIONS) : []);
    clearWarmup();
  }, [warmup, pool, content.isPending]);
  if (warmup === null)
    return (
      <div className="focus">
        <SessionBar
          title={step.title}
          timer={false}
          onExit={() => navigate({ name: "home" })}
          onSearch={onSearch}
        />
        <main className="reading">
          <p className="loading-text">Getting your session ready…</p>
        </main>
      </div>
    );
  return (
    <Session
      step={step}
      content={content.data ?? null}
      warmup={warmup}
      onSearch={onSearch}
    />
  );
}

function Session({
  step,
  content,
  warmup,
  onSearch,
}: {
  step: Step;
  content: WeekContent | null;
  warmup: RecallQuestion[];
  onSearch: () => void;
}) {
  const { state, flow, update } = useStudy();
  const nav = useOutlineNav(step);
  const [phase, setPhase] = useState<Phase>(
    warmup.length > 0 ? { at: "warmup", questions: warmup } : { at: "work" },
  );

  useEffect(() => {
    void update((s) => enterStep(s, step, new Date())).catch(ignore);
  }, []);

  const firstPhase = useRef(true);
  useEffect(() => {
    if (firstPhase.current) {
      firstPhase.current = false;
      return;
    }
    window.scrollTo(0, 0);
    const heading = document.querySelector<HTMLElement>(".focus main h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [phase.at]);

  const done = stepDone(step, state);
  const wasDone = useRef(done);
  useEffect(() => {
    if (step.stage !== "problems" || phase.at !== "work") return;
    if (!done || wasDone.current) return;
    void update((s) => finishSession(s, new Date()))
      .then((saved) => setPhase({ at: "next", next: nextStep(flow, saved) }))
      .catch(ignore);
  }, [done]);

  const part = step.stage === "lecture" ? content?.parts[step.id] : undefined;
  const outline = step.stage === "lecture" ? lectureOutline(step, part) : [];
  const active = useActiveSection(
    outline.map((item) => item.id),
    phase.at === "work",
  );
  const showRail = phase.at === "work" && outline.length > 0;

  async function exit() {
    await update((s) => finishSession(s, new Date())).catch(ignore);
    navigate({ name: "home" });
  }

  return (
    <div className="focus">
      <SessionBar
        title={step.title}
        position={stagePosition(flow, step)}
        outline={showRail ? outline : undefined}
        activeId={active}
        terms={content?.glossary}
        onExit={() => void exit()}
        onSearch={onSearch}
        {...nav.bar}
      />
      <div
        className="session-frame"
        data-sidebar={nav.sidebarOn ? "on" : "off"}
        data-rail={showRail ? "on" : "off"}
      >
        {nav.sidebar}
        {phase.at === "warmup" && (
          <main className="reading">
            <h1>Before you start</h1>
            <RecallRun
              questions={phase.questions}
              unsure={lastUnsure(state.study)}
              finishLabel="Start the lesson"
              onDone={() => setPhase({ at: "work" })}
            />
          </main>
        )}
        {phase.at === "work" && (
          <main className="reading">
            <StageView
              step={step}
              content={content}
              onFinish={() => setPhase({ at: "closeout" })}
            />
          </main>
        )}
        {showRail && (
          <aside className="rail" aria-label="On this page">
            <p className="rail-title">On this page</p>
            <ul>
              {outline.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={active === item.id ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToId(item.id);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
        {phase.at === "closeout" && (
          <main className="reading">
            <Closeout
              step={step}
              onBack={() => setPhase({ at: "work" })}
              onSaved={(next) => {
                setPhase({ at: "next", next });
              }}
            />
          </main>
        )}
        {phase.at === "next" && (
          <main className="reading">
            <NextUp next={phase.next} />
          </main>
        )}
      </div>
      {nav.sheet}
    </div>
  );
}

function StageView({
  step,
  content,
  onFinish,
}: {
  step: Step;
  content: WeekContent | null;
  onFinish: () => void;
}) {
  switch (step.stage) {
    case "lecture":
      return (
        <LectureStage
          step={step}
          content={content?.parts[step.id]}
          onFinish={onFinish}
        />
      );
    case "section":
      return (
        <ClipStage step={step} content={content?.section} onFinish={onFinish} />
      );
    case "shorts":
      return (
        <ClipStage
          step={step}
          content={content?.shorts[step.id]}
          onFinish={onFinish}
        />
      );
    case "problems":
      return <ProblemStage step={step} />;
    case "project":
      return <ProjectStage step={step} onFinish={onFinish} />;
  }
}
