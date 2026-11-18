import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { load } from "cheerio";
import { describe, expect, it } from "vitest";
import { allAssignments, allResources, courseUnits } from "./course";
import { courseDocumentSchema, materialManifestSchema } from "./materials";

const publicRoot = resolve("public");
const manifest = materialManifestSchema.parse(
  JSON.parse(
    await readFile(resolve(publicRoot, "course/2026/manifest.json"), "utf8"),
  ),
);

describe("the shipped CS50x corpus", () => {
  it("contains every lecture's notes, assignment, section, and short as a native document", () => {
    const documents = new Set(
      manifest.materials
        .filter((m) => m.delivery === "document")
        .map((m) => m.sourceUrl),
    );
    for (const unit of courseUnits) {
      expect(documents.has(unit.url), unit.url).toBe(true);
      if (unit.id !== "project")
        expect(
          documents.has(`https://cs50.harvard.edu/x/2026/notes/${unit.index}/`),
        ).toBe(true);
    }
    for (const item of [
      ...allAssignments,
      ...allResources.filter((r) => r.kind !== "lecture"),
    ])
      expect(documents.has(item.url), item.url).toBe(true);
    expect(new Set(manifest.materials.map((m) => m.id)).size).toBe(
      manifest.materials.length,
    );
    expect(manifest.attribution).toContain("Harvard University");
    expect(manifest.license).toBe("CC BY-NC-SA 4.0");
  });

  it("ships intact local files and safe documents with working local links and illustrations", async () => {
    const ids = new Set(manifest.materials.map((m) => m.id));
    for (const material of manifest.materials.filter((m) => m.localUrl)) {
      const path = resolve(publicRoot, `.${material.localUrl}`);
      expect(path.startsWith(publicRoot), material.localUrl!).toBe(true);
      const data = await readFile(path);
      expect(data.byteLength, material.sourceUrl).toBe(material.bytes);
      expect(data.byteLength).toBeLessThanOrEqual(24 * 1024 * 1024);
      expect(createHash("sha256").update(data).digest("hex")).toBe(
        material.sha256,
      );
      if (material.delivery !== "document") continue;
      const document = courseDocumentSchema.parse(
        JSON.parse(data.toString("utf8")),
      );
      expect(document.id).toBe(material.id);
      const $ = load(document.html);
      expect(
        $("script,iframe,form,input,object,embed,style").length,
        material.sourceUrl,
      ).toBe(0);
      const elements = $("*").toArray();
      for (const element of elements) {
        if (!("attribs" in element)) continue;
        for (const [name, value] of Object.entries(element.attribs ?? {})) {
          expect(name).not.toMatch(/^on/i);
          if (name === "href" || name === "src")
            expect(value).not.toMatch(/^javascript:/i);
        }
      }
      for (const anchor of $("a[href^='#learn/material/']").toArray()) {
        const id = $(anchor).attr("href")!.split("/").at(-1)!.split("?")[0];
        expect(ids.has(decodeURIComponent(id)), `${material.id}: ${id}`).toBe(
          true,
        );
      }
      for (const element of $(
        "img[src^='/course/'],a[href^='/course/']",
      ).toArray()) {
        const local = $(element).attr("src") ?? $(element).attr("href")!;
        expect(
          (await stat(resolve(publicRoot, `.${local}`))).isFile(),
          local,
        ).toBe(true);
      }
    }
  });

  it("keeps only explicitly identified remote presentations and oversize archives external", () => {
    const external = manifest.materials.filter(
      (m) => m.delivery === "external",
    );
    for (const item of external) {
      expect(
        item.format === "google-slides" ||
          (["zip", "db"].includes(item.format) &&
            item.bytes > 24 * 1024 * 1024),
        item.sourceUrl,
      ).toBe(true);
    }
    for (const unit of courseUnits.filter((u) => u.id !== "project"))
      expect(
        manifest.materials.some(
          (m) =>
            m.unitIds.includes(unit.id) &&
            m.sourceUrl.startsWith("https://video.cs50.io/") &&
            m.delivery === "stream",
        ),
        unit.id,
      ).toBe(true);
  });
});
