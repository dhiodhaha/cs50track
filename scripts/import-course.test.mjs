import test from "node:test";
import assert from "node:assert/strict";
import {
  sanitizeDocument,
  srtToVtt,
  validateRequiredMaterials,
} from "./import-course.mjs";

test("course import removes executable markup while preserving readable code and headings", () => {
  const result = sanitizeDocument(
    '<h1>Lecture</h1><h2>Arrays &amp; indexes</h2><p onclick="alert(1)">A value</p><pre><code>if (x &lt; 3) return;</code></pre><script>alert(2)</script><form><input name="password"></form><a href="javascript:alert(3)">bad link</a><img src="diagram.png" onerror="alert(4)">',
    "https://cs50.harvard.edu/x/2026/notes/2/",
  );
  assert.doesNotMatch(
    result.html,
    /<script|<form|<input|onclick|onerror|javascript:/,
  );
  assert.match(
    result.html,
    /<pre><code>if \(x &lt; 3\) return;<\/code><\/pre>/,
  );
  assert.deepEqual(result.headings[1], {
    id: "arrays-indexes",
    title: "Arrays & indexes",
    level: 2,
  });
  assert.match(
    result.html,
    /src="https:\/\/cs50.harvard.edu\/x\/2026\/notes\/2\/diagram.png"/,
  );
});

test("imported pages navigate locally and keep fragments, diagrams, and file downloads", () => {
  const lookup = new Map([
    [
      "https://cs50.harvard.edu/x/2026/notes/1/",
      {
        id: "notes-1",
        delivery: "document",
        localUrl: "/course/2026/documents/notes-1.json",
      },
    ],
    [
      "https://cs50.harvard.edu/x/2026/notes/2/diagram.png",
      {
        id: "image",
        delivery: "file",
        localUrl: "/course/2026/files/diagram.png",
      },
    ],
    [
      "https://cdn.cs50.net/slide.pdf",
      {
        id: "slides",
        delivery: "file",
        localUrl: "/course/2026/files/slides.pdf",
      },
    ],
  ]);
  const result = sanitizeDocument(
    '<a href="../1/#hello-world">Review C</a><a href="#arrays">This section</a><a href="https://cdn.cs50.net/slide.pdf">Slides</a><img src="diagram.png"><a href="https://cs50.dev/">Workspace</a>',
    "https://cs50.harvard.edu/x/2026/notes/2/",
    lookup,
  );
  assert.match(
    result.html,
    /href="#learn\/material\/notes-1\?section=hello-world"/,
  );
  assert.match(result.html, /href="#arrays"/);
  assert.match(result.html, /href="\/course\/2026\/files\/slides.pdf"/);
  assert.match(result.html, /src="\/course\/2026\/files\/diagram.png"/);
  assert.match(
    result.html,
    /href="https:\/\/cs50.dev\/" target="_blank" rel="noreferrer noopener"/,
  );
});

test("video links open the material player and duplicate heading IDs remain navigable", () => {
  const lookup = new Map([
    [
      "https://video.cs50.io/SlqjA04_dpk",
      { id: "c-video", delivery: "stream", localUrl: null },
    ],
  ]);
  const result = sanitizeDocument(
    '<h2 id="repeat">First</h2><h2 id="repeat">Second</h2><iframe src="https://video.cs50.io/SlqjA04_dpk"></iframe>',
    "https://cs50.harvard.edu/x/2026/weeks/1/",
    lookup,
  );
  assert.match(result.html, /href="#learn\/material\/c-video"/);
  assert.doesNotMatch(result.html, /<iframe/);
  assert.deepEqual(
    result.headings.map((h) => h.id),
    ["repeat", "repeat-section"],
  );
});

test("caption conversion preserves timings and text in the browser's WebVTT format", () => {
  const vtt = srtToVtt("1\n00:00:01,200 --> 00:00:03,400\nWelcome to CS50.\n");
  assert.ok(vtt.startsWith("WEBVTT\n\n"));
  assert.match(vtt, /00:00:01\.200 --> 00:00:03\.400/);
  assert.match(vtt, /Welcome to CS50\./);
});

test("source viewer and download query variants open the imported source document", () => {
  const lookup = new Map([
    [
      "https://cdn.cs50.net/2025/fall/lectures/4/src4/addresses0.c",
      {
        id: "addresses",
        delivery: "document",
        localUrl: "/course/2026/documents/addresses.json",
      },
    ],
  ]);
  const result = sanitizeDocument(
    '<a href="https://cdn.cs50.net/2025/fall/lectures/4/src4/addresses0.c?download">Download</a><a href="https://cdn.cs50.net/2025/fall/lectures/4/src4/addresses0.c?highlight=3&view">View</a>',
    "https://cs50.harvard.edu/x/2026/notes/4/",
    lookup,
  );
  assert.equal(
    (result.html.match(/href="#learn\/material\/addresses"/g) ?? []).length,
    2,
  );
});

test("an incomplete import fails before publishing a course catalog", () => {
  assert.throws(
    () => validateRequiredMaterials([]),
    /Required course documents are missing; the catalog was not published/,
  );
});
