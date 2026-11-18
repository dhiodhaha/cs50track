import { Check } from "lucide-react";
import type { StageSummary } from "../lib/flow";

/** One line of stage counts for a unit, with the stage in progress underlined. */
export function StageLine({
  stages,
  label,
  current,
}: {
  stages: StageSummary[];
  label: string;
  current?: StageSummary["stage"];
}) {
  return (
    <ol className="stage-line" aria-label={label}>
      {stages.map((stage) => {
        const complete = stage.done === stage.total;
        return (
          <li
            key={stage.stage}
            data-complete={complete}
            aria-current={stage.stage === current ? "step" : undefined}
          >
            {complete && <Check size={14} aria-label="Finished" />}
            {stage.label}
            {stage.total > 1 && (
              <span className="stage-count">
                {" "}
                {stage.done}/{stage.total}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
