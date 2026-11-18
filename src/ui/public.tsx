import { useQuery } from "@tanstack/react-query";
import { publicSummarySchema, type PublicSummary } from "../lib/public";
import "./public.css";

type Week = PublicSummary["weeks"][number];

const statusLabel: Record<Week["status"], { word: string; mark: string }> = {
  "on-time": { word: "On time", mark: "✓" },
  late: { word: "Late", mark: "!" },
  missed: { word: "Missed", mark: "✕" },
  current: { word: "This week", mark: "●" },
  upcoming: { word: "Upcoming", mark: "○" },
};

const dateFormat = (options: Intl.DateTimeFormatOptions) => {
  const format = new Intl.DateTimeFormat("en-GB", {
    ...options,
    timeZone: "UTC",
  });
  return (date: string) => format.format(new Date(`${date}T00:00:00Z`));
};
const longDate = dateFormat({ day: "numeric", month: "long", year: "numeric" });
const shortDate = dateFormat({ day: "numeric", month: "short" });

const daysBetween = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );

const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

export function countdownText(summary: PublicSummary): string {
  const target = longDate(summary.targetDate);
  const left = daysBetween(summary.today, summary.targetDate);
  if (left > 0) return `Finishing by ${target} · ${plural(left, "day")} left`;
  if (left === 0) return `Finishing by ${target} · last day`;
  return `Planned finish was ${target}`;
}

export function hoursText(minutes: number): string {
  const hours = Math.round(minutes / 6) / 10;
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
}

async function loadPublic(signal: AbortSignal): Promise<PublicSummary | null> {
  const response = await fetch("/api/public", { signal, cache: "no-cache" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("The record could not be loaded.");
  return publicSummarySchema.parse(await response.json());
}

function Home() {
  return (
    <p className="pub-home">
      <a href="/">CS50Track</a>
    </p>
  );
}

function WeekRow({ week }: { week: Week }) {
  const { word, mark } = statusLabel[week.status];
  return (
    <li className="pub-week" data-status={week.status}>
      <div className="pub-week-name">
        <h3>{week.title}</h3>
        <p>{week.topic}</p>
      </div>
      <p className="pub-week-due">Due {shortDate(week.deadline)}</p>
      <p className="pub-week-status">
        <span className="pub-mark" aria-hidden="true">
          {mark}
        </span>
        <strong>{word}</strong>
        {week.closedOn ? (
          <span> · closed {shortDate(week.closedOn)}</span>
        ) : null}
      </p>
    </li>
  );
}

export function PublicPage() {
  const record = useQuery({
    queryKey: ["public-record"],
    queryFn: ({ signal }) => loadPublic(signal),
  });
  if (record.isPending)
    return (
      <main className="pub" aria-busy="true">
        <p className="pub-note">Loading the record…</p>
      </main>
    );
  if (record.isError)
    return (
      <main className="pub">
        <p className="pub-note">The record could not be loaded.</p>
        <button type="button" onClick={() => void record.refetch()}>
          Try again
        </button>
        <Home />
      </main>
    );
  const summary = record.data;
  if (!summary)
    return (
      <main className="pub">
        <h1>This progress page is private.</h1>
        <Home />
      </main>
    );
  return (
    <main className="pub">
      <header>
        <h1>{summary.name || "CS50x in ten weeks"}</h1>
        <p className="pub-lede">
          Working through Harvard CS50x in ten weeks. Each week is marked on
          time, late or missed against its own deadline. Results are recorded by
          the learner from CS50's own checker.
        </p>
      </header>
      <p className="pub-countdown">{countdownText(summary)}</p>
      <ol className="pub-weeks" aria-label="Weekly record">
        {summary.weeks.map((week) => (
          <WeekRow key={week.unitId} week={week} />
        ))}
      </ol>
      <p className="pub-totals">
        {plural(summary.stepsDone, "step")} done ·{" "}
        {plural(summary.activeDays, "day")} active ·{" "}
        {hoursText(summary.studyMinutes)} studied
      </p>
      <Home />
    </main>
  );
}
