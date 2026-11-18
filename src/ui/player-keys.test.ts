import { describe, expect, it } from "vitest";
import { chapterIndexAt, chaptersInRange } from "./chapters";
import { chapterTime, chapterTitle } from "./format";
import {
  SHORTCUTS,
  actionForKey,
  pageOwnsKey,
  stepSpeed,
  type KeyTarget,
} from "./player-keys";

const SPEEDS = [1, 1.25, 1.5, 2];

describe("actionForKey", () => {
  it("matches CS50's player", () => {
    expect(actionForKey(" ")).toEqual({ type: "toggle" });
    expect(actionForKey("k")).toEqual({ type: "toggle" });
    expect(actionForKey("K")).toEqual({ type: "toggle" });
    expect(actionForKey("l")).toEqual({ type: "seek", by: 10 });
    expect(actionForKey("ArrowLeft")).toEqual({ type: "seek", by: -10 });
    expect(actionForKey(",")).toEqual({ type: "step", by: -1 / 30 });
    expect(actionForKey(">")).toEqual({ type: "speed", direction: 1 });
    expect(actionForKey("c")).toEqual({ type: "captions" });
    expect(actionForKey("m")).toEqual({ type: "mute" });
    expect(actionForKey("f")).toEqual({ type: "fullscreen" });
    expect(actionForKey("Enter")).toBeNull();
    expect(actionForKey("a")).toBeNull();
  });

  it("answers for every key the Shortcuts list shows", () => {
    for (const shortcut of SHORTCUTS)
      for (const key of shortcut.press)
        expect(actionForKey(key), `${shortcut.label}: ${key}`).not.toBeNull();
  });
});

describe("stepSpeed", () => {
  it("moves through the speed options and stops at the ends", () => {
    expect(stepSpeed(SPEEDS, 1, 1)).toBe(1.25);
    expect(stepSpeed(SPEEDS, 1.5, -1)).toBe(1.25);
    expect(stepSpeed(SPEEDS, 1, -1)).toBe(1);
    expect(stepSpeed(SPEEDS, 2, 1)).toBe(2);
  });
});

function target(matches: string[], editable = false): KeyTarget {
  return {
    isContentEditable: editable,
    closest: (selector) =>
      matches.some((tag) => selector.includes(tag)) ? {} : null,
  };
}

describe("pageOwnsKey", () => {
  it("leaves every key to a text field", () => {
    expect(pageOwnsKey(target(["textarea"]), "k")).toBe(true);
    expect(pageOwnsKey(target(["textarea"]), " ")).toBe(true);
    expect(pageOwnsKey(target([], true), "l")).toBe(true);
  });

  it("leaves only space to a button or link", () => {
    expect(pageOwnsKey(target(["button"]), " ")).toBe(true);
    expect(pageOwnsKey(target(["button"]), "k")).toBe(false);
    expect(pageOwnsKey(target(["a[href]"]), "l")).toBe(false);
  });

  it("does not claim keys from the page body", () => {
    expect(pageOwnsKey(target([]), " ")).toBe(false);
    expect(pageOwnsKey(null, " ")).toBe(false);
  });
});

describe("chapters", () => {
  const chapters = [
    { start: 0, title: "Introduction" },
    { start: 120, title: "– Functions" },
    { start: 600, title: "Arrays" },
    { start: 900, title: "Memory" },
  ];

  it("lists chapters that overlap a range, including one already running", () => {
    expect(chaptersInRange(chapters, 600, 900, 1200)).toEqual([chapters[2]]);
    expect(chaptersInRange(chapters, 300, 900, 1200)).toEqual([
      chapters[1],
      chapters[2],
    ]);
    expect(chaptersInRange(chapters, 900, 1200, 1200)).toEqual([chapters[3]]);
  });

  it("finds the chapter playing at a time", () => {
    expect(chapterIndexAt(chapters, 0)).toBe(0);
    expect(chapterIndexAt(chapters, 599.9)).toBe(2);
    expect(chapterIndexAt(chapters, 700)).toBe(2);
    expect(chapterIndexAt([{ start: 30, title: "x" }], 5)).toBe(-1);
  });

  it("formats badges by the length of the whole video", () => {
    expect(chapterTime(123, 7220)).toBe("0:02:03");
    expect(chapterTime(3725, 7220)).toBe("1:02:05");
    expect(chapterTime(123, 848)).toBe("2:03");
  });

  it("drops the leading dash CS50 puts on some titles", () => {
    expect(chapterTitle("– Functions")).toBe("Functions");
    expect(chapterTitle("- Overview")).toBe("Overview");
    expect(chapterTitle("Hello-World")).toBe("Hello-World");
    expect(chapterTitle("Introduction")).toBe("Introduction");
  });
});
