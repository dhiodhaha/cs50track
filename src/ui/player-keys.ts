export const SEEK_SECONDS = 10;
/** One frame at the 30 fps CS50 records at. */
export const FRAME_SECONDS = 1 / 30;

export type PlayerAction =
  | { type: "toggle" }
  | { type: "seek"; by: number }
  | { type: "step"; by: number }
  | { type: "speed"; direction: 1 | -1 }
  | { type: "captions" }
  | { type: "mute" }
  | { type: "fullscreen" };

const ACTIONS: Record<string, PlayerAction> = {
  " ": { type: "toggle" },
  k: { type: "toggle" },
  ArrowLeft: { type: "seek", by: -SEEK_SECONDS },
  j: { type: "seek", by: -SEEK_SECONDS },
  ArrowRight: { type: "seek", by: SEEK_SECONDS },
  l: { type: "seek", by: SEEK_SECONDS },
  ",": { type: "step", by: -FRAME_SECONDS },
  ".": { type: "step", by: FRAME_SECONDS },
  "<": { type: "speed", direction: -1 },
  ">": { type: "speed", direction: 1 },
  c: { type: "captions" },
  m: { type: "mute" },
  f: { type: "fullscreen" },
};

export function actionForKey(key: string): PlayerAction | null {
  return ACTIONS[key.length === 1 ? key.toLowerCase() : key] ?? null;
}

/** The keys as the Shortcuts list shows them. `name` is what a screen reader says. */
export type KeyCap = { text: string; name: string };
const cap = (text: string, name = text): KeyCap => ({ text, name });
export const SHORTCUTS: { label: string; keys: KeyCap[]; press: string[] }[] = [
  { label: "Play or pause", keys: [cap("Space"), cap("K")], press: [" ", "k"] },
  {
    label: "Back 10 seconds",
    keys: [cap("←", "Left arrow"), cap("J")],
    press: ["ArrowLeft", "j"],
  },
  {
    label: "Forward 10 seconds",
    keys: [cap("→", "Right arrow"), cap("L")],
    press: ["ArrowRight", "l"],
  },
  {
    label: "One frame back, when paused",
    keys: [cap(",", "Comma")],
    press: [","],
  },
  {
    label: "One frame forward, when paused",
    keys: [cap(".", "Period")],
    press: ["."],
  },
  { label: "Slower", keys: [cap("<", "Less than")], press: ["<"] },
  { label: "Faster", keys: [cap(">", "Greater than")], press: [">"] },
  { label: "Captions on or off", keys: [cap("C")], press: ["c"] },
  { label: "Mute or unmute", keys: [cap("M")], press: ["m"] },
  { label: "Full screen", keys: [cap("F")], press: ["f"] },
];

/** The speed one step slower or faster, staying put at either end. */
export function stepSpeed(
  speeds: readonly number[],
  current: number,
  direction: 1 | -1,
): number {
  const index = speeds.indexOf(current);
  const from = index >= 0 ? index : 0;
  return speeds[Math.min(speeds.length - 1, Math.max(0, from + direction))]!;
}

export type KeyTarget = {
  closest(selector: string): unknown;
  isContentEditable?: boolean;
};

const TEXT_FIELD =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
const OWNS_EVERY_KEY =
  '[role="slider"], [role="radio"], [role="tab"], [role="option"], [role="menu"], [role="menuitem"], [role="listbox"], [aria-modal="true"], dialog[open]';
const PRESSED_BY_SPACE = 'button, a[href], summary, [role="button"]';

/**
 * True when the focused element already uses this key, so the video must leave
 * it alone: every key in a text field or composite widget, and space on
 * anything a space press activates.
 */
export function pageOwnsKey(target: KeyTarget | null, key: string): boolean {
  if (!target || typeof target.closest !== "function") return false;
  if (target.isContentEditable || target.closest(TEXT_FIELD)) return true;
  if (target.closest(OWNS_EVERY_KEY)) return true;
  return key === " " && Boolean(target.closest(PRESSED_BY_SPACE));
}
