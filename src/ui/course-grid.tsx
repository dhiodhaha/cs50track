import { Check, CircleAlert, Clock3, Star } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { courseUnits } from "../lib/course";
import { stepDone, unitSteps } from "../lib/flow";
import type { CourseUnit } from "../lib/model";
import { unitDeadline, weekRecord, type WeekStatus } from "../lib/pace";
import { useStudy } from "./context";
import { friendlyDate } from "./format";
import { RouteLink } from "./route-link";
import { stickerFor, stickerVars, thumbUrl } from "./unit-colors";

const statusText: Record<WeekStatus, string> = {
  "on-time": "On time",
  late: "Late",
  missed: "Missed",
  current: "This week",
  upcoming: "Upcoming",
};

const statusIcon: Partial<Record<WeekStatus, typeof Check>> = {
  "on-time": Check,
  late: Clock3,
  missed: CircleAlert,
};

export const unitCaption = (unit: CourseUnit) =>
  unit.id === "project" ? "Final project" : `Week ${unit.index}`;

/** A flat sticker tile with the unit's mark, covered by its picture when one loads. */
export function UnitThumb({ unitId, tag }: { unitId: string; tag?: string }) {
  const [missing, setMissing] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const element = image.current;
    if (element?.complete && element.naturalWidth === 0) setMissing(true);
  }, []);
  const { glyph } = stickerFor(unitId);
  return (
    <span className="thumb" style={stickerVars(unitId)} data-unit={unitId}>
      <span className="thumb-glyph" aria-hidden>
        {glyph === "star" ? (
          <Star className="thumb-star" fill="currentColor" strokeWidth={0} />
        ) : (
          glyph
        )}
      </span>
      {!missing && (
        <img
          ref={image}
          src={thumbUrl(unitId)}
          alt=""
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          onError={() => setMissing(true)}
        />
      )}
      {tag && <span className="thumb-tag">{tag}</span>}
    </span>
  );
}

export function CourseGrid({
  currentUnitId,
}: {
  currentUnitId: string | null;
}) {
  const { state, flow, today } = useStudy();
  const records = weekRecord(state, today);
  return (
    <section className="course" aria-labelledby="course-title">
      <h2 id="course-title" className="pill-label">
        The course
      </h2>
      <ol className="course-grid">
        {courseUnits.map((unit) => {
          const steps = unitSteps(flow, unit);
          const done = steps.filter((step) => stepDone(step, state)).length;
          const record = records.find((item) => item.unitId === unit.id);
          const Icon = record ? statusIcon[record.status] : undefined;
          const current = unit.id === currentUnitId;
          const deadline = unitDeadline(unit.id, state.settings.startDate);
          const percent = steps.length ? (done / steps.length) * 100 : 0;
          return (
            <li key={unit.id}>
              <RouteLink
                route={{ name: "home", unitId: unit.id }}
                className="course-card"
                data-unit={unit.id}
                data-current={current}
                aria-current={current ? "true" : undefined}
                aria-haspopup="dialog"
              >
                <UnitThumb
                  unitId={unit.id}
                  tag={current ? "Up next" : undefined}
                />
                <span className="card-body">
                  <span className="card-caption">{unitCaption(unit)}</span>
                  <h3 className="card-title">{unit.topic}</h3>
                  <span className="card-meta">
                    <span>
                      {unit.groups.length === 0 ? "Week ends " : "Due "}
                      {friendlyDate(deadline)}
                    </span>
                    {record && (
                      <span className="card-status" data-status={record.status}>
                        {Icon && <Icon size={14} aria-hidden />}
                        {statusText[record.status]}
                      </span>
                    )}
                  </span>
                  <span className="card-bar" aria-hidden>
                    <span style={{ "--pct": `${percent}%` } as CSSProperties} />
                  </span>
                  <span className="card-steps">
                    {done} of {steps.length}{" "}
                    {steps.length === 1 ? "step" : "steps"}
                  </span>
                </span>
              </RouteLink>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
