import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const courseDir = path.join(root, "public", "course", "2026");
const BIN_SECONDS = 30;
const TARGET_PART_MINUTES = 30;
const STOP = new Set(
  "about above after again also another around because been before being below between both cannot could does doing down during each from further have having here into itself just like more most much must only other over same should some such than that their them then there these they this those through under until very what when where which while will with would your yours notice indeed might well were really going thing things want know called think using used uses make makes".split(
    " ",
  ),
);

export function parseSrt(text) {
  const cues = [];
  for (const block of text.replace(/\r/g, "").split(/\n\n+/)) {
    const match = block.match(
      /(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)\n([\s\S]*)/,
    );
    if (!match) continue;
    const [, h1, m1, s1, , h2, m2, s2, , body] = match;
    cues.push({
      start: +h1 * 3600 + +m1 * 60 + +s1,
      end: +h2 * 3600 + +m2 * 60 + +s2,
      text: body.replace(/\n/g, " "),
    });
  }
  return cues;
}

export function tokens(text) {
  return (text.toLowerCase().match(/[a-z][a-z0-9_]{3,}/g) ?? []).filter(
    (word) => !STOP.has(word),
  );
}

function count(words) {
  const map = new Map();
  for (const word of words) map.set(word, (map.get(word) ?? 0) + 1);
  return map;
}

/** Assign each notes section a start time by a monotone best match against the subtitles. */
export function alignSections(sections, cues) {
  if (cues.length === 0) return sections.map(() => 0);
  const last = cues.at(-1).end;
  const binCount = Math.ceil(last / BIN_SECONDS) + 1;
  const bins = Array.from({ length: binCount }, () => []);
  for (const cue of cues)
    bins[Math.floor(cue.start / BIN_SECONDS)].push(...tokens(cue.text));
  const binCounts = bins.map(count);
  const documentFrequency = new Map();
  for (const bin of binCounts)
    for (const word of bin.keys())
      documentFrequency.set(word, (documentFrequency.get(word) ?? 0) + 1);
  const idf = (word) =>
    Math.log((binCount + 1) / ((documentFrequency.get(word) ?? 0) + 1));
  const WINDOW = 6;
  const scores = sections.map((section) => {
    const wanted = count(tokens(section.text));
    const norm = Math.sqrt(wanted.size) || 1;
    return binCounts.map((_, start) => {
      let score = 0;
      for (const [word, weight] of wanted) {
        let hits = 0;
        for (let b = start; b < Math.min(binCount, start + WINDOW); b++)
          hits += binCounts[b].get(word) ?? 0;
        if (hits > 0) score += idf(word) * Math.min(hits, weight + 1);
      }
      return score / norm;
    });
  });
  const firstBin = Math.floor(cues[0].start / BIN_SECONDS);
  const best = sections.map(() => new Float64Array(binCount).fill(-Infinity));
  const from = sections.map(() => new Int32Array(binCount).fill(-1));
  for (let b = firstBin; b < binCount; b++)
    best[0][b] = b === firstBin ? scores[0][b] + 1e6 : -Infinity;
  for (let i = 1; i < sections.length; i++) {
    let running = -Infinity;
    let runningAt = -1;
    for (let b = firstBin; b < binCount; b++) {
      if (b > firstBin && best[i - 1][b - 1] > running) {
        running = best[i - 1][b - 1];
        runningAt = b - 1;
      }
      if (running > -Infinity) {
        best[i][b] = running + scores[i][b];
        from[i][b] = runningAt;
      }
    }
  }
  let at = 0;
  const lastRow = best.at(-1);
  for (let b = 0; b < binCount; b++) if (lastRow[b] > lastRow[at]) at = b;
  const starts = new Array(sections.length);
  for (let i = sections.length - 1; i >= 0; i--) {
    starts[i] = at * BIN_SECONDS;
    at = from[i][at];
  }
  starts[0] = Math.floor(cues[0].start / BIN_SECONDS) * BIN_SECONDS;
  return starts;
}

export function splitNotes(document) {
  const $ = load(document.html);
  const sections = [];
  $("h2").each((_, heading) => {
    const node = $(heading);
    const text = [node.text()];
    let next = node.next();
    while (next.length && !next.is("h2")) {
      text.push(next.text());
      next = next.next();
    }
    sections.push({
      id: node.attr("id"),
      title: node.text().trim(),
      text: text.join(" "),
      words: text.join(" ").split(/\s+/).filter(Boolean).length,
    });
  });
  return sections;
}

/** Cut the lecture where a section starts closest to each even time target. */
export function cutParts(sections, starts, duration) {
  const wanted = Math.max(
    1,
    Math.min(
      sections.length,
      Math.round((duration - starts[0]) / 60 / TARGET_PART_MINUTES),
    ),
  );
  const cuts = new Set([0]);
  for (let k = 1; k < wanted; k++) {
    const target = starts[0] + ((duration - starts[0]) * k) / wanted;
    let pick = -1;
    for (let i = 1; i < sections.length; i++) {
      if (cuts.has(i)) continue;
      if (
        pick < 0 ||
        Math.abs(starts[i] - target) < Math.abs(starts[pick] - target)
      )
        pick = i;
    }
    if (pick > 0) cuts.add(pick);
  }
  const order = [...cuts].sort((a, b) => a - b);
  return order.map((first, index) => {
    const end = order[index + 1] ?? sections.length;
    return {
      start: index === 0 ? 0 : starts[first],
      end: order[index + 1] === undefined ? duration : starts[order[index + 1]],
      headings: sections.slice(first, end),
    };
  });
}

