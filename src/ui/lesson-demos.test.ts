import { describe, expect, it } from "vitest";
import { binarySearchSteps } from "./lesson-demos";

describe("binarySearchSteps", () => {
  const values = [1, 3, 5, 7, 9, 11, 13];

  it("halves the range until it finds the target", () => {
    expect(binarySearchSteps(values, 11).map((step) => step.middle)).toEqual([
      3, 5,
    ]);
    expect(binarySearchSteps(values, 11).at(-1)?.found).toBe(true);
  });

  it("ends without a match when the target is absent", () => {
    const steps = binarySearchSteps(values, 4);
    expect(steps.every((step) => !step.found)).toBe(true);
    expect(steps.length).toBeLessThanOrEqual(3);
  });
});
