import { ExternalLink, Keyboard, List } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { chapterIndexAt, chaptersInRange, type Chapter } from "./chapters";
import { chapterTime, chapterTitle, mediaTime } from "./format";
import { SHORTCUTS, actionForKey, pageOwnsKey, stepSpeed } from "./player-keys";
import { Popover } from "./popover";
import { readLocal, writeLocal } from "./storage";

const SPEEDS = [1, 1.25, 1.5, 2];
const SPEED_KEY = "cs50track.speed";
const positionKey = (stepId: string) => `cs50track.position.${stepId}`;
/** How far past `end` a timeupdate can land and still count as playing through it. */
const END_WINDOW_SECONDS = 1.5;
const NO_CHAPTERS: Chapter[] = [];

export type Media = {
  mp4: string | null;
  captions: string | null;
  youtubeId: string | null;
  durationSeconds?: number;
  /** CS50's own chapter list, empty when it publishes none. */
  chapters?: Chapter[];
};

/** Where to resume: the saved spot if it lies inside the range, else the start. */
export function resumeAt(
  saved: number,
  start: number,
  end: number | undefined,
  duration: number,
): number {
  const inside =
    Number.isFinite(saved) &&
    saved > start &&
    saved < duration &&
    (end === undefined || saved < end - 1);
  return inside ? saved : start;
}

function playFrom(video: HTMLVideoElement, seconds: number) {
  video.currentTime = seconds;
  void video.play().catch(() => undefined);
}

/** Jump the page's video to a time, bring it into view and play. */
export function seekVideo(seconds: number) {
  const video = document.querySelector<HTMLVideoElement>(".video-frame video");
  if (!video) return;
  playFrom(video, seconds);
  video.scrollIntoView({ block: "center" });
}

export function StepVideo({
  media,
  title,
  stepId,
  start = 0,
  end,
  range,
}: {
  media: Media;
  title: string;
  stepId: string;
  start?: number;
  end?: number;
  range?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [failed, setFailed] = useState(false);
  const [ended, setEnded] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const passed = useRef(false);
  const lastSaved = useRef(0);
  const chapters = media.chapters ?? NO_CHAPTERS;
  const videoSeconds =
    media.durationSeconds ?? chapters[chapters.length - 1]?.start ?? 0;
  const inPart = useMemo(
    () =>
      end === undefined
        ? chapters
        : chaptersInRange(chapters, start, end, videoSeconds),
    [chapters, start, end, videoSeconds],
  );

  useEffect(() => {
    const stored = Number(readLocal(SPEED_KEY));
    if (SPEEDS.includes(stored)) setSpeed(stored);
  }, []);
  useEffect(() => {
    if (video.current) video.current.playbackRate = speed;
  }, [speed]);
  useEffect(() => {
    const element = video.current;
    return () => {
      if (element && element.currentTime > 0)
        writeLocal(
          positionKey(stepId),
          String(Math.floor(element.currentTime)),
        );
    };
  }, [stepId]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const element = video.current;
      if (!element || event.defaultPrevented || event.isComposing) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      const action = actionForKey(event.key);
      if (!action) return;
      if (pageOwnsKey(event.target as Element | null, event.key)) return;
      const repeats = action.type === "seek" || action.type === "step";
      if (event.repeat && !repeats) return;

      if (action.type === "toggle") {
        if (element.paused) void element.play().catch(() => undefined);
        else element.pause();
      } else if (action.type === "seek") {
        const limit = Number.isFinite(element.duration)
          ? element.duration
          : Infinity;
        element.currentTime = Math.min(
          limit,
          Math.max(0, element.currentTime + action.by),
        );
      } else if (action.type === "step") {
        if (!element.paused) return;
        element.currentTime = Math.max(0, element.currentTime + action.by);
      } else if (action.type === "speed") {
        const next = stepSpeed(SPEEDS, speed, action.direction);
        setSpeed(next);
        writeLocal(SPEED_KEY, String(next));
        setAnnouncement(`Speed ${next}x`);
      } else if (action.type === "captions") {
        const track = element.textTracks[0];
        if (!track) return;
        track.mode = track.mode === "showing" ? "hidden" : "showing";
        setAnnouncement(
          track.mode === "showing" ? "Captions on" : "Captions off",
        );
      } else if (action.type === "mute") {
        element.muted = !element.muted;
        setAnnouncement(element.muted ? "Muted" : "Sound on");
      } else if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => undefined);
      } else {
        void element.requestFullscreen?.().catch(() => undefined);
      }
      event.preventDefault();
      if (event.target === element) event.stopPropagation();
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [speed]);

  const youtube = media.youtubeId
    ? `https://youtu.be/${media.youtubeId}?t=${Math.floor(start)}`
    : null;

  if (!media.mp4 || failed)
    return (
      <div className="video-fallback" role="group" aria-label="Video">
        <p>This video cannot play in the page.</p>
        {youtube ? (
          <a
            className="button primary"
            href={youtube}
            target="_blank"
            rel="noreferrer"
          >
            Watch on YouTube <ExternalLink size={14} aria-hidden />
          </a>
        ) : (
          <p>No other copy is available for this video.</p>
        )}
        {range && <p className="video-range">{range}</p>}
      </div>
    );

  return (
    <div className="video">
      <div className="video-frame">
        <video
          ref={video}
          controls
          playsInline
          preload="metadata"
          aria-label={title}
          src={media.mp4}
          onError={() => setFailed(true)}
          onPlay={() => setEnded(false)}
          onSeeking={(event) => {
            if (end !== undefined && event.currentTarget.currentTime >= end)
              passed.current = true;
          }}
          onLoadedMetadata={(event) => {
            const element = event.currentTarget;
            const saved = Number(readLocal(positionKey(stepId)));
            const at = resumeAt(saved, start, end, element.duration);
            if (end !== undefined && saved >= end) passed.current = true;
            if (at > 0) element.currentTime = at;
            element.playbackRate = speed;
          }}
          onTimeUpdate={(event) => {
            const element = event.currentTarget;
            const time = element.currentTime;
            if (Math.abs(time - lastSaved.current) >= 5) {
              lastSaved.current = time;
              writeLocal(positionKey(stepId), String(Math.floor(time)));
            }
            if (end === undefined || passed.current) return;
            if (time >= end + END_WINDOW_SECONDS) passed.current = true;
            else if (time >= end) {
              passed.current = true;
              element.pause();
              setEnded(true);
            }
          }}
        >
          {media.captions && (
            <track
              kind="captions"
              src={media.captions}
              srcLang="en"
              label="English"
            />
          )}
        </video>
        {ended && (
          <div className="video-end" role="status">
            <p>End of this part</p>
            <button
              type="button"
              className="button primary small"
              onClick={() => {
                setEnded(false);
                void video.current?.play();
              }}
            >
              Keep watching
            </button>
          </div>
        )}
      </div>
      <div className="video-meta">
        {range && <span className="video-range">{range}</span>}
        <div className="speed" role="group" aria-label="Playback speed">
          {SPEEDS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={speed === value}
              onClick={() => {
                setSpeed(value);
                writeLocal(SPEED_KEY, String(value));
              }}
            >
              {value}x
            </button>
          ))}
        </div>
        {chapters.length > 0 && (
          <Popover
            label="Chapters"
            className="video-popover chapters-popover"
            triggerClassName="video-button"
            align="start"
            returnFocus
            trigger={
              <>
                <List
                  size={16}
                  strokeWidth={2}
                  absoluteStrokeWidth
                  aria-hidden
                />
                Chapters
              </>
            }
          >
            {(close) => (
              <ChapterList
                all={chapters}
                inPart={inPart}
                videoSeconds={videoSeconds}
                video={video}
                onPick={(seconds) => {
                  if (video.current) playFrom(video.current, seconds);
                  close();
                }}
              />
            )}
          </Popover>
        )}
        <Popover
          label="Shortcuts"
          className="video-popover"
          triggerClassName="video-button"
          align="start"
          trigger={
            <>
              <Keyboard
                size={16}
                strokeWidth={2}
                absoluteStrokeWidth
                aria-hidden
              />
              Shortcuts
            </>
          }
        >
          {() => <ShortcutList />}
        </Popover>
        {youtube && (
          <a
            className="text-link"
            href={youtube}
            target="_blank"
            rel="noreferrer"
          >
            Open on YouTube
          </a>
        )}
      </div>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}

