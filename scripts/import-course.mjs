import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import {
  allAssignments,
  allResources,
  courseUnits,
} from "../src/lib/course.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "public/course/2026");
const CACHE = resolve(ROOT, ".course-cache");
const BASE = "https://cs50.harvard.edu/x/2026/";
const MAX_FILE = 24 * 1024 * 1024;
const MAX_RECORDS = 1800;
const MAX_DEPTH = 5;
const HEADERS = {
  "User-Agent":
    "CS50Track-course-import/1.0 (personal noncommercial study companion)",
  Accept: "*/*",
};
const hash = (value) => createHash("sha256").update(value).digest("hex");
const cleanText = (text) => text.replace(/\s+/g, " ").trim();
const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const normalize = (url) => {
  const parsed = new URL(url);
  parsed.hash = "";
  if (
    parsed.hostname === "cdn.cs50.net" &&
    /\/src\d*\//.test(parsed.pathname)
  ) {
    for (const parameter of ["download", "highlight", "view"])
      parsed.searchParams.delete(parameter);
  }
  if (
    parsed.hostname === "cs50.harvard.edu" &&
    parsed.pathname.startsWith("/x/2026/")
  ) {
    parsed.pathname = parsed.pathname.replace(
      /\/(?:sections|notes|shorts)\/psets\//,
      "/psets/",
    );
    if (!extname(parsed.pathname) && !parsed.pathname.endsWith("/"))
      parsed.pathname += "/";
  }
  return parsed.href;
};
const basenameSafe = (url) =>
  decodeURIComponent(basename(new URL(url).pathname))
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100) || "index";
const kindForPath = (path) =>
  /\/notes\//.test(path)
    ? "notes"
    : /\/psets\/|\/project\//.test(path)
      ? "assignment"
      : /\/sections\//.test(path)
        ? "section"
        : /\/shorts\//.test(path)
          ? "short"
          : /\/weeks\//.test(path)
            ? "overview"
            : "guide";

export function srtToVtt(text) {
  return `WEBVTT\n\n${text.replace(/^\uFEFF/, "").replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2")}`;
}

export function validateRequiredMaterials(materials) {
  const imported = new Set(
    materials
      .filter((r) => r.delivery === "document")
      .map((r) => normalize(r.sourceUrl)),
  );
  const required = [
    ...courseUnits.flatMap((unit) =>
      unit.id === "project"
        ? [unit.url]
        : [unit.url, `${BASE}notes/${unit.index}/`],
    ),
    ...allAssignments.map((assignment) => assignment.url),
    ...allResources
      .filter((resource) => resource.kind !== "lecture")
      .map((resource) => resource.url),
  ];
  const missing = required.filter((url) => !imported.has(normalize(url)));
  if (missing.length)
    throw new Error(
      `Required course documents are missing; the catalog was not published:\n${missing.join("\n")}`,
    );
}

