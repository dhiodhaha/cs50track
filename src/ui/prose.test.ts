import { describe, expect, it } from "vitest";
import { diagramLabel } from "./prose";

describe("diagramLabel", () => {
  it("names the kind of diagram and lists its boxes", () => {
    expect(
      diagramLabel('flowchart LR\n in["input"] --> BOX', [
        "input",
        " ??? ",
        "output",
      ]),
    ).toBe("Flowchart: input, ???, output");
    expect(diagramLabel("graph TD\n A-->B", [])).toBe("Flowchart");
    expect(diagramLabel("pie\n a: 1", [])).toBe("Diagram");
  });
});