function ChapterList({
  all,
  inPart,
  videoSeconds,
  video,
  onPick,
}: {
  all: Chapter[];
  inPart: Chapter[];
  videoSeconds: number;
  video: RefObject<HTMLVideoElement | null>;
  onPick: (seconds: number) => void;
}) {
  const canScope = inPart.length > 0 && inPart.length < all.length;
  const [whole, setWhole] = useState(!canScope);
  const [time, setTime] = useState(() => video.current?.currentTime ?? 0);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    const sync = () => setTime(element.currentTime);
    sync();
    element.addEventListener("timeupdate", sync);
    element.addEventListener("seeked", sync);
    return () => {
      element.removeEventListener("timeupdate", sync);
      element.removeEventListener("seeked", sync);
    };
  }, [video]);

  useLayoutEffect(() => {
    const panel = list.current?.closest<HTMLElement>(".popover-panel");
    const row = list.current?.querySelector<HTMLElement>(
      '[aria-current="true"]',
    );
    if (!panel || !row) return;
    const box = panel.getBoundingClientRect();
    const at = row.getBoundingClientRect();
    panel.scrollTop += at.top - box.top - (box.height - at.height) / 2;
  }, [whole]);

  const playing = all[chapterIndexAt(all, time)];
  return (
    <div className="chapters">
      <div className="chapters-head">
        <span>{whole ? "Whole lecture" : "In this part"}</span>
        {canScope && (
          <button
            type="button"
            className="chapters-scope"
            onClick={() => setWhole(!whole)}
          >
            {whole ? "Show this part only" : "Show the whole lecture"}
          </button>
        )}
      </div>
      <ol className="chapter-list" ref={list}>
        {(whole ? all : inPart).map((chapter) => {
          const current = chapter === playing;
          return (
            <li key={`${chapter.start}-${chapter.title}`}>
              <button
                type="button"
                className="chapter-row"
                aria-current={current ? "true" : undefined}
                onClick={() => onPick(chapter.start)}
              >
                <span className="chapter-time">
                  {chapterTime(chapter.start, videoSeconds)}
                </span>
                <span className="chapter-title">
                  {chapterTitle(chapter.title) || "Chapter"}
                </span>
                {current && <span className="chapter-now">Now</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ShortcutList() {
  return (
    <dl className="shortcut-list">
      {SHORTCUTS.map((shortcut) => (
        <div key={shortcut.label}>
          <dt>{shortcut.label}</dt>
          <dd>
            {shortcut.keys.map((key) => (
              <kbd key={key.text}>
                <span aria-hidden>{key.text}</span>
                <span className="sr-only">{key.name}</span>
              </kbd>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export const rangeLabel = (start: number, end: number) =>
  `${mediaTime(start)} to ${mediaTime(end)} of the lecture`;
