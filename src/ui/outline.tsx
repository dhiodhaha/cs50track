import { Check, ChevronLeft, ChevronRight, PanelLeftClose } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { courseUnits } from "../lib/course";
import { stepDone, unitSteps, type Step } from "../lib/flow";
import { useStudy } from "./context";
import { unitCaption } from "./course-grid";
import { RouteLink } from "./route-link";
import { Sheet } from "./sheet";
import { groupByStage, stageHeading } from "./steps";
import { readLocal, writeLocal } from "./storage";

const HIDDEN_KEY = "cs50track.outline.hidden";

/** Whether the learner chose to hide the desktop sidebar. Remembered in this browser. */
export function useSidebarHidden(): [boolean, (hidden: boolean) => void] {
  const [hidden, setHidden] = useState(() => readLocal(HIDDEN_KEY) === "1");
  return [
    hidden,
    (next) => {
      setHidden(next);
      writeLocal(HIDDEN_KEY, next ? "1" : null);
    },
  ];
}

/** The unit's steps by stage, with a control to browse the other units. */
export function CourseOutline({ step }: { step: Step }) {
  const { state, flow } = useStudy();
  const [index, setIndex] = useState(() =>
    courseUnits.findIndex((unit) => unit.id === step.unitId),
  );
  const unit = courseUnits[index]!;
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    list.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);

  return (
    <nav className="outline" aria-label="Course outline">
      <div className="outline-unit">
        <button
          type="button"
          className="outline-arrow"
          aria-label="Previous unit"
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          <ChevronLeft size={18} aria-hidden />
        </button>
        <div className="outline-unit-name" aria-live="polite">
          <span className="card-caption">{unitCaption(unit)}</span>
          <span className="outline-title">{unit.topic}</span>
        </div>
        <button
          type="button"
          className="outline-arrow"
          aria-label="Next unit"
          disabled={index === courseUnits.length - 1}
          onClick={() => setIndex(index + 1)}
        >
          <ChevronRight size={18} aria-hidden />
        </button>
      </div>
      <div ref={list} className="outline-groups">
        {groupByStage(unitSteps(flow, unit)).map((group) => (
          <div key={group.stage}>
            <h3 className="outline-stage">{stageHeading[group.stage]}</h3>
            <ul>
              {group.steps.map((item) => (
                <li key={item.id}>
                  <RouteLink
                    route={{ name: "session", stepId: item.id }}
                    className="outline-row"
                    aria-current={item.id === step.id ? "page" : undefined}
                  >
                    <span>{item.title}</span>
                    {stepDone(item, state) && (
                      <Check size={14} aria-label="Done" />
                    )}
                  </RouteLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/** The sticky left column of a session on a wide screen. */
export function OutlineSidebar({
  step,
  onHide,
}: {
  step: Step;
  onHide: () => void;
}) {
  return (
    <div className="outline-side">
      <div className="outline-scroll">
        <div className="outline-bar">
          <span className="rail-title">Outline</span>
          <button
            type="button"
            className="outline-hide"
            aria-label="Hide outline"
            onClick={onHide}
          >
            <PanelLeftClose size={16} aria-hidden />
          </button>
        </div>
        <CourseOutline step={step} />
      </div>
    </div>
  );
}

/** The same outline in a sheet from the left, for screens too narrow for the sidebar. */
export function OutlineSheet({
  step,
  open,
  onClose,
}: {
  step: Step;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} side="start" label="Outline" onClose={onClose}>
      <div className="outline-scroll">
        <CourseOutline step={step} />
      </div>
    </Sheet>
  );
}

/** Everything a session needs for the outline: bar controls, the sidebar and the sheet. */
export function useOutlineNav(step: Step): {
  bar: {
    onOutline: () => void;
    sidebarHidden: boolean;
    onShowSidebar: () => void;
  };
  sidebar: ReactNode;
  sheet: ReactNode;
  sidebarOn: boolean;
} {
  const [hidden, setHidden] = useSidebarHidden();
  const [sheetOpen, setSheetOpen] = useState(false);
  return {
    bar: {
      onOutline: () => setSheetOpen(true),
      sidebarHidden: hidden,
      onShowSidebar: () => setHidden(false),
    },
    sidebar: hidden ? null : (
      <OutlineSidebar step={step} onHide={() => setHidden(true)} />
    ),
    sheet: (
      <OutlineSheet
        step={step}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    ),
    sidebarOn: !hidden,
  };
}