/** Name a part after its first two teaching sections, skipping the greeting and the wrap-up. */
export function partTitle(headings) {
  const teaching = headings.filter(
    (heading) => !/^(welcome|summing up)/i.test(heading.title),
  );
  return (teaching.length ? teaching : headings)
    .slice(0, 2)
    .map((heading) => heading.title)
    .join(", ");
}

const plain = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const words = (title) =>
  plain(title)
    .split(" ")
    .filter((word) => word.length > 2 && word !== "and" && word !== "the")
    .map((word) => word.replace(/s$/, ""));

/** One title's words all appear in the other, as with "Loops" and "Loops and meow.c". */
function sameTopic(a, b) {
  const left = words(a);
  const right = words(b);
  if (left.length === 0 || right.length === 0) return false;
  const [small, large] = left.length <= right.length ? [left, right] : [right, left];
  return small.every((word) => large.includes(word));
}

/**
 * Replace matched section times with CS50's own chapter times where a chapter has the same name.
 * Sections with no namesake keep their subtitle-matched time, held between their neighbours.
 */
export function snapToChapters(sections, starts, chapters) {
  const result = sections.map((section, index) => ({
    start: starts[index],
    exact: false,
  }));
  sections.forEach((section, index) => {
    const name = plain(section.title);
    const near = (chapter) => Math.abs(chapter.start - starts[index]);
    // The notes sometimes order topics differently from the lecture, so a name match wins over position.
    const match =
      chapters
        .filter((chapter) => plain(chapter.title) === name)
        .sort((x, y) => near(x) - near(y))[0] ??
      chapters
        .filter((chapter) => sameTopic(chapter.title, section.title))
        .sort((x, y) => near(x) - near(y))[0];
    if (match && Math.abs(match.start - starts[index]) <= 1500) {
      result[index] = { start: match.start, exact: true };
    }
  });
  return result;
}

const nearestChapter = (seconds, chapters, low, high) => {
  const inside = chapters.filter(
    (chapter) =>
      chapter.start > low &&
      chapter.start < high &&
      Math.abs(chapter.start - seconds) <= 180,
  );
  inside.sort(
    (a, b) => Math.abs(a.start - seconds) - Math.abs(b.start - seconds),
  );
  return inside[0]?.start ?? seconds;
};

const youtubeId = (url) => url.split("/").pop();
const local = (material) => path.join(root, "public", material.localUrl);

