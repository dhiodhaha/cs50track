import { describe, expect, it } from "vitest";
import { resumeAt } from "./player";

describe("resumeAt", () => {
  it("starts at the part's start when nothing is saved", () => {
    expect(resumeAt(Number.NaN, 1530, 3000, 8982)).toBe(1530);
    expect(resumeAt(0, 1530, 3000, 8982)).toBe(1530);
  });

  it("resumes a saved position inside the part", () => {
    expect(resumeAt(2000, 1530, 3000, 8982)).toBe(2000);
  });

  it("ignores a saved position outside the part", () => {
    expect(resumeAt(100, 1530, 3000, 8982)).toBe(1530);
    expect(resumeAt(2999.5, 1530, 3000, 8982)).toBe(1530);
    expect(resumeAt(5000, 1530, 3000, 8982)).toBe(1530);
  });

  it("allows any position past the start when the clip has no end", () => {
    expect(resumeAt(400, 0, undefined, 848)).toBe(400);
    expect(resumeAt(900, 0, undefined, 848)).toBe(0);
  });
});
