import {
  ArrowLeft,
  BookOpen,
  ListTree,
  PanelLeft,
  Pause,
  Play,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { pauseSession, resumeSession, sessionSeconds } from "../lib/sessions";
import { ignore, useStudy } from "./context";
import { mediaTime } from "./format";
import { Popover } from "./popover";

export type OutlineItem = { id: string; label: string };
export type Term = { term: string; meaning: string };

function SessionTimer() {
  const { state, update } = useStudy();
  const [now, setNow] = useState(() => new Date());
  const active = state.sessions.find(
    (session) => session.id === state.activeSessionId,
  );
  const running = active?.status === "running";
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [running]);
  const open = active && active.status !== "finished" ? active : undefined;
  return (
    <div className="timer">
      <span
        className="timer-digits"
        role="timer"
        aria-label="Time on this step"
      >
        {mediaTime(open ? sessionSeconds(open, now) : 0)}
      </span>
      {open && (
        <button
          type="button"
          className="bar-button"
          aria-label={running ? "Pause timer" : "Resume timer"}
          onClick={() =>
            void update((s) =>
              running
                ? pauseSession(s, new Date())
                : resumeSession(s, open.id, new Date()),
            ).catch(ignore)
          }
        >
          {running ? (
            <Pause size={16} aria-hidden />
          ) : (
            <Play size={16} aria-hidden />
          )}
        </button>
      )}
    </div>
  );
}

/** The only chrome in a session: exit, where you are, a timer and two helpers. */
export function SessionBar({
  title,
  position,
  timer = true,
  outline,
  activeId,
  terms,
  onExit,
  onSearch,
  onOutline,
  sidebarHidden = false,
  onShowSidebar,
}: {
  title: string;
  position?: string;
  timer?: boolean;
  outline?: OutlineItem[];
  activeId?: string;
  terms?: Term[];
  onExit: () => void;
  onSearch: () => void;
  /** Opens the course outline in a sheet, on screens too narrow for the sidebar. */
  onOutline?: () => void;
  sidebarHidden?: boolean;
  onShowSidebar?: () => void;
}) {
  return (
    <header className="session-bar">
      <button
        type="button"
        className="bar-button"
        aria-label="Exit"
        onClick={onExit}
      >
        <ArrowLeft size={16} aria-hidden />
        <span className="bar-label" aria-hidden>
          Exit
        </span>
      </button>
      {onOutline && (
        <button
          type="button"
          className="bar-button outline-open"
          aria-label="Outline"
          aria-haspopup="dialog"
          onClick={onOutline}
        >
          <PanelLeft size={16} aria-hidden />
          <span className="bar-label" aria-hidden>
            Outline
          </span>
        </button>
      )}
      {sidebarHidden && onShowSidebar && (
        <button
          type="button"
          className="bar-button outline-show"
          aria-label="Show outline"
          onClick={onShowSidebar}
        >
          <PanelLeft size={16} aria-hidden />
          <span className="bar-label" aria-hidden>
            Outline
          </span>
        </button>
      )}
      <div className="session-title">
        <span className="session-name">{title}</span>
        {position && <span className="session-position">{position}</span>}
      </div>
      {timer && <SessionTimer />}
      {outline && outline.length > 0 && (
        <Popover
          label="On this page"
          className="outline-popover"
          trigger={
            <>
              <ListTree size={16} aria-hidden />
              <span className="bar-label">On this page</span>
            </>
          }
        >
          {(close) => (
            <ul className="outline-list">
              {outline.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    aria-current={activeId === item.id ? "location" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      scrollToId(item.id);
                      close();
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Popover>
      )}
      {terms && terms.length > 0 && (
        <Popover
          label="Terms"
          trigger={
            <>
              <BookOpen size={16} aria-hidden />
              <span className="bar-label">Terms</span>
            </>
          }
        >
          {() => (
            <dl className="terms">
              {terms.map((item) => (
                <div key={item.term}>
                  <dt>{item.term}</dt>
                  <dd>{item.meaning}</dd>
                </div>
              ))}
            </dl>
          )}
        </Popover>
      )}
      <button
        type="button"
        className="bar-button"
        aria-label="Search the course"
        onClick={onSearch}
      >
        <Search size={16} aria-hidden />
        <span className="bar-label">Search</span>
      </button>
    </header>
  );
}

export function scrollToId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ block: "start" });
  target.tabIndex = -1;
  target.focus({ preventScroll: true });
}

/** Where a section counts as "reached": a third of the way down the space under the sticky bar. */
const READING_LINE = 0.33;
const BAR_HEIGHT = 72;

/** The id of the last section whose top has passed the reading line. At the very bottom of the page it is the last one, since a short final section may never reach the line. */
export function useActiveSection(ids: string[], enabled: boolean) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");
  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line =
        BAR_HEIGHT + (window.innerHeight - BAR_HEIGHT) * READING_LINE;
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      let current = ids[0] ?? "";
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= line)
          current = id;
      }
      setActive(atBottom && ids.length > 0 ? ids[ids.length - 1]! : current);
    };
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Images and diagrams load after first paint and move the sections.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [key, enabled]);
  return active;
}