async function main() {
  const manifest = JSON.parse(
    await readFile(path.join(courseDir, "manifest.json"), "utf8"),
  );
  const materials = manifest.materials;
  const find = (test) => materials.find(test);
  const chaptersFile = path.join(courseDir, "chapters.json");
  const refresh = process.argv.includes("--refresh");
  const known = JSON.parse(await readFile(chaptersFile, "utf8").catch(() => "{}"));
  /** CS50's own chapter list for a video, read from its player page and kept in chapters.json. */
  const chaptersFor = async (id) => {
    if (!id) return [];
    if (!refresh && known[id]) return known[id];
    const page = await (await fetch(`https://video.cs50.io/${id}`)).text();
    const found = page.match(/chapters = (\[\[.*?\]\]);/s);
    known[id] = found
      ? JSON.parse(found[1]).map(([start, title]) => ({ start, title }))
      : [];
    return known[id];
  };
  const media = async (prefix) => {
    const stream = find(
      (m) => m.format === "youtube" && m.title === `${prefix} · Watch video`,
    );
    const mp4 =
      find(
        (m) =>
          m.format === "mp4" &&
          m.title.startsWith(`${prefix} · `) &&
          /720p/.test(m.title) &&
          !/HDR|Portuguese|Spanish/.test(m.title),
      ) ?? null;
    const subtitles = find(
      (m) =>
        m.kind === "subtitles" &&
        m.title.startsWith(`${prefix} · `) &&
        !/Portuguese|Spanish/.test(m.title),
    );
    let cues = subtitles
      ? parseSrt(await readFile(local(subtitles), "utf8"))
      : [];
    let captions = subtitles
      ? subtitles.localUrl.replace(/\.srt$/, ".vtt")
      : null;
    // Lecture 5's published subtitles run exactly one hour late against its video.
    const offset = cues.length ? Math.floor(cues[0].start / 3600) * 3600 : 0;
    if (offset > 0) {
      cues = cues.map((cue) => ({
        ...cue,
        start: cue.start - offset,
        end: cue.end - offset,
      }));
      const vtt = await readFile(path.join(root, "public", captions), "utf8");
      captions = captions.replace(/\.vtt$/, ".fixed.vtt");
      await writeFile(
        path.join(root, "public", captions),
        vtt.replace(
          /(\d{2}):(\d{2}:\d{2}\.\d{3})/g,
          (_, hours, rest) =>
            `${String(+hours - offset / 3600).padStart(2, "0")}:${rest}`,
        ),
      );
    }
    const id = stream ? youtubeId(stream.sourceUrl) : null;
    return {
      chapters: await chaptersFor(id),
      youtubeId: stream ? youtubeId(stream.sourceUrl) : null,
      mp4: mp4 ? mp4.sourceUrl.replace(/\.download$/, "") : null,
      captions,
      durationSeconds: cues.length ? Math.ceil(cues.at(-1).end) : 0,
      cues,
    };
  };
  const strip = ({ cues: _cues, ...rest }) => rest;
  const units = {};
  const report = [];
  for (let week = 0; week <= 10; week++) {
    const unitId = `week-${week}`;
    const overview = find(
      (m) => m.kind === "overview" && m.unitIds.includes(unitId),
    );
    const prefix = overview.title;
    const notes = find((m) => m.kind === "notes" && m.unitIds.includes(unitId));
    const lectureMedia = await media(prefix);
    const sections = splitNotes(
      JSON.parse(await readFile(local(notes), "utf8")),
    );
    const starts = alignSections(sections, lectureMedia.cues);
    // Which headings share a part is decided from the subtitle match and then frozen,
    // because the written practice is keyed by part. Only the times are refined below.
    const grouped = cutParts(sections, starts, lectureMedia.durationSeconds);
    const snapped = snapToChapters(sections, starts, lectureMedia.chapters);
    const timeOf = (heading) => snapped[sections.indexOf(heading)];
    const cuts = grouped.map((part, index) => {
      if (index === 0) return 0;
      const first = timeOf(part.headings[0]);
      if (first.exact) return first.start;
      const previous = timeOf(grouped[index - 1].headings.at(-1)).start;
      const next = part.headings[1]
        ? timeOf(part.headings[1]).start
        : lectureMedia.durationSeconds;
      return nearestChapter(first.start, lectureMedia.chapters, previous, next);
    });
    // A cut that would run backwards falls back to the subtitle match for that part.
    for (let index = 1; index < cuts.length; index++)
      if (cuts[index] <= cuts[index - 1] || cuts[index] >= lectureMedia.durationSeconds)
        cuts[index] = Math.max(grouped[index].start, cuts[index - 1] + 60);
    const parts = grouped.map((part, index) => ({
      id: `${unitId}-lecture-p${index + 1}`,
      title: partTitle(part.headings),
      start: cuts[index],
      end: cuts[index + 1] ?? lectureMedia.durationSeconds,
      headings: part.headings.map((heading, position) => ({
        id: heading.id,
        title: heading.title,
        words: heading.words,
        start:
          position === 0
            ? cuts[index]
            : timeOf(heading).exact
              ? timeOf(heading).start
              : Math.min(
                  Math.max(timeOf(heading).start, cuts[index]),
                  cuts[index + 1] ?? lectureMedia.durationSeconds,
                ),
        exact: timeOf(heading).exact || (index === 0 && position === 0),
      })),
    }));
    const sectionDoc = find(
      (m) =>
        m.kind === "section" &&
        m.unitIds.includes(unitId) &&
        / section$/.test(m.title),
    );
    const section = sectionDoc
      ? {
          id: `${unitId}-section`,
          title: sectionDoc.title,
          sourceUrl: sectionDoc.sourceUrl,
          documentId: sectionDoc.id,
          ...strip(await media(sectionDoc.title)),
        }
      : null;
    const shorts = [];
    for (const short of materials.filter(
      (m) => m.kind === "short" && m.unitIds.includes(unitId),
    )) {
      const slug = short.sourceUrl.replace(/\/$/, "").split("/").pop();
      shorts.push({
        id: `${unitId}-short-${slug.replaceAll("_", "-")}`,
        title: short.title,
        sourceUrl: short.sourceUrl,
        documentId: short.id,
        ...strip(await media(short.title)),
      });
    }
    units[unitId] = {
      lecture: {
        title: prefix,
        notesDocumentId: notes.id,
        notesSourceUrl: notes.sourceUrl,
        ...strip(lectureMedia),
        parts,
      },
      section,
      shorts,
    };
    report.push(
      `${unitId}: ${parts.length} parts [${parts
        .map((p) => `${Math.round(p.start / 60)}m`)
        .join(" ")}] of ${Math.round(lectureMedia.durationSeconds / 60)}m, ${
        sections.length
      } headings (${parts.flatMap((p) => p.headings).filter((h) => h.exact).length} on a CS50 chapter), ${lectureMedia.chapters.length} chapters, section ${section ? "yes" : "no"}, ${shorts.length} shorts`,
    );
  }
  await writeFile(chaptersFile, `${JSON.stringify(known, null, 1)}
`);
  await writeFile(
    path.join(courseDir, "flow.json"),
    `${JSON.stringify({ version: 1, edition: 2026, units }, null, 1)}\n`,
  );
  console.log(report.join("\n"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
