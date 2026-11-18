export type Chapter = { start: number; title: string };

/**
 * The chapters that overlap `start` to `end`. A chapter runs until the next
 * one begins, so one that starts before the range but is still playing when the
 * range opens is included.
 */
export function chaptersInRange(
  chapters: readonly Chapter[],
  start: number,
  end: number,
  videoSeconds: number,
): Chapter[] {
  return chapters.filter((chapter, index) => {
    const runsUntil = chapters[index + 1]?.start ?? videoSeconds;
    return chapter.start < end && runsUntil > start;
  });
}

/** Index of the chapter playing at `time`, or -1 before the first one. */
export function chapterIndexAt(
  chapters: readonly Chapter[],
  time: number,
): number {
  let found = -1;
  chapters.forEach((chapter, index) => {
    if (chapter.start <= time + 0.25) found = index;
  });
  return found;
}
