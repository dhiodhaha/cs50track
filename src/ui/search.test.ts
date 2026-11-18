import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { materialManifestSchema } from "../lib/materials";
import { RESULT_LIMIT, searchMaterials } from "./search";

const { materials } = materialManifestSchema.parse(
  JSON.parse(readFileSync("public/course/2026/manifest.json", "utf8")),
);

describe("searchMaterials", () => {
  it("returns nothing for an empty query", () => {
    expect(searchMaterials(materials, "  ")).toEqual([]);
  });

  it("matches every word of the query against titles", () => {
    const found = searchMaterials(materials, "mario");
    expect(found.length).toBeGreaterThan(0);
    for (const item of found)
      expect(item.title.toLowerCase()).toContain("mario");
  });

  it("never exceeds the result limit and hides video quality variants", () => {
    const found = searchMaterials(materials, "week");
    expect(found.length).toBeLessThanOrEqual(RESULT_LIMIT);
    expect(found.some((item) => item.kind === "video")).toBe(false);
  });

  it("puts titles that start with the query first", () => {
    const found = searchMaterials(materials, "cash");
    expect(found[0]?.title.toLowerCase().startsWith("cash")).toBe(true);
  });
});
