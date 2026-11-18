export function friendlyDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" },
) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    ...options,
    timeZone: "UTC",
  });
}

export const longDate = (date: string) =>
  friendlyDate(date, { weekday: "long", day: "numeric", month: "long" });

export function daysUntil(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  );
}

export function plural(count: number, one: string, many = `${one}s`) {
  return `${count} ${count === 1 ? one : many}`;
}

/** 1530 becomes "25:30", 5400 becomes "1:30:00". */
export function mediaTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** A chapter's time badge: h:mm:ss when the whole video runs over an hour, else m:ss. */
export function chapterTime(seconds: number, videoSeconds: number): string {
  if (videoSeconds < 3600) return mediaTime(seconds);
  const total = Math.max(0, Math.floor(seconds));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${Math.floor(total / 3600)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}

/** CS50 writes some chapter titles as "– Functions"; the dash is list markup, not part of the name. */
export const chapterTitle = (title: string) =>
  title.replace(/^\s*[–—-]\s+/, "").trim();