export function sanitizeDocument(html, sourceUrl, lookup = new Map()) {
  const $ = load(html, { xmlMode: false });
  $(
    "script,style,form,input,button,textarea,select,nav,footer,object,embed,link,meta",
  ).remove();
  $("iframe").each((_, element) => {
    const src = $(element).attr("src");
    if (src)
      $(element).replaceWith(
        `<p><a href="${escapeHtml(new URL(src, sourceUrl).href)}">Watch the accompanying video</a></p>`,
      );
    else $(element).remove();
  });
  $("a[href]").each((_, element) => {
    const raw = $(element).attr("href");
    if (!raw || raw.startsWith("#")) return;
    let target;
    try {
      target = new URL(raw, sourceUrl);
    } catch {
      $(element).removeAttr("href");
      return;
    }
    if (!["https:", "http:", "mailto:"].includes(target.protocol)) {
      $(element).removeAttr("href");
      return;
    }
    const local = lookup.get(normalize(target.href));
    if (local?.localUrl) {
      if (local.delivery === "document")
        $(element).attr(
          "href",
          `#learn/material/${encodeURIComponent(local.id)}${target.hash ? `?section=${encodeURIComponent(target.hash.slice(1))}` : ""}`,
        );
      else $(element).attr("href", local.localUrl);
      $(element).removeAttr("target").removeAttr("rel");
    } else if (local?.delivery === "stream") {
      $(element).attr(
        "href",
        `#learn/material/${encodeURIComponent(local.id)}`,
      );
    } else {
      $(element)
        .attr("href", target.href)
        .attr("target", "_blank")
        .attr("rel", "noreferrer noopener");
    }
  });
  $("img[src]").each((_, element) => {
    const url = new URL($(element).attr("src"), sourceUrl);
    const local = lookup.get(normalize(url.href));
    $(element)
      .attr("src", local?.localUrl ?? url.href)
      .attr("loading", "lazy")
      .attr("decoding", "async")
      .removeAttr("srcset");
    if (!$(element).attr("alt"))
      $(element).attr(
        "alt",
        "Illustration from the official CS50 course material",
      );
  });
  const headings = [];
  const ids = new Set();
  $("h1,h2,h3,h4,h5,h6").each((_, element) => {
    const title = cleanText($(element).text());
    let id =
      $(element).attr("id") ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      "section";
    while (ids.has(id)) id += "-section";
    ids.add(id);
    $(element).attr("id", id);
    headings.push({ id, title, level: Number(element.tagName.slice(1)) });
  });
  const cleaned = sanitizeHtml($("body").html() ?? html, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "a",
      "ul",
      "ol",
      "li",
      "pre",
      "code",
      "span",
      "div",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "del",
      "br",
      "hr",
      "img",
      "figure",
      "figcaption",
      "blockquote",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption",
      "details",
      "summary",
      "dl",
      "dt",
      "dd",
      "sup",
      "sub",
      "kbd",
      "samp",
      "mark",
      "small",
      "video",
      "source",
      "track",
    ],
    allowedAttributes: {
      "*": ["id"],
      a: ["href", "target", "rel"],
      img: ["src", "alt", "loading", "decoding", "width", "height"],
      code: ["class"],
      span: ["class"],
      pre: ["class"],
      th: ["colspan", "rowspan", "scope"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
      details: ["open"],
      video: ["controls", "preload", "src", "poster"],
      source: ["src", "type"],
      track: ["src", "kind", "srclang", "label", "default"],
    },
    allowedClasses: {
      span: [/^[a-z]{1,3}$/],
      code: [/^language-[a-zA-Z0-9_-]+$/],
      pre: ["highlight"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
  });
  return { html: cleaned, headings };
}

export async function importCourse({ refresh = false } = {}) {
  await mkdir(OUTPUT, { recursive: true });
  await mkdir(CACHE, { recursive: true });
  const importedAt = new Date().toISOString();
  const records = new Map();
  const queue = [];
  const warnings = [];
  let completed = 0;
  let bytesWritten = 0;

  function add(url, unitId, kind, title, options = {}) {
    const key = normalize(url);
    const known = records.get(key);
    if (known) {
      if (unitId) known.units.add(unitId);
      return known;
    }
    if (records.size >= MAX_RECORDS)
      throw new Error(
        `Import exceeded its ${MAX_RECORDS}-item scope. Review discovered URLs.`,
      );
    const record = {
      id: `cs50-${hash(key).slice(0, 16)}`,
      sourceUrl: key,
      units: new Set(unitId ? [unitId] : []),
      kind,
      title,
      format: options.format ?? "html",
      delivery: options.delivery ?? "document",
      localUrl: null,
      bytes: 0,
      sha256: null,
      fetchedAt: importedAt,
      ...options,
    };
    records.set(key, record);
    if (["stream", "external"].includes(record.delivery)) return record;
    queue.push(record);
    return record;
  }
  async function get(url) {
    const key = hash(url);
    const metaPath = resolve(CACHE, `${key}.json`);
    const dataPath = resolve(CACHE, `${key}.bin`);
    if (!refresh) {
      try {
        const meta = JSON.parse(await readFile(metaPath, "utf8"));
        const data = await readFile(dataPath);
        return { ...meta, data };
      } catch {
        /* A missing cache entry is fetched below. */
      }
    }
    let response;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(url, {
        headers: HEADERS,
        signal: AbortSignal.timeout(45000),
      });
      if (response.ok || (response.status !== 429 && response.status < 500))
        break;
      if (attempt < 2)
        await new Promise((done) => setTimeout(done, 1000 * (attempt + 1)));
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (Number(response.headers.get("content-length")) > MAX_FILE) {
      await response.body?.cancel();
      throw Object.assign(new Error("exceeds 24 MiB local-file limit"), {
        bytes: Number(response.headers.get("content-length")),
      });
    }
    const parts = [];
    let size = 0;
    for await (const chunk of response.body) {
      size += chunk.length;
      if (size > MAX_FILE)
        throw Object.assign(new Error("exceeds 24 MiB local-file limit"), {
          bytes: size,
        });
      parts.push(chunk);
    }
    const data = Buffer.concat(parts);
    const meta = {
      type: response.headers.get("content-type") ?? "",
      url: response.url,
      fetchedAt: new Date().toISOString(),
    };
    await writeFile(dataPath, data);
    await writeFile(metaPath, JSON.stringify(meta));
    return { ...meta, data };
  }
  function discoverAssets($, record, selector = "a[href]") {
    $(selector).each((_, element) => {
      const raw = $(element).attr("href");
      if (!raw || raw.startsWith("#")) return;
      let url;
      try {
        url = new URL(raw, record.sourceUrl);
      } catch {
        return;
      }
      if (url.protocol !== "https:") return;
      const source = url.href;
      const label = cleanText($(element).text()) || basenameSafe(source);
      const owner = record.units.values().next().value;
      const trail = $(element)
        .parents("li")
        .toArray()
        .reverse()
        .map((li) =>
          cleanText($(li).clone().children("ul,ol").remove().end().text()),
        )
        .filter(Boolean);
      const context = trail.join(" · ");
      const resourceTitle = `${record.title} · ${context || label}`;
      const isCdn = url.hostname === "cdn.cs50.net";
      if (/\.mp4(?:\.download)?$|\.mp3$/.test(url.pathname) && isCdn) {
        add(
          source,
          owner,
          /\.mp3$/.test(url.pathname) ? "audio" : "video",
          resourceTitle,
          {
            delivery: "stream",
            format: /\.mp3$/.test(url.pathname) ? "mp3" : "mp4",
          },
        );
      } else if (
        url.hostname === "video.cs50.io" &&
        /^\/[\w-]{11}\/?$/.test(url.pathname)
      ) {
        add(
          source,
          owner,
          "video",
          `${record.title} · ${label === "CS50 Video Player" ? "Watch video" : label}`,
          { delivery: "stream", format: "youtube" },
        );
      } else if (/\.(srt|vtt)$/.test(url.pathname) && isCdn) {
        add(source, owner, "subtitles", resourceTitle, {
          delivery: "file",
          format: extname(url.pathname).slice(1),
        });
      } else if (
        /\.txt$/.test(url.pathname) &&
        isCdn &&
        /\/lang\//.test(url.pathname)
      ) {
        add(source, owner, "transcript", resourceTitle, {
          format: "txt",
          textDocument: true,
        });
      } else if (/\.(pdf|zip)$/.test(url.pathname) && isCdn) {
        const kind =
          /\/src[^/]*\.(pdf|zip)$/.test(url.pathname) ||
          trail.some((part) => part === "Source Code")
            ? "source"
            : "slides";
        add(
          source,
          owner,
          kind,
          `${record.title} · ${kind === "source" ? "Source code" : "Slides"} · ${extname(url.pathname).slice(1).toUpperCase()}`,
          { delivery: "file", format: extname(url.pathname).slice(1) },
        );
      } else if (
        isCdn &&
        /\/src\d*\//.test(url.pathname) &&
        url.pathname.endsWith("/")
      ) {
        add(source, owner, "source", `${record.title} · Source files`, {
          sourcePrefix: source,
          depth: 0,
        });
      } else if (
        url.hostname === "cs50.harvard.edu" &&
        /^\/x\/(?:2026\/)?(?:notes|psets|project|sections|shorts)\//.test(
          url.pathname,
        )
      ) {
        const pinned = new URL(source);
        pinned.pathname = pinned.pathname.replace(
          /^\/x\/(?!2026\/)/,
          "/x/2026/",
        );
        const kind = kindForPath(pinned.pathname);
        const number = pinned.pathname.match(
          /\/(?:notes|psets|sections)\/(\d+)(?:\/|$)/,
        )?.[1];
        const documentUnit = /\/project\//.test(pinned.pathname)
          ? "project"
          : number
            ? `week-${number}`
            : owner;
        add(pinned.href, documentUnit, kind, `${record.title} · ${label}`);
      } else if (
        url.hostname === "docs.google.com" &&
        /\/presentation\//.test(url.pathname)
      ) {
        add(source, owner, "slides", `${record.title} · Google Slides`, {
          delivery: "external",
          format: "google-slides",
        });
      }
    });
  }
  for (const unit of courseUnits) {
    add(
      unit.url,
      unit.id,
      unit.id === "project" ? "assignment" : "overview",
      `${unit.title} · ${unit.topic}`,
    );
    if (unit.id !== "project") {
      add(
        `${BASE}notes/${unit.index}/`,
        unit.id,
        "notes",
        `${unit.topic} · Lecture notes`,
      );
      if (unit.index < 10)
        add(
          `${BASE}psets/${unit.index}/`,
          unit.id,
          "assignment",
          `Problem Set ${unit.index} · Overview`,
        );
    }
  }
  for (const resource of allResources)
    if (resource.kind !== "lecture")
      add(resource.url, resource.unitId, resource.kind, resource.title);
  for (const assignment of allAssignments)
    add(assignment.url, assignment.unitId, "assignment", assignment.title);
  for (const [path, title] of [
    ["", "How to take CS50"],
    ["syllabus/", "Course syllabus"],
    ["honesty/", "Academic honesty"],
    ["faqs/", "Course FAQs"],
    ["license/", "Course material license"],
  ])
    for (const unit of courseUnits)
      add(`${BASE}${path}`, unit.id, "guide", title);

  async function processRecord(record) {
    try {
      const response = await get(record.sourceUrl);
      record.fetchedAt = response.fetchedAt;
      const data = response.data;
      if (record.delivery === "file") {
        const name = `${hash(record.sourceUrl).slice(0, 16)}-${basenameSafe(record.sourceUrl)}`;
        const path = `files/${name}`;
        await mkdir(resolve(OUTPUT, "files"), { recursive: true });
        await writeFile(resolve(OUTPUT, path), data);
        record.localUrl = `/course/2026/${path}`;
        record.bytes = data.length;
        record.sha256 = hash(data);
        bytesWritten += data.length;
        if (record.format === "srt") {
          const vttPath = `files/${name.replace(/\.srt$/, ".vtt")}`;
          await writeFile(
            resolve(OUTPUT, vttPath),
            srtToVtt(data.toString("utf8")),
          );
        }
        return;
      }
      const text = data.toString("utf8");
      if (record.textDocument || record.codeDocument) {
        record.rawHtml = `<h1>${escapeHtml(record.title)}</h1><${record.codeDocument ? "pre><code" : "div"}>${
          record.codeDocument
            ? escapeHtml(text)
            : text
                .split(/\r?\n\s*\r?\n/)
                .map((p) => `<p>${escapeHtml(p).replace(/\r?\n/g, "<br>")}</p>`)
                .join("\n")
        }</${record.codeDocument ? "code></pre" : "div"}>`;
      } else {
        const $ = load(text);
        const main = $("main").first();
        if (!main.length && !record.sourcePrefix)
          throw new Error("No course main content found");
        const content = record.sourcePrefix ? $("body") : main;
        const view = load(content.html() ?? "");
        record.rawHtml = content.html() ?? "";
        view("iframe[src]").each((_, e) => {
          const src = new URL(view(e).attr("src"), record.sourceUrl);
          if (src.hostname === "video.cs50.io")
            add(
              src.href,
              record.units.values().next().value,
              "video",
              `${record.title} · Watch video`,
              { delivery: "stream", format: "youtube" },
            );
        });
        discoverAssets(view, record);
        view("img[src]").each((_, e) => {
          const image = new URL(view(e).attr("src"), record.sourceUrl);
          if (
            ["cs50.harvard.edu", "cdn.cs50.net"].includes(image.hostname) &&
            !image.pathname.endsWith(".svg")
          )
            add(
              image.href,
              record.units.values().next().value,
              "source",
              `${record.title} · Illustration`,
              {
                delivery: "file",
                format: extname(image.pathname).slice(1) || "image",
                hidden: true,
              },
            );
        });
        if (record.sourcePrefix && record.depth < MAX_DEPTH) {
          view("a[href]").each((_, e) => {
            const url = new URL(
              normalize(new URL(view(e).attr("href"), record.sourceUrl).href),
            );
            if (
              !url.href.startsWith(record.sourcePrefix) ||
              url.search ||
              url.hash ||
              url.href === record.sourceUrl
            )
              return;
            if (url.pathname.endsWith("/"))
              add(
                url.href,
                record.units.values().next().value,
                "source",
                `${record.title} / ${basenameSafe(url.href.replace(/\/$/, ""))}`,
                { sourcePrefix: record.sourcePrefix, depth: record.depth + 1 },
              );
            else if (/\.(sb3|db)$/.test(url.pathname))
              add(
                url.href,
                record.units.values().next().value,
                "source",
                `${basenameSafe(url.href)} · ${record.title}`,
                {
                  delivery: "file",
                  format: extname(url.pathname).slice(1),
                },
              );
            else if (
              /\.(c|h|py|sql|html|css|js|json|txt|csv|md|sh)$/.test(
                url.pathname,
              )
            )
              add(
                url.href,
                record.units.values().next().value,
                "source",
                `${basenameSafe(url.href)} · ${record.title}`,
                { codeDocument: true, format: extname(url.pathname).slice(1) },
              );
          });
        }
        const actualTitle = cleanText(view("h1").first().text());
        if (
          actualTitle &&
          ["notes", "assignment", "guide"].includes(record.kind)
        )
          record.title = `${actualTitle}${record.kind === "notes" ? " · Notes" : ""}`;
      }
      if (!record.rawHtml.trim()) throw new Error("Empty course content");
      record.localUrl = `/course/2026/documents/${record.id}.json`;
    } catch (failure) {
      record.delivery = "external";
      record.localUrl = null;
      record.bytes = failure.bytes ?? 0;
      warnings.push(`${record.sourceUrl}: ${failure.message}`);
      console.warn(
        `Skipped local copy: ${record.sourceUrl} (${failure.message})`,
      );
    } finally {
      completed++;
      if (completed % 25 === 0)
        console.log(
          `Imported ${completed} items; ${queue.length} queued; ${(bytesWritten / 1048576).toFixed(1)} MiB files.`,
        );
    }
  }

  // Process a bounded batch at a time; discovery can append more work to the queue.
  while (queue.length) await Promise.all(queue.splice(0, 4).map(processRecord));
  validateRequiredMaterials([...records.values()]);
  await mkdir(resolve(OUTPUT, "documents"), { recursive: true });
  for (const record of records.values()) {
    if (record.delivery !== "document" || !record.rawHtml) continue;
    const { html, headings } = sanitizeDocument(
      record.rawHtml,
      record.sourceUrl,
      records,
    );
    const document = {
      id: record.id,
      title: record.title,
      sourceUrl: record.sourceUrl,
      fetchedAt: record.fetchedAt,
      html,
      headings,
    };
    const data = JSON.stringify(document);
    await writeFile(resolve(OUTPUT, `documents/${record.id}.json`), data);
    record.bytes = Buffer.byteLength(data);
    record.sha256 = hash(data);
    bytesWritten += record.bytes;
  }
  const materials = Array.from(records.values())
    .filter((r) => !r.hidden)
    .map((r) => ({
      id: r.id,
      unitIds: [...r.units],
      title: r.title,
      kind: r.kind,
      format: r.format,
      delivery: r.delivery,
      sourceUrl: r.sourceUrl,
      localUrl: r.localUrl,
      bytes: r.bytes,
      sha256: r.sha256,
      fetchedAt: r.fetchedAt,
    }));
  const manifest = {
    version: 1,
    edition: 2026,
    fetchedAt: importedAt,
    attribution:
      "David J. Malan and the CS50 team, Harvard University. Imported and reformatted for CS50Track; navigation, presentation, and links changed. No endorsement implied.",
    license: "CC BY-NC-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
    materials,
    warnings,
  };
  await writeFile(
    resolve(OUTPUT, "manifest.next.json"),
    JSON.stringify(manifest),
  );
  for (let attempt = 0; ; attempt++) {
    try {
      await rename(
        resolve(OUTPUT, "manifest.next.json"),
        resolve(OUTPUT, "manifest.json"),
      );
      break;
    } catch (error) {
      if (!["EPERM", "EBUSY"].includes(error.code) || attempt >= 5) throw error;
      await new Promise((done) => setTimeout(done, 250 * (attempt + 1)));
    }
  }
  await writeFile(
    resolve(OUTPUT, "ATTRIBUTION.md"),
    `# CS50x 2026 imported materials\n\n${manifest.attribution}\n\nSource: ${BASE}\n\nLicense: ${manifest.license} (${manifest.licenseUrl}). Imported content and adaptations are distributed under that license.\n\nImported: ${importedAt}\n\nContent is imported from public course pages and their explicitly linked files. Lecture media streams from CS50/YouTube; video and audio binaries are not copied. Google Slides remains an external editing/viewing service; slide PDFs are copied when available.\n`,
  );
  const summary = {
    documents: materials.filter((r) => r.delivery === "document").length,
    files: materials.filter((r) => r.delivery === "file").length,
    streams: materials.filter((r) => r.delivery === "stream").length,
    external: materials.filter((r) => r.delivery === "external").length,
    totalMiB: Number((bytesWritten / 1048576).toFixed(1)),
    warnings,
  };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await importCourse({ refresh: process.argv.includes("--refresh") });
