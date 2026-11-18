import { Check } from "lucide-react";
import { useState } from "react";
import { courseUnits } from "../lib/course";
import { stepDone, unitStages, unitSteps, type Step } from "../lib/flow";
import type { Assignment } from "../lib/model";
import {
  calendarWeek,
  unitDeadline,
  weekRecord,
  type WeekRecord,
  type WeekStatus,
} from "../lib/pace";
import { latestAttempt } from "../lib/progress";
import { useStudy } from "./context";
import { UnitThumb, unitCaption } from "./course-grid";
import { friendlyDate, longDate } from "./format";
import { ResultForm } from "./forms";
import { closeUnitSheet, navigate } from "./route";
import { RouteLink } from "./route-link";
import { Sheet } from "./sheet";
import { StageLine } from "./stage-line";
import { attemptSummary, groupByStage, stepGroup, stageHeading } from "./steps";
import { stickerVars } from "./unit-colors";

const statusText: Record<WeekStatus, string> = {
  "on-time": "On time",
  late: "Late",
  missed: "Missed",
  current: "This week",
  upcoming: "Upcoming",
};

export const statusLine = (record: WeekRecord) =>
  record.closedOn
    ? `${statusText[record.status]} · closed ${friendlyDate(record.closedOn)}`
    : statusText[record.status];

/** The week sheet. It keeps showing the last unit while it slides out. */
export function WeekSheet({ unitId }: { unitId: string | undefined }) {
  const { state, update } = useStudy();
  const [shown, setShown] = useState(unitId);
  const [recording, setRecording] = useState<Assignment | null>(null);
  if (unitId && unitId !== shown) setShown(unitId);
  const unit = courseUnits.find((item) => item.id === shown);
  return (
    <>
      <Sheet
        open={unitId !== undefined}
        label={unit ? `${unit.title} · ${unit.topic}` : "Week"}
        onClose={closeUnitSheet}
        fallbackFocus={() =>
          document.querySelector<HTMLElement>(
            `.course-card[data-unit="${shown}"]`,
          )
        }
      >
        {unit && <WeekDetail unitId={unit.id} onRecord={setRecording} />}
      </Sheet>
      {recording && (
        <ResultForm
          state={state}
          assignment={recording}
          update={update}
          onClose={() => setRecording(null)}
        />
      )}
    </>
  );
}

function WeekDetail({
  unitId,
  onRecord,
}: {
  unitId: string;
  onRecord: (assignment: Assignment) => void;
}) {
  const { state, flow, today } = useStudy();
  const unit = courseUnits.find((item) => item.id === unitId)!;
  const steps = unitSteps(flow, unit);
  const open = steps.find((step) => !stepDone(step, state));
  const record = weekRecord(state, today).find(
    (item) => item.unitId === unitId,
  );
  const deadline = unitDeadline(unit.id, state.settings.startDate);
  const project = latestAttempt("project", state.attempts);
  return (
    <div className="sheet-content" style={stickerVars(unit.id)}>
      <UnitThumb unitId={unit.id} />
      <header className="sheet-head">
        <p className="card-caption">
          {unitCaption(unit)} · Plan week {calendarWeek(unit.id)}
        </p>
        <h2 className="sheet-title">{unit.topic}</h2>
        <p className="sheet-due">
          <span>
            {unit.groups.length === 0 ? "Week ends " : "Due "}
            {longDate(deadline)}
          </span>
          {record && (
            <span className="chip" data-status={record.status}>
              {statusLine(record)}
            </span>
          )}
        </p>
      </header>

      <StageLine
        stages={unitStages(flow, unit, state)}
        label={`${unit.title} stages`}
        current={open?.stage}
      />

      {open ? (
        <button
          type="button"
          className="button primary large sheet-start"
          onClick={() => navigate({ name: "session", stepId: open.id })}
        >
          Start · {open.title} · {open.minutes} min
        </button>
      ) : (
        <p className="sheet-complete">
          <Check size={18} aria-hidden /> Week complete
        </p>
      )}

      <div className="sheet-steps">
        {groupByStage(steps).map((group) => (
          <div key={group.stage}>
            <h3 className="sheet-stage">{stageHeading[group.stage]}</h3>
            <ul className="step-list">
              {group.steps.map((step) => (
                <StepRow key={step.id} step={step} onRecord={onRecord} />
              ))}
            </ul>
          </div>
        ))}
        {unit.id === "project" && (
          <div>
            <h3 className="sheet-stage">Result</h3>
            <ul className="step-list">
              <li className="step-row">
                <span className="step-open">
                  <span className="step-mark" aria-hidden />
                  <span>
                    Final project result
                    <small>
                      {project
                        ? attemptSummary(project, state.settings.timezone)
                        : "Not recorded yet"}
                    </small>
                  </span>
                </span>
                <div className="attempts">
                  <button
                    type="button"
                    className="button secondary small"
                    onClick={() => onRecord(unit.groups[0]!.assignments[0]!)}
                  >
                    Record result
                  </button>
                </div>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StepRow({
  step,
  onRecord,
}: {
  step: Step;
  onRecord: (assignment: Assignment) => void;
}) {
  const { state } = useStudy();
  const done = stepDone(step, state);
  const group = stepGroup(step);
  return (
    <li className="step-row" data-done={done}>
      <RouteLink
        route={{ name: "session", stepId: step.id }}
        className="step-open"
      >
        <span className="step-mark" aria-hidden>
          {done && <Check size={13} />}
        </span>
        <span>
          {step.title}
          <small>
            {done ? "Done · " : ""}
            {step.minutes} min
            {group && group.assignments.length > 1 ? " · choose one" : ""}
          </small>
        </span>
      </RouteLink>
      {group && (
        <div className="attempts">
          {group.assignments.map((assignment) => {
            const attempt = latestAttempt(assignment.id, state.attempts);
            return (
              <div className="attempt-row" key={assignment.id}>
                <span>
                  {group.assignments.length > 1 && (
                    <strong>{assignment.title}. </strong>
                  )}
                  {attempt
                    ? attemptSummary(attempt, state.settings.timezone)
                    : "No result yet"}
                </span>
                <button
                  type="button"
                  className="button secondary small"
                  aria-label={`Record result for ${assignment.title}`}
                  onClick={() => onRecord(assignment)}
                >
                  Record result
                </button>
              </div>
            );
          })}
        </div>
      )}
    </li>
  );
}
