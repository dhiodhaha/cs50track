import { Check } from "lucide-react";
import { courseUnits } from "../lib/course";
import {
  allSteps,
  nextStep,
  stepDone,
  unitStages,
  unitSteps,
  type Step,
} from "../lib/flow";
import type { CourseUnit } from "../lib/model";
import { formatMinutes, getPace, paceLabel, unitDeadline } from "../lib/pace";
import { dueRecall } from "../lib/recall";
import { sessionSeconds } from "../lib/sessions";
import { useStudy } from "./context";
import { CourseGrid, UnitThumb, unitCaption } from "./course-grid";
import { useRecallPool } from "./data";
import { daysUntil, friendlyDate, longDate, plural } from "./format";
import { SHORT_RECALL } from "./recall";
import { navigate, requestWarmup } from "./route";
import { RouteLink } from "./route-link";
import { StageLine } from "./stage-line";
import {
  attemptResult,
  latestInGroup,
  stageCaption,
  stageOrdinal,
  stepGroup,
} from "./steps";
import { stickerVars } from "./unit-colors";

/** The last word of the pace label sits on the unit's sticker colour. */
function PaceHeadline({ label }: { label: string }) {
  const cut = label.lastIndexOf(" ") + 1;
  return (
    <>
      {label.slice(0, cut)}
      <span className="pace-word">{label.slice(cut)}</span>
    </>
  );
}

export function Home() {
  const { state, flow, today } = useStudy();
  const pace = getPace(flow, state, today);
  const next = nextStep(flow, state);
  const pool = useRecallPool(flow, state);
  const due = pool.ready
    ? dueRecall(state.study, pool.unlocked, today, SHORT_RECALL)
    : [];
  const target = friendlyDate(pace.targetDate, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const steps = allSteps(flow);
  const studied = state.sessions.reduce(
    (sum, session) => sum + sessionSeconds(session, new Date()),
    0,
  );
  const stats = (
    <dl className="stat-row" aria-label="Your course so far">
      <div>
        <dt>Finish by</dt>
        <dd>
          {target}
          <span> · {plural(pace.daysLeftInPlan, "day")} left</span>
        </dd>
      </div>
      <div>
        <dt>Study time</dt>
        <dd>{formatMinutes(studied / 60)}</dd>
      </div>
      <div>
        <dt>Steps done</dt>
        <dd>
          {steps.filter((step) => stepDone(step, state)).length} of{" "}
          {steps.length}
        </dd>
      </div>
    </dl>
  );

  if (!next)
    return (
      <section className="home" aria-labelledby="home-title">
        <div className="home-hero">
          <div className="home-now">
            <p className="home-week">Course complete</p>
            <h1 id="home-title" className="home-pace">
              Every step is done
            </h1>
            <p className="home-sentence">
              Your results and dates are on your public record.
            </p>
            <p className="home-recall">
              <a className="button primary large" href="/p">
                Open your record
              </a>
            </p>
          </div>
        </div>
        {stats}
        <CourseGrid currentUnitId={null} />
      </section>
    );

  const unit = courseUnits.find((item) => item.id === next.unitId)!;
  const deadline = unitDeadline(unit.id, state.settings.startDate);
  const left = daysUntil(today, deadline);
  const noun =
    unit.groups.length === 0
      ? "Week ends"
      : unit.id === "project"
        ? "Project due"
        : "Problem set due";
  const sentence =
    pace.dueThisWeekMinutes > 0
      ? `${formatMinutes(pace.dueThisWeekMinutes)} left this week, about ${formatMinutes(pace.perDayMinutes)} a day.`
      : "Everything due this week is done.";

  return (
    <section className="home" aria-labelledby="home-title">
      <div className="home-hero">
        <div className="home-now" style={stickerVars(unit.id)}>
          <p className="home-week">
            {unit.title} · {unit.topic}
          </p>
          {left < 0 ? (
            <p className="home-deadline warn">
              {unit.title} was due on {friendlyDate(deadline)}
            </p>
          ) : (
            <p className="home-deadline">
              {noun} {longDate(deadline)} ·{" "}
              {left === 0 ? "due today" : `${plural(left, "day")} left`}
            </p>
          )}

          <h1 id="home-title" className="home-pace" data-status={pace.status}>
            <PaceHeadline label={paceLabel(pace)} />
          </h1>
          <p className="home-sentence">{sentence}</p>

          <StageLine
            stages={unitStages(flow, unit, state)}
            label={`${unit.title} stages`}
            current={next.stage}
          />

          <button
            type="button"
            className="button primary large home-start"
            onClick={() => {
              requestWarmup(next.id);
              navigate({ name: "session", stepId: next.id });
            }}
          >
            Start · {next.title} · {next.minutes} min
          </button>

          {due.length > 0 && (
            <p className="home-recall">
              <button
                type="button"
                className="quiet-link"
                onClick={() => navigate({ name: "recall" })}
              >
                Short on time? 10-minute recall
              </button>
            </p>
          )}

          <p className="home-target">
            {plural(pace.daysLeftInPlan, "day")} to {target}.
          </p>
        </div>

        <aside className="now-card" aria-hidden style={stickerVars(unit.id)}>
          <UnitThumb unitId={unit.id} />
          <div className="now-card-meta">
            <span className="card-caption">Up next · {unitCaption(unit)}</span>
            <span className="now-card-title">{unit.topic}</span>
            <p>{unit.description}</p>
          </div>
        </aside>
      </div>

      {stats}
      <ThisWeek unit={unit} next={next} />
      <CourseGrid currentUnitId={unit.id} />
    </section>
  );
}

/** The steps of the unit that holds the next step, as cards in course order. */
function ThisWeek({ unit, next }: { unit: CourseUnit; next: Step }) {
  const { state, flow } = useStudy();
  const steps = unitSteps(flow, unit);
  return (
    <section
      className="this-week"
      aria-labelledby="this-week-title"
      style={stickerVars(unit.id)}
    >
      <h2 id="this-week-title" className="pill-label">
        This week · {unit.title}, {unit.topic}
      </h2>
      <ol className="step-grid">
        {steps.map((step) => {
          const done = stepDone(step, state);
          const group = stepGroup(step);
          const result = group && latestInGroup(group, state.attempts);
          const isNext = step.id === next.id;
          return (
            <li key={step.id}>
              <RouteLink
                route={{ name: "session", stepId: step.id }}
                className="step-card"
                data-stage={step.stage}
                data-done={done}
                data-next={isNext}
              >
                <span className="step-tile">
                  <span className="tile-caption">
                    {stageCaption[step.stage]}
                  </span>
                  <span className="tile-ordinal">
                    {stageOrdinal(step, steps)}
                  </span>
                  {done && (
                    <span className="tile-chip">
                      <Check size={12} strokeWidth={2.5} aria-hidden />
                      Done
                    </span>
                  )}
                  {isNext && (
                    <span className="tile-chip" data-kind="next">
                      Up next
                    </span>
                  )}
                </span>
                <span className="step-title">{step.title}</span>
                <span className="step-meta">
                  {step.minutes} min
                  {group &&
                    ` · ${result ? attemptResult(result) : "No result yet"}`}
                </span>
              </RouteLink>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
