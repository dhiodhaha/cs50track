import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { courseDocumentSchema } from "../lib/materials";
import { flowSchema } from "../lib/flow";
import { cleanIntro, splitAtH2 } from "./notes";

describe("splitAtH2", () => {
  it("keeps the intro and every section verbatim", () => {
    const html =
      '<h1 id="a">A</h1><p>intro</p><h2 id="one">One</h2><p>x</p><pre><code>&lt;h2&gt;</code></pre><h2 id="two">Two <em>2</em></h2><p>y</p>';
    const { intro, sections } = splitAtH2(html);
    expect(intro).toBe('<h1 id="a">A</h1><p>intro</p>');
    expect(sections.map((s) => [s.id, s.title])).toEqual([
      ["one", "One"],
      ["two", "Two 2"],
    ]);
    expect(intro + sections.map((s) => s.html).join("")).toBe(html);
  });

  it("separates a section's heading from its body", () => {
    const { sections } = splitAtH2(
      '<h2 id="joins"><code>JOIN</code>s</h2><p>x</p><h2 id="b">B</h2>',
    );
    expect(sections[0]).toMatchObject({
      id: "joins",
      title: "JOINs",
      heading: "<code>JOIN</code>s",
      body: "<p>x</p>",
    });
    expect(sections[1]!.body).toBe("");
  });

  it("returns the whole document as intro when there is no h2", () => {
    expect(splitAtH2("<p>x</p>")).toEqual({ intro: "<p>x</p>", sections: [] });
  });

  it("removes the title and contents list from an intro", () => {
    expect(
      cleanIntro(
        '<h1 id="a">A</h1>\n<ul id="markdown-toc"><li>x</li></ul><p>hi</p>',
      ),
    ).toBe("<p>hi</p>");
  });

  it("finds every lecture heading from flow.json in the imported notes", () => {
    const flow = flowSchema.parse(
      JSON.parse(readFileSync("public/course/2026/flow.json", "utf8")),
    );
    for (const [unitId, unit] of Object.entries(flow.units)) {
      const document = courseDocumentSchema.parse(
        JSON.parse(
          readFileSync(
            `public/course/2026/documents/${unit.lecture.notesDocumentId}.json`,
            "utf8",
          ),
        ),
      );
      const ids = new Set(splitAtH2(document.html).sections.map((s) => s.id));
      for (const part of unit.lecture.parts)
        for (const heading of part.headings)
          expect(ids.has(heading.id), `${unitId} ${heading.id}`).toBe(true);
    }
  });
});
